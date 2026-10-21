import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('server publishes due stories at startup, protects CMS data and rejects missing updates',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'cms-server-'));
  const data=JSON.parse(await readFile('data/seed.json','utf8'));
  data.articles[0]={...data.articles[0],status:'Scheduled',publishedAt:'',scheduledAt:'2020-01-01T00:00:00Z'};
  const store=path.join(directory,'store.json');await writeFile(store,JSON.stringify(data));
  const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'8802',NODE_ENV:'test',CMS_BACKEND:'local',CMS_AUTH_BACKEND:'file',CMS_AUTH_FILE:path.join(directory,'auth.json'),CMS_ACCESS_TOKEN:'test-access',CMS_LOCAL_STORE:store,CMS_DEPLOY_WEBHOOK_URL:''},stdio:'pipe'});
  const origin='http://127.0.0.1:8802';
  try{
    let published=false;
    for(let i=0;i<80;i++){
      try{const response=await fetch(origin+'/api/public/articles/'+data.articles[0].slug);if(response.ok){published=true;break;}}catch{}
      await new Promise(r=>setTimeout(r,50));
    }
    assert.ok(published,'due scheduled article should publish when the worker starts');
    assert.equal((await fetch(origin+'/api/articles')).status,401);
    assert.equal((await fetch(origin+'/blog-cms/data/store.local.json')).status,404);
    assert.equal((await fetch(origin+'/blog-cms/.env')).status,404);
    assert.equal((await fetch(origin+'/.git/config')).status,404);
    assert.equal((await fetch(origin+'/api/articles/not-real',{method:'PUT',headers:{Authorization:'Bearer test-access','Content-Type':'application/json'},body:JSON.stringify({title:'Should not recreate',status:'Draft'})})).status,404);
  }finally{child.kill();await new Promise(r=>child.once('exit',r));await rm(directory,{recursive:true,force:true});}
});
