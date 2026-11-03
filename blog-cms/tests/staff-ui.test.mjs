import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const html=await readFile(new URL('../prototype/index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../prototype/studio.js',import.meta.url),'utf8');
const windows=[];

async function until(predicate){
  for(let tries=0;tries<100;tries++){
    if(await predicate())return;
    await new Promise(resolve=>setTimeout(resolve,20));
  }
  throw new Error('Expected staff UI state did not arrive.');
}

async function adminStudio(){
  const dom=new JSDOM(html,{
    url:'https://cms.example.invalid/prototype/',
    runScripts:'outside-only'
  });
  const w=dom.window;windows.push(w);
  w.confirm=()=>true;
  w.prompt=()=>null;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};

  const admin={id:'admin-1',email:'admin@example.invalid',name:'CMS Administrator',role:'admin'};
  const users=[admin,{id:'staff-1',email:'existing@example.invalid',name:'Existing Editor',role:'editor'}];
  let listFailure=false,createCalls=0,changeCalls=0,resetCalls=0,roleCalls=0;
  w.TDSACmsApi={
    health:async()=>({backend:'postgres',ok:true,authRequired:true,mediaUploadsEnabled:false}),
    listArticles:async()=>[],
    listCategories:async()=>[
      {id:'cat-health',name:'Health Education',slug:'health-education'},
      {id:'cat-digital',name:'Digital Health',slug:'digital-health'}
    ],
    listMedia:async()=>[],
    me:async()=>admin,
    listUsers:async()=>{
      await Promise.resolve();
      if(listFailure)throw Object.assign(new Error('Service temporarily unavailable'),{status:503});
      return users.map(user=>({...user}));
    },
    createUser:async({name,email,role})=>{
      // Await ensures a real browser has already cleared event.currentTarget.
      await Promise.resolve();
      createCalls++;
      const clean=email.trim().toLowerCase();
      if(users.some(user=>user.email===clean))
        throw Object.assign(new Error('A user with that email already exists.'),{status:409});
      const user={id:'staff-'+users.length,email:clean,name,role};
      users.push(user);
      return {user,temporaryPassword:'temporary-password-123'};
    },
    resetUserPassword:async()=>{await Promise.resolve();resetCalls++;return {temporaryPassword:'replacement-password-456'};},
    updateUserRole:async(id,role)=>{await Promise.resolve();roleCalls++;const item=users.find(user=>user.id===id);item.role=role;return {...item};},
    changePassword:async()=>{await Promise.resolve();changeCalls++;return {ok:true};},
    setAccessToken:()=>{}
  };
  w.eval(script);
  const $=s=>w.document.querySelector(s);
  await until(()=>$('#staffAdminPanel').hidden===false);
  $('[data-view="settings"]').click();
  await until(()=>$('#staffList').textContent.includes('Existing Editor'));
  return {
    w,$,users,
    setListFailure:value=>{listFailure=value;},
    get calls(){return {createCalls,changeCalls,resetCalls,roleCalls};}
  };
}

test.after(()=>{for(const w of windows)w.close();});

test('account creation survives asynchronous response, refreshes staff and preserves one-time password',async()=>{
  const ctx=await adminStudio();
  const {w,$}=ctx;
  $('#staffName').value='New Editor';
  $('#staffEmail').value='New.Editor@Example.invalid';
  $('#staffRole').value='editor';
  const ev=new w.Event('submit',{bubbles:true,cancelable:true});
  $('#staffForm').dispatchEvent(ev);
  assert.equal(ev.defaultPrevented,true);
  await until(()=>!$('#temporaryPasswordBox').hidden);
  await until(()=>$('#staffList').textContent.includes('New Editor'));
  assert.equal(ctx.calls.createCalls,1);
  assert.equal($('#staffEmail').value,'');
  assert.equal($('#temporaryPassword').textContent,'temporary-password-123');
  assert.equal($('#toastTitle').textContent,'Staff account created');
  assert.equal(ctx.users.length,3);

  // Previously, retrying after the UI crash produced a duplicate 409 and no list.
  $('#staffName').value='New Editor';
  $('#staffEmail').value='new.editor@example.invalid';
  $('#staffForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await until(()=>$('#toastTitle').textContent==='Account already exists');
  assert.equal(ctx.calls.createCalls,2);
  assert.equal(ctx.users.length,3);
  assert.ok($('#staffList').textContent.includes('New Editor'));
  assert.match($('#toastMessage').textContent,/use Reset/i);

  const newUser=ctx.users.find(user=>user.email==='new.editor@example.invalid');
  const reset=[...w.document.querySelectorAll('[data-user-reset]')]
    .find(button=>button.dataset.userReset===newUser.id);
  reset.click();
  await until(()=>ctx.calls.resetCalls===1);
  await until(()=>$('#temporaryPassword').textContent==='replacement-password-456');
  assert.equal($('#temporaryPasswordBox').hidden,false);
});

test('account creation is not misreported as failed when list refresh fails',async()=>{
  const ctx=await adminStudio();
  const {w,$}=ctx;
  ctx.setListFailure(true);
  $('#staffName').value='Saved Despite Refresh';
  $('#staffEmail').value='saved@example.invalid';
  $('#staffForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await until(()=>$('#toastTitle').textContent==='Account created; list not refreshed');
  assert.equal(ctx.calls.createCalls,1);
  assert.ok($('#staffList').textContent.includes('Saved Despite Refresh'));
  assert.equal($('#temporaryPassword').textContent,'temporary-password-123');
  ctx.setListFailure(false);
  $('#refreshStaffBtn').click();
  await until(()=>$('#staffList').textContent.includes('Saved Despite Refresh'));
  assert.equal($('#staffList').querySelectorAll('.staff-row').length,3);
});

test('staff list errors are visible and recoverable with Refresh accounts',async()=>{
  const ctx=await adminStudio();
  const {$}=ctx;
  ctx.setListFailure(true);
  $('#refreshStaffBtn').click();
  await until(()=>$('#staffList [role="alert"]')!==null);
  assert.match($('#staffList').textContent,/Unable to load staff accounts/);
  ctx.setListFailure(false);
  $('#refreshStaffBtn').click();
  await until(()=>$('#staffList').textContent.includes('Existing Editor'));
  assert.equal($('#staffList').querySelectorAll('.staff-row').length,2);
});

test('password-change form resets after asynchronous server response',async()=>{
  const ctx=await adminStudio();
  const {w,$}=ctx;
  $('#currentPassword').value='current-password';
  $('#newPassword').value='new-password-secure-123';
  $('#confirmPassword').value='new-password-secure-123';
  $('#passwordForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await until(()=>!$('#loginGate').hidden);
  assert.equal(ctx.calls.changeCalls,1);
  assert.equal($('#currentPassword').value,'');
  assert.equal($('#newPassword').value,'');
  assert.equal($('#passwordFeedback').hidden,true);
  assert.match($('#loginFeedback').textContent,/Password changed/);
});

test('copy temporary password does not reference cleared async event.currentTarget',async()=>{
  const ctx=await adminStudio();
  const {w,$}=ctx;
  let copied='';
  Object.defineProperty(w.navigator,'clipboard',{
    configurable:true,
    value:{writeText:async value=>{await Promise.resolve();copied=value;}}
  });
  $('#temporaryPassword').textContent='temp-password-test';
  $('#copyTemporaryPassword').click();
  await until(()=>$('#copyTemporaryPassword').textContent==='Copied');
  assert.equal(copied,'temp-password-test');
});


test('administrator can review effective permissions and change a staff role',async()=>{
  const ctx=await adminStudio();
  const {$}=ctx;
  const user=ctx.users.find(item=>item.id==='staff-1');
  const selector=$('[data-staff-role="staff-1"]');
  assert.equal(selector.value,'editor');
  assert.ok($('.role-guide').textContent.includes('Publish, schedule'));
  selector.value='reviewer';
  selector.dispatchEvent(new ctx.w.Event('change',{bubbles:true}));
  $('[data-staff-role-update="staff-1"]').click();
  await until(()=>ctx.calls.roleCalls===1);
  assert.equal(user.role,'reviewer');
  assert.equal($('[data-staff-role="staff-1"]').value,'reviewer');
  assert.equal($('[data-staff-role="admin-1"]').disabled,true);
});

test('category and role event handlers bind without crashing workspace rendering',async()=>{
  const ctx=await adminStudio();
  const {$,w}=ctx;
  assert.equal($('#categoryGrid').querySelectorAll('.category-card').length,2);
  assert.equal($('#staffList').querySelectorAll('[data-staff-role]').length,2);
  $('[data-view="categories"]').click();
  const remove=$('[data-category-remove="cat-digital"]');
  assert.ok(remove);
  assert.equal(remove.disabled,false);
  remove.click();
  assert.equal($('#categoryDeleteDialog').open,true);
  assert.match($('#categoryDeleteDescription').textContent,/Digital Health/);
  $('#categoryDeleteCancel').click();
  assert.equal($('#categoryDeleteDialog').open,false);
  assert.equal(w.document.querySelectorAll('.category-card').length,2);
});

test('Studio must never call forEach on a single DOM query result',()=>{
  const offenders=script.split('\n').filter(line=>/(?<!\$)\$\((?:'[^']*'|"[^"]*")\)\.forEach\(/.test(line));
  assert.deepEqual(offenders,[],'Use $$(selector) when iterating multiple elements.');
});

test('login password visibility toggle is keyboard-accessible and does not clear credentials',async()=>{
  const {$}=await adminStudio();
  const input=$('#loginPassword');
  const toggle=$('#toggleLoginPassword');
  input.value='NotARealPasswordForThisTest';
  assert.equal(input.type,'password');
  assert.equal(toggle.getAttribute('aria-label'),'Show password');
  assert.equal(toggle.getAttribute('aria-pressed'),'false');
  toggle.click();
  assert.equal(input.type,'text');
  assert.equal(input.value,'NotARealPasswordForThisTest');
  assert.equal(toggle.getAttribute('aria-label'),'Hide password');
  assert.equal(toggle.getAttribute('aria-pressed'),'true');
  assert.equal(toggle.querySelector('.password-icon-show').hidden,true);
  toggle.click();
  assert.equal(input.type,'password');
  assert.equal(toggle.getAttribute('aria-pressed'),'false');
  assert.equal(toggle.querySelector('.password-icon-hide').hidden,true);
});

test('backend diagnostics are not exposed as a visible status banner',async()=>{
  const {$}=await adminStudio();
  assert.ok($('#backendStatus'));
  assert.equal($('#backendStatus').classList.contains('sr-only'),true);
  assert.doesNotMatch($('#backendStatus').textContent,/postgres|backend connected|secured/i);
  assert.ok($('#backendStatus').classList.contains('online'));
  assert.ok($('#loginGate').querySelector('.login-stage'));
});
