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
  const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'8804',CMS_BACKEND:'local',CMS_ACCESS_TOKEN:'',CMS_AUTH_FILE:authFile,CMS_DEPLOY_WEBHOOK_URL:''},stdio:'pipe'});
  const origin='http://127.0.0.1:8804';
  try{
    let ready=false;
    for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
    assert.ok(ready);
    assert.equal((await fetch(origin+'/api/articles')).status,401);

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

    const logout=await fetch(origin+'/api/auth/logout',{method:'POST',headers:{Cookie:replacementCookie}});
    assert.equal(logout.status,200);
    assert.equal((await fetch(origin+'/api/articles',{headers:{Cookie:replacementCookie}})).status,401);
  }finally{
    child.kill();
    await new Promise(r=>child.once('exit',r));
    await rm(directory,{recursive:true,force:true});
  }
});
