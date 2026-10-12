import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual} from 'node:crypto';
import {createAuthStore} from './auth-factory.mjs';
import {createRepository} from './repository.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
const siteRoot=path.resolve(cmsRoot,'..');

try{
  process.loadEnvFile(path.join(cmsRoot,'.env'));
}catch(error){
  if(error?.code!=='ENOENT')throw error;
}

function assertProductionConfiguration(){
  if(process.env.NODE_ENV!=='production')return;
  const required={
    CMS_BACKEND:'postgres',
    CMS_AUTH_BACKEND:'postgres',
    CMS_MEDIA_BACKEND:'gcs',
    CMS_COOKIE_SECURE:'true',
    CMS_SCHEDULE_WORKER_ENABLED:'false'
  };
  for(const [key,value] of Object.entries(required)){
    if(String(process.env[key]||'').toLowerCase()!==value){
      throw new Error(`Production configuration requires ${key}=${value}.`);
    }
  }
  for(const key of ['CMS_ACCESS_TOKEN']){
    if(String(process.env[key]||'').trim())throw new Error(`Production configuration prohibits ${key}.`);
  }
  for(const key of ['PGDATABASE','PGUSER','GCS_BUCKET','CMS_INTERNAL_TOKEN','CMS_PUBLIC_ORIGIN']){
    if(!String(process.env[key]||'').trim())throw new Error(`Production configuration requires ${key}.`);
  }
  if(!process.env.DATABASE_URL&&!process.env.PGPASSWORD){
    throw new Error('Production database credentials are missing.');
  }
}
assertProductionConfiguration();

const repo=createRepository();
const port=Number(process.env.PORT||8790);
const host=process.env.CMS_HOST||'127.0.0.1';
const MAX_JSON_BYTES=9*1024*1024;
const accessToken=String(process.env.CMS_ACCESS_TOKEN||'');
const auth=createAuthStore();
const allowedOrigins=String(process.env.CMS_ALLOWED_ORIGINS||'')
  .split(',')
  .map(value=>value.trim())
  .filter(Boolean);
const deployWebhook=String(process.env.CMS_DEPLOY_WEBHOOK_URL||'').trim();
const deployWebhookToken=String(process.env.CMS_DEPLOY_WEBHOOK_TOKEN||'').trim();
const internalToken=String(process.env.CMS_INTERNAL_TOKEN||'').trim();
const scheduleWorkerEnabled=String(process.env.CMS_SCHEDULE_WORKER_ENABLED||'true').toLowerCase()!=='false';
let scheduleSweepRunning=false;
const loginAttempts=new Map();
function loginRateLimited(req){
  const key=String(req.socket?.remoteAddress||'unknown');
  const now=Date.now(),entry=loginAttempts.get(key);
  if(!entry||now-entry.startedAt>15*60*1000){loginAttempts.set(key,{startedAt:now,count:1});return false;}
  if(entry.count>=10)return true;
  entry.count++;
  return false;
}
function hasSafeWriteOrigin(req){
  if(process.env.NODE_ENV!=='production')return true;
  const origin=String(req.headers.origin||'');
  const fetchSite=String(req.headers['sec-fetch-site']||'');
  // A browser session mutation must be same-origin. No Origin is accepted only
  // for non-browser clients without a cross-site Fetch Metadata indication.
  if(fetchSite==='cross-site')return false;
  if(!origin)return true;
  const configuredOrigin=String(process.env.CMS_PUBLIC_ORIGIN||'').trim();
  return Boolean(configuredOrigin)&&origin===configuredOrigin;
}


const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};

function originHeaders(req){
  const origin=String(req?.headers?.origin||'');
  if(!origin)return {};
  if(allowedOrigins.length===0)return {};
  if(!allowedOrigins.includes(origin))return {};
  return {'Access-Control-Allow-Origin':origin,'Vary':'Origin'};
}

function json(req,res,status,payload){
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    ...originHeaders(req),
    'Access-Control-Allow-Headers':'Content-Type, Authorization',
    'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
    'Cache-Control':'no-store'
  });
  res.end(JSON.stringify(payload));
}

function redirect(res,location,status=302){res.writeHead(status,{Location:location,'Cache-Control':'no-store'});res.end();}

function secretMatches(expectedValue,candidate){
  const expected=Buffer.from(String(expectedValue||''));
  const actual=Buffer.from(String(candidate||''));
  return expected.length===actual.length&&expected.length>0&&timingSafeEqual(expected,actual);
}
function tokenMatches(candidate){return secretMatches(accessToken,candidate);}

function isAuthorized(req){
  if(!accessToken)return true;
  const header=String(req.headers.authorization||'');
  if(!header.startsWith('Bearer '))return false;
  return tokenMatches(header.slice(7));
}

async function currentCmsUser(req){
  const sessionUser=await auth.sessionUserFromRequest(req);
  if(sessionUser)return sessionUser;
  const hasUsers=await auth.hasUsers();
  if(accessToken&&isAuthorized(req))return {id:'legacy-token',name:'Legacy CMS Access',email:'',role:'admin',legacy:true};
  if(!hasUsers&&!accessToken)return {id:'development',name:'Local Development',email:'',role:'admin',development:true};
  return null;
}

async function requireCmsAccess(req,res){
  const user=await currentCmsUser(req);
  if(user)return user;
  json(req,res,401,{error:'CMS sign-in is required.'});
  return null;
}

function requireRole(user,res,req,roles){
  if(user&&roles.includes(user.role))return true;
  json(req,res,403,{error:'You do not have permission to perform this action.'});
  return false;
}

async function body(req){
  const chunks=[];let total=0;
  for await(const chunk of req){
    total+=chunk.length;
    if(total>MAX_JSON_BYTES)throw Object.assign(new Error('Request is too large.'),{statusCode:413});
    chunks.push(chunk);
  }
  if(!chunks.length)return {};
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  catch{throw Object.assign(new Error('Request body must be valid JSON.'),{statusCode:400});}
}

async function triggerDeploy(reason){
  if(!deployWebhook)return {configured:false};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const githubDispatch=/^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/dispatches(?:\?.*)?$/.test(deployWebhook);
    const payload={source:'teledoctorsa-blog-cms',reason,at:new Date().toISOString()};
    const response=await fetch(deployWebhook,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        ...(githubDispatch?{'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}:{}),
        ...(deployWebhookToken?{'Authorization':`Bearer ${deployWebhookToken}`}:{})
      },
      body:JSON.stringify(githubDispatch?{event_type:'blog_publish',client_payload:payload}:payload),
      signal:controller.signal
    });
    if(!response.ok)throw new Error(`Deploy webhook returned HTTP ${response.status}.`);
    console.log(`Triggered blog deployment: ${reason}`);
    return {configured:true,ok:true};
  }catch(error){
    console.error('Blog deploy webhook failed:',error.message);
    return {configured:true,ok:false,error:error.message};
  }finally{
    clearTimeout(timeout);
  }
}

async function api(req,res,url){
  if(req.method==='OPTIONS'){
    const headers=originHeaders(req);
    if(req.headers.origin&&allowedOrigins.length&&Object.keys(headers).length===0)return json(req,res,403,{error:'Origin not allowed.'});
    res.writeHead(204,{
      ...headers,
      'Access-Control-Allow-Headers':'Content-Type, Authorization',
      'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'
    });
    return res.end();
  }

  const parts=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);
  if(parts[0]==='health'&&req.method==='GET'){
    return json(req,res,200,{...(await repo.health()),studioBuild:'2026.09.24.1',authBackend:auth.backendName||'file',authRequired:(await auth.hasUsers())||Boolean(accessToken),deployWebhookConfigured:Boolean(deployWebhook)});
  }

  if(parts[0]==='auth'&&parts[1]==='login'&&req.method==='POST'){
    if(loginRateLimited(req))return json(req,res,429,{error:'Too many sign-in attempts. Try again later.'});
    const input=await body(req);
    const user=await auth.authenticate(input.email,input.password);
    if(!user)return json(req,res,401,{error:'Email or password is incorrect.'});
    const session=await auth.createSession(user.id);
    res.setHeader('Set-Cookie',auth.sessionCookie(session.token,Number(process.env.CMS_SESSION_HOURS||12)*3600));
    return json(req,res,200,{user});
  }

  if(parts[0]==='auth'&&parts[1]==='logout'&&req.method==='POST'){
    await auth.destroySessionFromRequest(req);
    res.setHeader('Set-Cookie',auth.clearCookie());
    return json(req,res,200,{ok:true});
  }

  if(parts[0]==='auth'&&parts[1]==='me'&&req.method==='GET'){
    const user=await currentCmsUser(req);
    return user?json(req,res,200,{user}):json(req,res,401,{error:'CMS sign-in is required.'});
  }

  if(parts[0]==='internal'&&parts[1]==='publish-due'&&req.method==='POST'){
    if(!internalToken||!secretMatches(internalToken,req.headers['x-cms-internal-token']))return json(req,res,401,{error:'Internal scheduler authentication failed.'});
    const published=await publishDueScheduled();
    return json(req,res,200,{ok:true,published});
  }

  if(parts[0]==='public'&&parts[1]==='articles'){
    if(parts.length===2&&req.method==='GET')return json(req,res,200,{articles:await repo.listPublicArticles()});
    if(parts[2]&&req.method==='GET'){
      const article=await repo.getPublicArticleBySlug(decodeURIComponent(parts[2]));
      return article?json(req,res,200,{article}):json(req,res,404,{error:'Published article not found.'});
    }
  }

  const cmsUser=await requireCmsAccess(req,res);
  if(!cmsUser)return;

  if(parts[0]==='users'){
    if(parts.length===1&&req.method==='GET'){
      if(!requireRole(cmsUser,res,req,['admin']))return;
      return json(req,res,200,{users:await auth.listUsers()});
    }
    if(parts.length===1&&req.method==='POST'){
      if(!requireRole(cmsUser,res,req,['admin']))return;
      const input=await body(req);
      const result=await auth.createUser(input);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'user.create',entityType:'user',entityId:result.user.id,metadata:{email:result.user.email,role:result.user.role}});
      return json(req,res,201,result);
    }
    if(parts[1]&&parts[2]==='reset-password'&&req.method==='POST'){
      if(!requireRole(cmsUser,res,req,['admin']))return;
      const id=decodeURIComponent(parts[1]);
      const result=await auth.resetPassword(id);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'user.password_reset',entityType:'user',entityId:id});
      return json(req,res,200,result);
    }
    if(parts[1]&&req.method==='DELETE'){
      if(!requireRole(cmsUser,res,req,['admin']))return;
      const id=decodeURIComponent(parts[1]);const result=await auth.deleteUser(id,cmsUser.id);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'user.delete',entityType:'user',entityId:id});
      return json(req,res,200,result);
    }
  }

  if(parts[0]==='auth'&&parts[1]==='password'&&req.method==='POST'){
    if(cmsUser.legacy)return json(req,res,400,{error:'Password changes are unavailable for legacy token access.'});
    const input=await body(req);
    const result=await auth.changePassword(cmsUser.id,input.currentPassword,input.newPassword);
    await repo.recordAudit?.({actorUserId:cmsUser.id,action:'user.password_change',entityType:'user',entityId:cmsUser.id});
    await auth.destroySessionFromRequest(req);
    res.setHeader('Set-Cookie',auth.clearCookie());
    return json(req,res,200,result);
  }

  if(parts[0]==='articles'){
    if(parts.length===1&&req.method==='GET')return json(req,res,200,{articles:await repo.listArticles()});
    if(parts.length===1&&req.method==='POST'){
      const input=await body(req);
      if(['Published','Scheduled'].includes(input.status)&&!requireRole(cmsUser,res,req,['admin','reviewer']))return;
      const article=await repo.saveArticle({...input,actorUserId:cmsUser.id});
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'article.create',entityType:'article',entityId:article.id,metadata:{slug:article.slug,status:article.status}});
      const delivery=article.status==='Published'?await triggerDeploy(`article-published:${article.slug}`):null;
      return json(req,res,201,{article,delivery});
    }

    const id=decodeURIComponent(parts[1]||'');
    if(id&&req.method==='GET'){
      const article=await repo.getArticle(id);
      return article?json(req,res,200,{article}):json(req,res,404,{error:'Article not found.'});
    }
    if(id&&req.method==='PUT'){
      const before=await repo.getArticle(id);
      if(!before)return json(req,res,404,{error:'Article not found.'});
      const input=await body(req);
      if((['Published','Scheduled'].includes(input.status)||before.status==='Published')&&!requireRole(cmsUser,res,req,['admin','reviewer']))return;
      const article=await repo.saveArticle({...input,actorUserId:cmsUser.id},id);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'article.update',entityType:'article',entityId:article.id,metadata:{slug:article.slug,status:article.status,previousStatus:before.status}});
      const delivery=article.status==='Published'||before?.status==='Published'?await triggerDeploy(`article-updated:${article.slug}`):null;
      return json(req,res,200,{article,delivery});
    }
    if(id&&req.method==='DELETE'){
      if(!requireRole(cmsUser,res,req,['admin']))return;
      const before=await repo.getArticle(id);
      if(!before)return json(req,res,404,{error:'Article not found.'});
      const result=await repo.deleteArticle(id);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'article.delete',entityType:'article',entityId:id,metadata:{slug:before.slug,title:before.title}});
      const delivery=before?.status==='Published'?await triggerDeploy(`article-deleted:${before.slug}`):null;
      return json(req,res,200,{...result,delivery});
    }
  }

  if(parts[0]==='categories'){
    if(parts.length===1&&req.method==='GET')return json(req,res,200,{categories:await repo.listCategories()});
    if(parts.length===1&&req.method==='POST'){
      const category=await repo.createCategory((await body(req)).name);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'category.create',entityType:'category',entityId:category.id,metadata:{name:category.name}});
      return json(req,res,201,{category});
    }
    if(parts[1]&&req.method==='DELETE'){
      const id=decodeURIComponent(parts[1]);const result=await repo.deleteCategory(id);
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'category.delete',entityType:'category',entityId:id});
      return json(req,res,200,result);
    }
  }

  if(parts[0]==='media'){
    if(parts.length===1&&req.method==='GET')return json(req,res,200,{media:await repo.listMedia()});
    if(parts.length===1&&req.method==='POST'){
      const media=await repo.uploadMedia(await body(req));
      await repo.recordAudit?.({actorUserId:cmsUser.id,action:'media.upload',entityType:'media',entityId:media.id,metadata:{name:media.name}});
      return json(req,res,201,{media});
    }
  }

  return json(req,res,404,{error:'API route not found.'});
}

function publicFeed(articles){
  return articles.map(({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage})=>({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage}));
}

async function devBlog(req,res,url){
  if(req.method!=='GET')return false;
  if(url.pathname==='/blog')return redirect(res,'/blog/'),true;
  if(url.pathname==='/blog/' ){await serveFile(res,path.join(cmsRoot,'public-preview','index.html'));return true;}
  if(url.pathname==='/blog/feed.json'){
    const articles=publicFeed(await repo.listPublicArticles());
    json(req,res,200,{generatedAt:new Date().toISOString(),articles});
    return true;
  }
  if(url.pathname==='/blog/search-index.json'){
    json(req,res,200,publicFeed(await repo.listPublicArticles()));
    return true;
  }
  const match=url.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if(match){
    if(!url.pathname.endsWith('/'))return redirect(res,`${url.pathname}/`),true;
    const article=await repo.getPublicArticleBySlug(decodeURIComponent(match[1]));
    if(!article){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Published article not found');return true;}
    await serveFile(res,path.join(cmsRoot,'public-preview','article.html'));
    return true;
  }
  return false;
}

async function publishDueScheduled(){
  if(scheduleSweepRunning)return 0;
  scheduleSweepRunning=true;
  let publishedCount=0;
  try{
    const now=Date.now();
    const due=(await repo.listArticles()).filter(article=>article.status==='Scheduled'&&article.scheduledAt&&new Date(article.scheduledAt).getTime()<=now);
    for(const article of due){
      try{
        const published=await repo.saveArticle({...article,status:'Published',scheduledAt:'',actorUserId:'system'},article.id);
        await repo.recordAudit?.({actorUserId:'system',action:'article.scheduled_publish',entityType:'article',entityId:published.id,metadata:{slug:published.slug}});
        publishedCount++;
        console.log(`Published scheduled article: ${published.slug}`);
        void triggerDeploy(`scheduled-article-published:${published.slug}`);
      }catch(error){
        console.error(`Scheduled publication blocked for ${article.slug}:`,error.message);
      }
    }
    return publishedCount;
  }finally{
    scheduleSweepRunning=false;
  }
}

async function serveFile(res,filePath){
  try{
    const info=await stat(filePath);
    if(info.isDirectory())filePath=path.join(filePath,'index.html');
    const data=await readFile(filePath);
    res.writeHead(200,{'Content-Type':MIME[path.extname(filePath).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  }catch{
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
}

function safeResolve(base,relative){
  const target=path.resolve(base,'.'+relative);
  return target===base||target.startsWith(base+path.sep)?target:null;
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||'127.0.0.1'}`);
    if(url.pathname.startsWith('/api/'))return await api(req,res,url);
    if(url.pathname==='/')return redirect(res,'/prototype/');
    if(await devBlog(req,res,url))return;
    if(url.pathname==='/prototype')return redirect(res,'/prototype/');
    if(url.pathname==='/public-preview')return redirect(res,'/public-preview/');
    if(url.pathname.startsWith('/uploads/'))return serveFile(res,path.join(cmsRoot,'server',url.pathname));
    if(url.pathname.startsWith('/prototype/')){
      const target=safeResolve(path.join(cmsRoot,'prototype'),url.pathname.replace('/prototype',''));
      return target?serveFile(res,target):json(req,res,400,{error:'Invalid path.'});
    }
    if(url.pathname.startsWith('/public-preview/')){
      const target=safeResolve(path.join(cmsRoot,'public-preview'),url.pathname.replace('/public-preview',''));
      return target?serveFile(res,target):json(req,res,400,{error:'Invalid path.'});
    }
    if(url.pathname.startsWith('/client/')){
      const target=safeResolve(path.join(cmsRoot,'client'),url.pathname.replace('/client',''));
      return target?serveFile(res,target):json(req,res,400,{error:'Invalid path.'});
    }
    if(url.pathname.split('/').some(segment=>segment.startsWith('.'))||url.pathname.startsWith('/blog-cms/'))return json(req,res,404,{error:'Not found.'});
    const siteTarget=safeResolve(siteRoot,url.pathname);
    if(siteTarget)return serveFile(res,siteTarget);
    res.writeHead(404);
    res.end('Not found');
  }catch(error){
    console.error(error);
    json(req,res,error.statusCode||500,{error:error.message||'Unexpected server error.',details:error.details||[]});
  }
});

server.listen(port,host,()=>{
  console.log(`TeleDoctorSA Blog CMS running on http://${host}:${port}/prototype/`);
  console.log(`Backend: ${repo.backendName}`);
  console.log(`Auth backend: ${auth.backendName||'file'}`);
  auth.hasUsers().then(hasUsers=>console.log(`CMS auth: ${hasUsers?'staff accounts enabled':accessToken?'legacy token enabled':'disabled (development mode)'}`)).catch(console.error);
  console.log(`Public blog: http://${host}:${port}/blog/`);
  publishDueScheduled().catch(console.error);
});
if(scheduleWorkerEnabled)setInterval(()=>publishDueScheduled().catch(console.error),30000).unref();

