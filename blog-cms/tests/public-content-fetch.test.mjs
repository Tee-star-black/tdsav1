import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const script=path.resolve('scripts/fetch-public-content.mjs');

function runFetcher({origin,directory,token}){
  return new Promise((resolve,reject)=>{
    const env={...process.env,CMS_PUBLIC_API_URL:origin};
    if(token)env.CMS_PUBLIC_API_TOKEN=token;
    else delete env.CMS_PUBLIC_API_TOKEN;
    const child=spawn(process.execPath,[script],{cwd:directory,env,stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.on('data',chunk=>stdout+=chunk);
    child.stderr.on('data',chunk=>stderr+=chunk);
    child.on('error',reject);
    child.on('close',code=>resolve({code,stdout,stderr}));
  });
}

test('publishing fetch requires a private Cloud Run identity token when the service rejects anonymous requests',async()=>{
  const expectedToken='integration-test-private-token';
  const server=createServer((request,response)=>{
    if(request.url!=='/api/public/articles'){
      response.writeHead(404);response.end();return;
    }
    if(request.headers.authorization!==`Bearer ${expectedToken}`){
      response.writeHead(403);response.end('Not authorized');return;
    }
    response.writeHead(200,{'Content-Type':'application/json'});
    response.end(JSON.stringify({articles:[{title:'A verified Cloud SQL story',slug:'a-verified-cloud-sql-story'}]}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const directory=await mkdtemp(path.join(tmpdir(),'cms-federated-fetch-'));
  try{
    const unauthorized=await runFetcher({origin,directory});
    assert.notEqual(unauthorized.code,0);
    assert.match(unauthorized.stderr,/HTTP 403/);

    const authorized=await runFetcher({origin,directory,token:expectedToken});
    assert.equal(authorized.code,0,authorized.stderr);
    const data=JSON.parse(await readFile(path.join(directory,'content','articles.json'),'utf8'));
    assert.equal(data.articles.length,1);
    assert.equal(data.articles[0].slug,'a-verified-cloud-sql-story');
    assert.doesNotMatch(authorized.stdout, new RegExp(expectedToken));
  }finally{
    await new Promise(resolve=>server.close(resolve));
    await rm(directory,{recursive:true,force:true});
  }
});
