/**
 * Real Chromium viewport QA for the Publishing Studio and both public blog routes.
 * Execute from blog-cms, after generating the static blog.
 */
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const cmsRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const siteRoot=path.resolve(cmsRoot,'..');
const shotDir=path.join(cmsRoot,'qa-screenshots');
const scratch=await mkdtemp(path.join(tmpdir(),'tdsa-browser-qa-'));
const cmsPort=8818;
const cmsBase='http://127.0.0.1:'+cmsPort;
const viewports=[360,390,768,1024,1440];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
const failures=[];
let browser,staticServer,cmsChild;

function fail(message){throw new Error(message);}
async function startCms(){
  cmsChild=spawn(process.execPath,['server/server.mjs'],{
    cwd:cmsRoot,
    env:{...process.env,PORT:String(cmsPort),CMS_HOST:'127.0.0.1',NODE_ENV:'development',CMS_BACKEND:'local',CMS_AUTH_BACKEND:'file',CMS_ACCESS_TOKEN:'',CMS_LOCAL_STORE:path.join(scratch,'cms.json'),CMS_SCHEDULE_WORKER_ENABLED:'false'},
    stdio:'pipe'
  });
  let stderr='';
  cmsChild.stderr.on('data',chunk=>stderr+=String(chunk));
  for(let tries=0;tries<90;tries++){
    if(cmsChild.exitCode!==null)fail('CMS quit unexpectedly: '+stderr.slice(-1800));
    try{if((await fetch(cmsBase+'/api/health')).ok)return;}catch{}
    await new Promise(r=>setTimeout(r,150));
  }
  fail('CMS health endpoint timed out: '+stderr.slice(-1800));
}
async function startStatic(){
  staticServer=createServer(async(req,res)=>{
    try{
      const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(requested.includes('\0')){res.writeHead(400);res.end();return;}
      let file=path.resolve(siteRoot,'.'+requested);
      if(!file.startsWith(siteRoot+path.sep)){res.writeHead(403);res.end();return;}
      if(requested.endsWith('/')||!path.extname(file))file=path.join(file,'index.html');
      const content=await readFile(file);
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
      res.end(content);
    }catch{res.writeHead(404);res.end('Missing asset');}
  });
  await new Promise((resolve,reject)=>{staticServer.once('error',reject);staticServer.listen(0,'127.0.0.1',resolve);});
  return 'http://127.0.0.1:'+staticServer.address().port;
}
function browserExecutable(){
  if(process.env.CHROME_BIN)return process.env.CHROME_BIN;
  for(const name of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){
    try{return execFileSync('which',[name],{encoding:'utf8'}).trim();}catch{}
  }
  return chromium.executablePath();
}
async function checkOverflow(page,label){
  const info=await page.evaluate(()=>({
    viewport:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth,
    offenders:[...document.body.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.right>innerWidth+3&&r.left<innerWidth;}).slice(0,8).map(el=>({tag:el.tagName,id:el.id,className:typeof el.className==='string'?el.className:'',right:Math.round(el.getBoundingClientRect().right)}))
  }));
  assert.ok(Math.max(info.body,info.root)<=info.viewport+2,label+': horizontal overflow '+JSON.stringify(info));
}
async function checkVisibleBounds(page,selector,label){
  const bounds=await page.locator(selector).first().evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,right:r.right,width:r.width,viewport:innerWidth};
  });
  assert.ok(bounds.width>0,label+': missing/hidden '+selector);
  assert.ok(bounds.left>=-2&&bounds.right<=bounds.viewport+2,label+': '+selector+' extends beyond viewport '+JSON.stringify(bounds));
}
async function makePage(width){
  const context=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error.message||error)));
  return {context,page,errors};
}
async function studio(width){
  const {context,page,errors}=await makePage(width);
  try{
    await page.goto(cmsBase+'/prototype/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#backendStatus')?.classList.contains('online'));
    await checkOverflow(page,'Studio '+width);
    await checkVisibleBounds(page,'.content','Studio '+width);
    await checkVisibleBounds(page,'#articlesView .welcome .primary','New article action '+width);
    const svgWidth=await page.locator('#articlesView .welcome .primary svg').evaluate(el=>el.getBoundingClientRect().width);
    assert.ok(svgWidth<=24,'Action icon must remain compact, got '+svgWidth+' px');
    assert.equal(await page.locator('#loginGate').isVisible(),false,'Local dev should not be locked');
    if(width<=1100){
      await page.locator('#menuBtn').click();
      await page.waitForFunction(()=>document.querySelector('#sidebar').getBoundingClientRect().left>=-2);
      assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true');
      await checkVisibleBounds(page,'#sidebar','Opened sidebar '+width);
      await page.locator('#sidebarBackdrop').click({position:{x:Math.min(width-18,330),y:370}});
      assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');
      await page.locator('#menuBtn').click();
      await page.locator('#sidebar .nav-item[data-view="media"]').click();
      assert.equal(await page.locator('#mediaView').isVisible(),true);
      assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');
      await page.locator('#menuBtn').click();
      await page.locator('#sidebar .nav-item[data-view="articles"]').click();
    }else{
      assert.equal(await page.locator('#sidebar').isVisible(),true);
    }
    await page.screenshot({path:path.join(shotDir,'studio-'+width+'.png'),fullPage:true,animations:'disabled'});
    await page.locator('#articlesView .welcome [data-action="new"]').click();
    assert.equal(await page.locator('#editorDialog').isVisible(),true);
    await checkVisibleBounds(page,'#editorDialog','Editor '+width);
    await checkVisibleBounds(page,'#saveArticle','Editor save '+width);
    if(width===390)await page.screenshot({path:path.join(shotDir,'studio-editor-390.png'),fullPage:false,animations:'disabled'});
    await page.locator('#closeEditor').click();
    assert.equal(await page.locator('#editorDialog').isVisible(),false);
    assert.deepEqual(errors,[],'Studio '+width+' browser errors');
    console.log('PASS Studio',width);
  }finally{await context.close();}
}
async function publicPreview(width){
  const {context,page,errors}=await makePage(width);
  try{
    await page.goto(cmsBase+'/public-preview/',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#storyGrid .story-card',{timeout:20000});
    await checkOverflow(page,'Public preview '+width);
    assert.equal(await page.locator('.site-header nav a:visible').count(),4,'All public navigation links should remain reachable');
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(shotDir,'cms-preview-'+width+'.png'),fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'Public preview '+width+' browser errors');
    console.log('PASS CMS preview',width);
  }finally{await context.close();}
}
async function staticBlog(width,base){
  const {context,page,errors}=await makePage(width);
  try{
    await page.goto(base+'/blog/',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.story-card');
    await checkOverflow(page,'Static blog '+width);
    assert.equal(await page.locator('.site-header nav a:visible').count(),4,'Public links must not disappear on mobile');
    const num=await page.locator('.story-card:visible').count();
    assert.ok(num>=1,'Static blog should render published articles');
    await page.locator('#blogSearch').fill('unmatched query keyword zzxwyq');
    assert.equal(await page.locator('.story-card:visible').count(),0,'Blog search filters stories');
    await page.locator('#blogSearch').fill('');
    assert.equal(await page.locator('.story-card:visible').count(),num,'Clearing search restores stories');
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(shotDir,'blog-'+width+'.png'),fullPage:true,animations:'disabled'});
    await page.goto(base+'/blog/telemedicine-improves-access-to-care/',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('.article-copy p');
    await checkOverflow(page,'Static article '+width);
    await checkVisibleBounds(page,'.article-copy','Article body '+width);
    assert.ok((await page.locator('h1').first().innerText()).includes('Telemedicine'),'Expected seeded article title');
    await page.screenshot({path:path.join(shotDir,'article-'+width+'.png'),fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'Static blog '+width+' browser errors');
    console.log('PASS Public blog and article',width);
  }finally{await context.close();}
}
try{
  await mkdir(shotDir,{recursive:true});
  await startCms();
  const base=await startStatic();
  browser=await chromium.launch({executablePath:browserExecutable(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const width of viewports){
    for(const [name,fn] of [['Studio',()=>studio(width)],['Static blog',()=>staticBlog(width,base)]]){
      try{await fn();}catch(error){failures.push(name+' '+width+': '+(error.stack||error));console.error('FAIL',name,width,error.message);}
    }
    if(width===390||width===1440){
      try{await publicPreview(width);}catch(error){failures.push('Preview '+width+': '+(error.stack||error));console.error('FAIL Preview',width,error.message);}
    }
  }
  if(failures.length)fail(failures.length+' responsive browser checks failed:\n'+failures.join('\n\n'));
  console.log('PASS browser responsiveness at '+viewports.join(', ')+' pixels');
}finally{
  if(browser)await browser.close();
  if(staticServer)await new Promise(resolve=>staticServer.close(resolve));
  if(cmsChild){cmsChild.kill();await new Promise(resolve=>{if(cmsChild.exitCode!==null||cmsChild.signalCode!==null)return resolve();cmsChild.once('close',resolve);});}
  await rm(scratch,{recursive:true,force:true});
}
