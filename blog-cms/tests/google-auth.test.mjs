import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createGoogleStaffLogin} from '../server/google-auth.mjs';
import {AuthStore} from '../server/auth.mjs';

const clientId='12345-test.apps.googleusercontent.com';
const workspaceDomain='teledoctorsa.co.za';

function setup(overrides={}){
  const getPayload=overrides.claims||((nonce)=>({
    iss:'https://accounts.google.com',aud:clientId,
    email:'editor@teledoctorsa.co.za',email_verified:true,
    hd:workspaceDomain,sub:'google-sub-123',nonce
  }));
  let nonce='';
  const mock={
    async verifyIdToken({idToken,audience}){
      assert.equal(audience,clientId);
      assert.ok(idToken.startsWith('test-'));
      if(overrides.reject)throw Error('Token signature invalid');
      return {getPayload:()=>getPayload(nonce)};
    }
  };
  const login=createGoogleStaffLogin({
    clientId,workspaceDomain,secure:true,verifier:mock
  });
  const config=login.config();
  nonce=config.csrfToken;
  const cookie=config.cookie.split(';')[0];
  const input={credential:'test-'+'.'.repeat(55),csrfToken:nonce};
  return {login,config,input,req:{headers:{cookie}},cookie};
}

test('Google sign-in is strictly disabled until both configuration values are provided',()=>{
  assert.deepEqual(createGoogleStaffLogin({clientId:'',workspaceDomain:'',secure:true}).config(),{enabled:false});
  assert.equal(createGoogleStaffLogin({clientId,workspaceDomain:''}).enabled,false);
  assert.equal(createGoogleStaffLogin({clientId:'broken',workspaceDomain}).enabled,false);
});
test('Google sign-in generates an HttpOnly, Secure, short-lived anti-CSRF cookie',()=>{
  const {config,login}=setup();
  assert.equal(config.enabled,true);
  assert.equal(config.clientId,clientId);
  assert.match(config.cookie,/__Host-tdsa_cms_google_state=/);
  assert.match(config.cookie,/HttpOnly/);
  assert.match(config.cookie,/SameSite=Strict/);
  assert.match(config.cookie,/Secure/);
  assert.match(config.cookie,/Max-Age=300/);
  assert.match(login.clearStateCookie(),/Max-Age=0/);
  assert.notEqual(login.config().csrfToken,config.csrfToken);
});
test('verified Google Workspace account with matching nonce is accepted',async()=>{
  const {login,input,req}=setup();
  assert.deepEqual(await login.verify(input,req),{email:'editor@teledoctorsa.co.za',googleSub:'google-sub-123'});
});
test('missing cookie, changed CSRF, missing token and invalid token are rejected',async()=>{
  const {login,input,req}=setup();
  await assert.rejects(login.verify(input,{headers:{}}),{statusCode:403});
  await assert.rejects(login.verify({...input,csrfToken:'attacker'},req),{statusCode:403});
  await assert.rejects(login.verify({...input,credential:''},req),{statusCode:401});
  const failed=setup({reject:true});
  await assert.rejects(failed.login.verify(failed.input,failed.req),{statusCode:401});
});
test('Google email, domain, audience and nonce must all match',async()=>{
  const cases=[
    {hd:'gmail.com'},
    {email:'editor@gmail.com'},
    {email_verified:false},
    {aud:'other-app.apps.googleusercontent.com'},
    {iss:'https://issuer.example'},
    {nonce:'replayed-nonce'},
    {sub:''}
  ];
  for(const value of cases){
    const harness=setup({claims:nonce=>({
      iss:'https://accounts.google.com',aud:clientId,
      email:'editor@teledoctorsa.co.za',email_verified:true,
      hd:workspaceDomain,sub:'google-sub-123',nonce,
      ...value
    })});
    await assert.rejects(harness.login.verify(harness.input,harness.req),{statusCode:403});
  }
});
test('Google staff binding never creates new accounts and rejects a different Google subject',async()=>{
  const folder=await mkdtemp(path.join(tmpdir(),'cms-google-'));
  try{
    const store=new AuthStore({filePath:path.join(folder,'auth.json')});
    const result=await store.createUser({
      email:'editor@teledoctorsa.co.za',name:'Editorial Staff',role:'editor'
    });
    assert.equal(await store.findGoogleUser('unknown@teledoctorsa.co.za','sub-123'),null);
    const linked=await store.findGoogleUser('editor@teledoctorsa.co.za','sub-123');
    assert.equal(linked.id,result.user.id);
    assert.equal((await store.findGoogleUser('editor@teledoctorsa.co.za','sub-123')).id,linked.id);
    await assert.rejects(store.findGoogleUser('editor@teledoctorsa.co.za','wrong-sub'),{statusCode:403});
    const staff=await store.listUsers();
    assert.equal(staff.length,1);
    const original=await store.authenticate('editor@teledoctorsa.co.za',result.temporaryPassword);
    assert.equal(original.id,linked.id,'Existing password still works');
    await store.changePassword(linked.id,result.temporaryPassword,'NewUniquePassword-123!');
    assert.equal(await store.authenticate('editor@teledoctorsa.co.za',result.temporaryPassword),null);
    assert.equal((await store.authenticate('editor@teledoctorsa.co.za','NewUniquePassword-123!')).id,linked.id);
    assert.equal((await store.findGoogleUser('editor@teledoctorsa.co.za','sub-123')).id,linked.id);
    await store.deleteUser(linked.id);
    assert.equal(await store.findGoogleUser('editor@teledoctorsa.co.za','sub-123'),null);
  }finally{await rm(folder,{recursive:true,force:true});}
});
