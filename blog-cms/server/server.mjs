import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRepository} from './repository.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
const siteRoot=path.resolve(cmsRoot,'..');

try{
  process.loadEnvFile(path.join(cmsRoot,'.env'));
}catch(error){
  if(error?.code!=='ENOENT')throw error;
}

const repo=createRepository();
const port=Number(process.env.PORT||8787);
const MAX_JSON_BYTES=9*1024*1024;
let scheduleSweepRunning=false;

const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};

function json(res,status,payload){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Cache-Control':'no-store'});
  res.end(JSON.stringify(payload));
}

function redirect(res,location,status=302){res.writeHead(status,{Location:location,'Cache-Control':'no-store'});res.end();}

async function body(req){
  const chunks=[];let total=0;
  for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw Object.assign(new Error('Request is too large.'),{statusCode:413});chunks.push(chunk);}
  if(!chunks.length)return {};
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(new Error('Request body must be valid JSON.'),{statusCode:400});}
}

async function api(req,res,url){
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end();}
  const parts=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);
  if(parts[0]==='health'&&req.method==='GET')return json(res,200,await repo.health());

  if(parts[0]==='articles'){
    if(parts.length===1&&req.method==='GET')return json(res,200,{articles:await repo.listArticles()});
    if(parts.length===1&&req.method==='POST')return json(res,201,{article:await repo.saveArticle(await body(req))});
    const id=decodeURIComponent(parts[1]||'');
    if(id&&req.method==='GET'){
      const article=await repo.getArticle(id);return article?json(res,200,{article}):json(res,404,{error:'Article not found.'});
    }
    if(id&&req.method==='PUT')return json(res,200,{article:await repo.saveArticle(await body(req),id)});
    if(id&&req.method==='DELETE')return json(res,200,await repo.deleteArticle(id));
  }

  if(parts[0]==='categories'){
    if(parts.length===1&&req.method==='GET')return json(res,200,{categories:await repo.listCategories()});
    if(parts.length===1&&req.method==='POST')return json(res,201,{category:await repo.createCategory((await body(req)).name)});
    if(parts[1]&&req.method==='DELETE')return json(res,200,await repo.deleteCategory(decodeURIComponent(parts[1])));
  }

  if(parts[0]==='media'){
    if(parts.length===1&&req.method==='GET')return json(res,200,{media:await repo.listMedia()});
    if(parts.length===1&&req.method==='POST')return json(res,201,{media:await repo.uploadMedia(await body(req))});
  }

  if(parts[0]==='public'&&parts[1]==='articles'){
    if(parts.length===2&&req.method==='GET')return json(res,200,{articles:await repo.listPublicArticles()});
    if(parts[2]&&req.method==='GET'){
      const article=await repo.getPublicArticleBySlug(decodeURIComponent(parts[2]));
      return article?json(res,200,{article}):json(res,404,{error:'Published article not found.'});
    }
  }

  return json(res,404,{error:'API route not found.'});
}

function publicFeed(articles){
  return articles.map(({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage})=>({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage}));
}

async function devBlog(req,res,url){
  if(req.method!=='GET')return false;
  if(url.pathname==='/blog')return redirect(res,'/blog/'),true;
  if(url.pathname==='/blog/' ){await serveFile(res,path.join(cmsRoot,'public-preview','index.html'));return true;}
  if(url.pathname==='/blog/feed.json'){
    const articles=publicFeed(await repo.listPublicArticles());json(res,200,{generatedAt:new Date().toISOString(),articles});return true;
  }
  if(url.pathname==='/blog/search-index.json'){
    json(res,200,publicFeed(await repo.listPublicArticles()));return true;
  }
  const match=url.pathname.match(/^\/blog\/([^/]+)\/?$/);
  if(match){
    if(!url.pathname.endsWith('/'))return redirect(res,`${url.pathname}/`),true;
    const article=await repo.getPublicArticleBySlug(decodeURIComponent(match[1]));
    if(!article){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Published article not found');return true;}
    await serveFile(res,path.join(cmsRoot,'public-preview','article.html'));return true;
  }
  return false;
}

async function publishDueScheduled(){
  if(scheduleSweepRunning)return;
  scheduleSweepRunning=true;
  try{
    const now=Date.now();
    const due=(await repo.listArticles()).filter(article=>article.status==='Scheduled'&&article.scheduledAt&&new Date(article.scheduledAt).getTime()<=now);
    for(const article of due){
      try{await repo.saveArticle({...article,status:'Published',scheduledAt:''},article.id);console.log(`Published scheduled article: ${article.slug}`);}catch(error){console.error(`Scheduled publication blocked for ${article.slug}:`,error.message);}
    }
  }finally{scheduleSweepRunning=false;}
}

async function serveFile(res,filePath){
  try{
    const info=await stat(filePath);if(info.isDirectory())filePath=path.join(filePath,'index.html');
    const data=await readFile(filePath);res.writeHead(200,{'Content-Type':MIME[path.extname(filePath).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
}

function safeResolve(base,relative){const target=path.resolve(base,'.'+relative);return target===base||target.startsWith(base+path.sep)?target:null;}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||'127.0.0.1'}`);
    if(url.pathname.startsWith('/api/'))return await api(req,res,url);
    if(url.pathname==='/')return redirect(res,'/prototype/');
    if(await devBlog(req,res,url))return;
    if(url.pathname==='/prototype')return redirect(res,'/prototype/');
    if(url.pathname==='/public-preview')return redirect(res,'/public-preview/');
    if(url.pathname.startsWith('/uploads/'))return serveFile(res,path.join(cmsRoot,'server',url.pathname));
    if(url.pathname.startsWith('/prototype/')){const target=safeResolve(path.join(cmsRoot,'prototype'),url.pathname.replace('/prototype',''));return target?serveFile(res,target):json(res,400,{error:'Invalid path.'});}
    if(url.pathname.startsWith('/public-preview/')){const target=safeResolve(path.join(cmsRoot,'public-preview'),url.pathname.replace('/public-preview',''));return target?serveFile(res,target):json(res,400,{error:'Invalid path.'});}
    if(url.pathname.startsWith('/client/')){const target=safeResolve(path.join(cmsRoot,'client'),url.pathname.replace('/client',''));return target?serveFile(res,target):json(res,400,{error:'Invalid path.'});}
    const siteTarget=safeResolve(siteRoot,url.pathname);if(siteTarget)return serveFile(res,siteTarget);
    res.writeHead(404);res.end('Not found');
  }catch(error){console.error(error);json(res,error.statusCode||500,{error:error.message||'Unexpected server error.',details:error.details||[]});}
});

server.listen(port,'127.0.0.1',()=>{
  console.log(`TeleDoctorSA Blog CMS running on http://127.0.0.1:${port}/prototype/`);
  console.log(`Backend: ${repo.backendName}`);
  console.log(`Public blog: http://127.0.0.1:${port}/blog/`);
  publishDueScheduled().catch(console.error);
});
setInterval(()=>publishDueScheduled().catch(console.error),30000).unref();
