import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {AuthStore} from '../server/auth.mjs';

test('staff account login uses an HttpOnly session and logout invalidates it',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'cms-auth-'));
  const authFile=path.join(directory,'auth.json');
  const auth=new AuthStore({filePath:authFile});
  await auth.createUser({email:'editor@teledoctorsa.co.za',name:'Editorial User',role:'editor',password:'TestingPassword123!'});
  const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'8804',CMS_BACKEND:'local',CMS_ACCESS_TOKEN:'',CMS_INTERNAL_TOKEN:'local-test-internal-token',CMS_AUTH_FILE:authFile,CMS_DEPLOY_WEBHOOK_URL:''},stdio:'pipe'});
  const origin='http://127.0.0.1:8804';
  try{
    let ready=false;
    for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
    assert.ok(ready);
    assert.equal((await fetch(origin+'/api/articles')).status,401);
    // Database readiness must never be public, and local storage is not PostgreSQL.
    const noTokenReady=await fetch(origin+'/api/internal/db-ready');
    assert.equal(noTokenReady.status,401);
    const wrongTokenReady=await fetch(origin+'/api/internal/db-ready',{headers:{'x-cms-internal-token':'incorrect'}});
    assert.equal(wrongTokenReady.status,401);
    const localReady=await fetch(origin+'/api/internal/db-ready',{headers:{'x-cms-internal-token':'local-test-internal-token'}});
    assert.equal(localReady.status,503);
    assert.deepEqual(await localReady.json(),{ok:false});

    const bad=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'editor@teledoctorsa.co.za',password:'wrong-password'})});
    assert.equal(bad.status,401);

    const login=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'editor@teledoctorsa.co.za',password:'TestingPassword123!'})});
    assert.equal(login.status,200);
    const setCookie=login.headers.get('set-cookie')||'';
    assert.match(setCookie,/tdsa_cms_session=/);
    assert.match(setCookie,/HttpOnly/i);
    const cookie=setCookie.split(';')[0];

    const me=await fetch(origin+'/api/auth/me',{headers:{Cookie:cookie}});
    assert.equal(me.status,200);
    const user=(await me.json()).user;
    assert.equal(user.email,'editor@teledoctorsa.co.za');
    assert.equal(user.role,'editor');

    assert.equal((await fetch(origin+'/api/articles',{headers:{Cookie:cookie}})).status,200);

    const reset=await auth.resetPassword(user.id);
    assert.ok(reset.temporaryPassword);
    assert.equal(await auth.sessionUserFromRequest({headers:{cookie}}),null);
    const replacementUser=await auth.authenticate('editor@teledoctorsa.co.za',reset.temporaryPassword);
    assert.equal(replacementUser.id,user.id);

    const replacementSession=await auth.createSession(user.id);
    const replacementCookie=`tdsa_cms_session=${replacementSession.token}`;

    const users=await fetch(origin+'/api/users',{headers:{Cookie:replacementCookie}});
    assert.equal(users.status,403);
    // A signed-in editor must never manage staff, publish, delete, or administer categories.
    const denialCases=[
      ['/api/articles','POST',JSON.stringify({title:'Unauthorized publication',status:'Published'})],
      ['/api/articles/unowned','DELETE',undefined],
      ['/api/categories','POST',JSON.stringify({name:'Unauthorized category'})],
    ];
    for(const [route,method,requestBody] of denialCases){
      const blocked=await fetch(origin+route,{method,headers:{Cookie:replacementCookie,'Content-Type':'application/json'},body:requestBody});
      assert.equal(blocked.status,403,method+' '+route);
    }
    assert.equal((await fetch(origin+'/.env')).status,404);
    assert.equal((await fetch(origin+'/server/server.mjs')).status,404);
    const healthData=await (await fetch(origin+'/api/health')).json();
    assert.equal(healthData.ok,true);
    assert.equal(healthData.backend,'local');
    assert.equal(healthData.mediaUploadsEnabled,true);
    const apiResponse=await fetch(origin+'/api/auth/me');
    assert.match(apiResponse.headers.get('content-security-policy')||'',/default-src 'none'/);
    assert.match(apiResponse.headers.get('permissions-policy')||'',/camera=\(\)/);
    const sensitiveJson=await fetch(origin+'/prototype/../../package.json');
    assert.notEqual(sensitiveJson.status,200);

    const crossSite=await fetch(origin+'/api/auth/password',{method:'POST',headers:{Cookie:replacementCookie,Origin:'https://malicious.invalid','Content-Type':'application/json'},body:'{}'});
    assert.equal(crossSite.status,403);
    const malformed=await fetch(origin+'/api/auth/password',{method:'POST',headers:{Cookie:replacementCookie,Origin:'not-a-valid-origin','Content-Type':'application/json'},body:'{}'});
    assert.equal(malformed.status,403);
    // Reverse proxies can change Host, even when the browser confirms same-origin.
    const forwardedLogin=await fetch(origin+'/api/auth/login',{
      method:'POST',
      headers:{Origin:'https://cms.example.invalid','Sec-Fetch-Site':'same-origin','Content-Type':'application/json'},
      body:JSON.stringify({email:'editor@teledoctorsa.co.za',password:'invalid'})
    });
    assert.equal(forwardedLogin.status,401);
    const fakeCrossSite=await fetch(origin+'/api/auth/login',{
      method:'POST',
      headers:{Origin:'https://cms.example.invalid','Sec-Fetch-Site':'cross-site','Content-Type':'application/json'},
      body:JSON.stringify({email:'editor@teledoctorsa.co.za',password:'invalid'})
    });
    assert.equal(fakeCrossSite.status,403);

    assert.doesNotMatch(await malformed.text(),/stack|SyntaxError|TypeError/i);
    const missingPrivate=await fetch(origin+'/server/postgres-auth.mjs');
    assert.equal(missingPrivate.status,404);
    const guessedPrivate=await fetch(origin+'/package.json');
    assert.equal(guessedPrivate.status,404);



    const logout=await fetch(origin+'/api/auth/logout',{method:'POST',headers:{Cookie:replacementCookie}});
    assert.equal(logout.status,200);
    assert.equal((await fetch(origin+'/api/articles',{headers:{Cookie:replacementCookie}})).status,401);
  }finally{
    child.kill();
    await new Promise(r=>child.once('exit',r));
    await rm(directory,{recursive:true,force:true});
  }
});
