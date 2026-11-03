const api=window.TDSACmsApi;
let state={articles:[],categories:[],media:[],health:null,currentUser:null,users:[]};
let staffListState='idle',staffListError='';
let activeFilter='all';
let editingId=null;
let editingRevision='', editorBaseline='', saving=false, page=1;
const pageSize=10;
const recoveryKey='tdsaCmsEditorRecovery';
let autoSaveTimer=null,autoSaveInFlight=null,autoSaveConflict=false;
const AUTO_SAVE_DELAY_MS=1500;
function storageForKey(key){return key===recoveryKey?localStorage:sessionStorage;}
function storedJson(key){try{return JSON.parse(storageForKey(key).getItem(key)||sessionStorage.getItem(key)||'null');}catch{return null;}}
function storeJson(key,value){try{storageForKey(key).setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function clearRecovery(){try{localStorage.removeItem(recoveryKey);sessionStorage.removeItem(recoveryKey);}catch{}}
function feedback(message=''){const el=$('#editorFeedback');el.textContent=message;el.hidden=!message;}
function isDirty(){return editor.open&&JSON.stringify(editorData())!==editorBaseline;}
function draftComparable(data){const copy={...data};delete copy.revision;return JSON.stringify(copy);}
function canAutoSaveDraft(data=editorData()){
  const existing=state.articles.find(article=>article.id===editingId);
  return !autoSaveConflict&&data.status==='Draft'&&(!existing||existing.status==='Draft')&&!validateArticleClient(data);
}
function queueDraftAutosave(){
  clearTimeout(autoSaveTimer);
  if(!editor.open||saving)return;
  const data=editorData();
  if(data.status==='Draft'&&!autoSaveConflict&&data.title.length<5){
    $('#saveState').textContent='Add a title (5+ characters) to enable automatic saving';
    return;
  }
  if(!canAutoSaveDraft(data))return;
  $('#saveState').textContent='Autosave pending…';
  autoSaveTimer=setTimeout(()=>void persistDraft(),AUTO_SAVE_DELAY_MS);
}
function rememberEditor(){
  if(!isDirty())return;
  const stored=storeJson(recoveryKey,{ownerId:state.currentUser?.id||null,id:editingId,revision:editingRevision,data:editorData()});
  $('#saveState').textContent=stored?'Unsaved changes · recovery copy on this computer':'Unsaved changes';
  queueDraftAutosave();
}
async function persistDraft(){
  if(!editor.open||saving||autoSaveConflict)return;
  if(autoSaveInFlight){autoSaveTimer=setTimeout(()=>void persistDraft(),AUTO_SAVE_DELAY_MS);return;}
  const data=editorData();
  if(!canAutoSaveDraft(data))return;
  const snapshot=draftComparable(data);
  $('#saveState').textContent='Saving draft to CMS…';
  autoSaveInFlight=editingId?api.updateArticle(editingId,data):api.createArticle(data);
  try{
    const saved=await autoSaveInFlight;
    if(!saved?.id)throw new Error('CMS did not confirm the draft save.');
    editingId=saved.id;editingRevision=saved.revision||'';
    const index=state.articles.findIndex(item=>item.id===saved.id);
    if(index>=0)state.articles[index]=saved;else state.articles.unshift(saved);
    $('#deleteArticle').hidden=false;
    $('#editorEyebrow').textContent='DRAFT · AUTOSAVED';
    if(draftComparable(editorData())===snapshot){
      editorBaseline=JSON.stringify(editorData());
      clearRecovery();
      $('#saveState').textContent='Draft safely saved in CMS · '+new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});
    }else{
      // Keystrokes made during a request remain in the recovery copy and
      // are written in the next autosave with the new revision.
      storeJson(recoveryKey,{ownerId:state.currentUser?.id||null,id:editingId,revision:editingRevision,data:editorData()});
      $('#saveState').textContent='Changes pending…';
      clearTimeout(autoSaveTimer);
      autoSaveTimer=setTimeout(()=>void persistDraft(),AUTO_SAVE_DELAY_MS);
    }
    renderArticles();
  }catch(error){
    if(error?.status===409){
      autoSaveConflict=true;
      $('#saveState').textContent='Another session updated this draft · manual review required';
      notify('Draft save conflict','Your recovery copy is preserved. Reopen the latest article version before saving.');
    }else{
      $('#saveState').textContent='Autosave unavailable · recovery stored on this computer';
    }
  }finally{
    autoSaveInFlight=null;
  }
}
function closeEditor(){
  if(saving||autoSaveInFlight){notify('Saving draft','Please wait for the current draft save to finish.');return;}
  clearTimeout(autoSaveTimer);
  if(isDirty()&&!confirm('Discard these unsaved changes?')){queueDraftAutosave();return;}
  clearRecovery();editor.close();
}


const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const list=$('#articleList'),empty=$('#emptyState'),count=$('#resultCount'),search=$('#articleSearch'),globalSearch=$('#globalSearch'),categoryFilter=$('#categoryFilter'),sortFilter=$('#sortFilter');
const editor=$('#editorDialog'),preview=$('#previewDialog');
const loginGate=$('#loginGate'),loginForm=$('#loginForm'),loginEmail=$('#loginEmail'),loginPassword=$('#loginPassword'),loginFeedback=$('#loginFeedback'),loginSubmit=$('#loginSubmit'),signOutBtn=$('#signOutBtn'),sidebarSignOutBtn=$('#sidebarSignOutBtn'),currentUserEl=$('#currentUser'),sidebarCurrentUserEl=$('#sidebarCurrentUser');

function setLoginPasswordVisible(visible){
  const button=$('#toggleLoginPassword');
  loginPassword.type=visible?'text':'password';
  button.setAttribute('aria-pressed',String(visible));
  const label=visible?'Hide password':'Show password';
  button.setAttribute('aria-label',label);
  button.title=label;
  button.querySelector('.password-icon-show').hidden=visible;
  button.querySelector('.password-icon-hide').hidden=!visible;
}
$('#toggleLoginPassword').addEventListener('click',()=>{
  setLoginPasswordVisible(loginPassword.type==='password');
  loginPassword.focus({preventScroll:true});
});

// Editorial highlights are presentation-only. No credentials, API calls or
// authentication decisions are involved in the animation.
const loginHighlights=[
  {
    title:'Good information is part of good healthcare.',
    description:'A considered space to create, review and share trusted health insights.'
  },
  {
    title:'Write with clarity. Publish with confidence.',
    description:'Save your ideas, refine every detail and move stories through a clear editorial workflow.'
  },
  {
    title:'One place for every important story.',
    description:'From first draft to publication, keep your team’s knowledge organised and accessible.'
  }
];
const loginTitle=$('#loginStoryTitle');
const loginDescription=$('#loginStoryDescription');
const loginStoryCount=$('#loginStoryCount');
const loginStoryCopy=$('.login-story-transitions');
const loginStoryButtons=$$('[data-login-story]');
let loginHighlightIndex=0;
let loginHighlightTimer=0;
function setLoginHighlight(index){
  if(!Number.isInteger(index)||index<0||index>=loginHighlights.length)return;
  loginHighlightIndex=index;
  const highlight=loginHighlights[index];
  loginTitle.textContent=highlight.title;
  loginDescription.textContent=highlight.description;
  loginStoryCount.textContent=String(index+1).padStart(2,'0')+' / 03';
  loginStoryButtons.forEach(button=>{
    const selected=Number(button.dataset.loginStory)===index;
    button.setAttribute('aria-pressed',String(selected));
    button.classList.toggle('is-current',selected);
  });
  loginStoryCopy.classList.remove('is-updating');
  // Restart a short decorative fade without changing focus or announcing
  // every automatically rotated message to assistive technology.
  void loginStoryCopy.offsetWidth;
  loginStoryCopy.classList.add('is-updating');
}
const reducedLoginMotion=()=>typeof window.matchMedia==='function'
  &&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function stopLoginRotation(){
  if(loginHighlightTimer)window.clearInterval(loginHighlightTimer);
  loginHighlightTimer=0;
}
function syncLoginRotation(){
  stopLoginRotation();
  if(loginGate.hidden||document.hidden||reducedLoginMotion())return;
  loginHighlightTimer=window.setInterval(()=>{
    if(loginGate.hidden||document.hidden){stopLoginRotation();return;}
    setLoginHighlight((loginHighlightIndex+1)%loginHighlights.length);
  },8500);
}
loginStoryButtons.forEach(button=>button.addEventListener('click',()=>{
  setLoginHighlight(Number(button.dataset.loginStory));
  syncLoginRotation();
}));
document.addEventListener('visibilitychange',syncLoginRotation);

// A tiny pointer response gives depth to the backdrop on desktop.
// Touch devices use the calm CSS scene, and reduced-motion users get no drift.
let loginPointerFrame=0;
let loginPointerX=0,loginPointerY=0;
const parallaxEligible=()=>typeof window.matchMedia==='function'
  &&window.matchMedia('(pointer: fine)').matches&&!reducedLoginMotion();
loginGate.addEventListener('pointermove',event=>{
  if(loginGate.hidden||!parallaxEligible()||typeof window.requestAnimationFrame!=='function')return;
  const bounds=loginGate.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  loginPointerX=Math.max(-1,Math.min(1,((event.clientX-bounds.left)/bounds.width-.5)*2));
  loginPointerY=Math.max(-1,Math.min(1,((event.clientY-bounds.top)/bounds.height-.5)*2));
  if(loginPointerFrame)return;
  loginPointerFrame=window.requestAnimationFrame(()=>{
    loginGate.style.setProperty('--login-parallax-x',(loginPointerX*13).toFixed(1)+'px');
    loginGate.style.setProperty('--login-parallax-y',(loginPointerY*9).toFixed(1)+'px');
    loginPointerFrame=0;
  });
});
loginGate.addEventListener('pointerleave',()=>{
  loginGate.style.setProperty('--login-parallax-x','0px');
  loginGate.style.setProperty('--login-parallax-y','0px');
});
function showLogin(message='Sign in to continue.'){
  loginGate.hidden=false;
  document.body.classList.add('studio-locked');
  setLoginPasswordVisible(false);
  syncLoginRotation();
  const isPrompt=!message||message==='Sign in to continue.';
  loginFeedback.textContent=isPrompt?'':message;
  loginFeedback.hidden=isPrompt;
  signOutBtn.hidden=true;
  setTimeout(()=>loginEmail.focus(),0);
}
function hideLogin(){
  loginGate.hidden=true;
  stopLoginRotation();
  document.body.classList.remove('studio-locked');
  loginFeedback.hidden=true;
  signOutBtn.hidden=false;
}


function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function slugify(value){return String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);}
function prettyDate(value){if(!value)return 'Not published';const date=new Date(value);if(Number.isNaN(date.getTime()))return 'Unknown date';return new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);}
function notify(title,message,action=null){
  $('#toastTitle').textContent=title;
  $('#toastMessage').textContent=message;
  const link=$('#toastAction');
  if(action?.href){
    link.href=action.href;
    link.textContent=action.label||'View on blog ↗';
    link.hidden=false;
  }else{
    link.hidden=true;
    link.removeAttribute('href');
  }
  const toast=$('#toast');
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer=setTimeout(()=>toast.classList.remove('show'),action?.href?9000:4200);
}
function deliveryMessage(delivery){if(!delivery)return '';if(!delivery.configured)return ' Live website publishing is not configured yet.';return delivery.ok?' A Cloud Run publishing job was queued; website delivery is not yet verified.':' The publishing job could not be queued. Your article was saved; retry website publishing after resolving the error.';}
function errorMessage(error){return error?.details?.length?error.details.join(' '):error?.message||'Something went wrong.';}

function setBackendStatus(mode,message){
  const el=$('#backendStatus');el.classList.remove('online','offline');if(mode)el.classList.add(mode);
  el.querySelector('b').textContent=message;
  // Connection status remains in the top bar, not a duplicate dashboard tile.
}

async function loadWorkspace({quiet=false,authRetry=true}={}){
  if(!quiet)setBackendStatus('','Checking Studio connection…');

  const requests=[
    ['health',api.health()],
    ['articles',api.listArticles()],
    ['categories',api.listCategories()],
    ['media',api.listMedia()],
  ];
  const results=await Promise.allSettled(requests.map(([,promise])=>promise));

  const unauthorized=results.some(result=>result.status==='rejected'&&result.reason?.status===401);
  if(unauthorized){
    showLogin(authRetry?'Sign in to continue.':'Your session expired. Sign in again.');
    return false;
  }
  const values={};
  const failures=[];

  results.forEach((result,index)=>{
    const key=requests[index][0];
    if(result.status==='fulfilled')values[key]=result.value;
    else failures.push({key,error:result.reason});
  });

  state={
    ...state,
    health:values.health||state.health,
    articles:Array.isArray(values.articles)?values.articles:state.articles,
    categories:Array.isArray(values.categories)?values.categories:state.categories,
    media:Array.isArray(values.media)?values.media:state.media,
  };

  if(values.health){
    setBackendStatus('online',failures.length?'Studio ready · some data unavailable':'Studio ready');
  }else{
    setBackendStatus('offline','Studio connection unavailable');
  }

  render();
  // Publishing text-only articles is available even while media storage is deferred.
  const uploadsEnabled=state.health?.mediaUploadsEnabled===true;
  for(const selector of ['#uploadMediaBtn','#editorUpload']){
    const control=$(selector);
    if(control){control.disabled=!uploadsEnabled;control.title=uploadsEnabled?'':'Media uploads will be enabled after storage setup.';}
  }
  if(!uploadsEnabled)$('#mediaBackendLabel').textContent='Image uploads temporarily unavailable';
  try{
    const user=await api.me();
    state.currentUser=user;
    currentUserEl.textContent=user?.name||user?.email||'Staff';
    currentUserEl.hidden=false;
    if(sidebarCurrentUserEl)sidebarCurrentUserEl.textContent=user?.name||user?.email||'TeleDoctorSA staff';
  }catch{
    state.currentUser=null;
    currentUserEl.hidden=true;
  }
  renderSettings();
  hideLogin();

  if(!quiet&&failures.length){
    const failedNames=failures.map(item=>item.key).join(', ');
    const authFailed=failures.some(item=>item.error?.status===401);
    notify(authFailed?'Studio access required':'Some CMS data could not load',authFailed?'Your Publishing Studio session is no longer valid. Sign in again.':`Failed: ${failedNames}. Other available content has still been loaded.`);
  }
  return true;
}

function updateCounts(){
  const counts=status=>state.articles.filter(a=>a.status===status).length;
  $('#publishedMetric').textContent=counts('Published');$('#reviewMetric').textContent=counts('Review');$('#draftMetric').textContent=counts('Draft');
  $('#allCount').textContent=state.articles.length;$('#publishedCount').textContent=counts('Published');$('#draftCount').textContent=counts('Draft');$('#reviewCount').textContent=counts('Review');
  $('#articleNavCount').textContent=state.articles.length;$('#reviewNavCount').textContent=counts('Review');$('#scheduledCount').textContent=counts('Scheduled');
}

function hydrateCategories(){
  const current=categoryFilter.value||'all';
  categoryFilter.innerHTML='<option value="all">All categories</option>'+state.categories.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  categoryFilter.value=state.categories.some(c=>c.name===current)?current:'all';

  const editorSelect=$('#articleCategory');
  const editorCurrent=editorSelect.value;
  if(!state.categories.length){
    editorSelect.innerHTML='<option value="">No categories available</option>';
    editorSelect.value='';
    editorSelect.disabled=true;
    return;
  }

  editorSelect.disabled=false;
  editorSelect.innerHTML='<option value="">Choose a category (optional for drafts)</option>'+state.categories.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  editorSelect.value=state.categories.some(c=>c.name===editorCurrent)?editorCurrent:'';
}

function hydrateMediaSelect(selectedUrl=''){
  const select=$('#articleCoverImage');
  select.innerHTML='<option value="">Select from media library</option>'+state.media.map(m=>`<option value="${escapeHtml(m.url)}" data-id="${escapeHtml(m.id)}" data-alt="${escapeHtml(m.alt||'')}">${escapeHtml(m.name)}</option>`).join('');
  if(selectedUrl&&!state.media.some(m=>m.url===selectedUrl))select.insertAdjacentHTML('beforeend',`<option value="${escapeHtml(selectedUrl)}">Current image</option>`);
  select.value=selectedUrl||'';
}

function filteredArticles(){
  const query=search.value.trim().toLowerCase(),selected=categoryFilter.value;
  const rows=state.articles.filter(a=>(!query||`${a.title} ${a.excerpt} ${a.author} ${a.category}`.toLowerCase().includes(query))&&(activeFilter==='all'||a.status===activeFilter)&&(selected==='all'||a.category===selected));
  return rows.sort((a,b)=>sortFilter.value==='az'?a.title.localeCompare(b.title):sortFilter.value==='oldest'?new Date(a.updatedAt||0)-new Date(b.updatedAt||0):new Date(b.updatedAt||0)-new Date(a.updatedAt||0));
}

function renderArticles(){
  const allRows=filteredArticles();
  const pages=Math.max(1,Math.ceil(allRows.length/pageSize));page=Math.min(Math.max(1,page),pages);
  const rows=allRows.slice((page-1)*pageSize,page*pageSize);
  $('#previousPage').disabled=page===1;$('#nextPage').disabled=page===pages;$('#pageLabel').textContent=`Page ${page} of ${pages}`;
  storeJson('tdsaCmsList',{page,activeFilter,query:search.value,category:categoryFilter.value,sort:sortFilter.value});
  list.innerHTML=rows.map(a=>`<article class="article-row" data-id="${escapeHtml(a.id)}"><button class="story story-button" data-edit="${escapeHtml(a.id)}"><div class="thumb" aria-hidden="true">${a.coverImage?.url?`<img src="${escapeHtml(a.coverImage.url)}" alt="">`:`<span>${a.featured?'★':'+'}</span>`}</div><div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt||'No introduction yet.')}</p></div></button><span class="badge ${escapeHtml(a.status)}">${a.status==='Review'?'In review':escapeHtml(a.status)}</span><span class="category">${escapeHtml(a.category)}</span><span class="date"><span class="author">${escapeHtml(a.author)}</span><br>${prettyDate(a.updatedAt)}</span><button class="row-menu" data-edit="${escapeHtml(a.id)}" aria-label="Edit ${escapeHtml(a.title)}">•••</button></article>`).join('');
  empty.hidden=allRows.length!==0;count.textContent=allRows.length?`Showing ${(page-1)*pageSize+1}–${(page-1)*pageSize+rows.length} of ${allRows.length} stories`:'No stories found';updateCounts();
  $$('[data-edit]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.edit)));
}

function renderMedia(){
  const q=$('#mediaSearch').value.trim().toLowerCase();
  const rows=state.media.filter(m=>!q||`${m.name} ${m.tag} ${m.alt}`.toLowerCase().includes(q));
  $('#mediaGrid').innerHTML=rows.map(m=>`<article class="media-item"><div class="media-visual real-media"><img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.alt||'')}"></div><div><span>${escapeHtml(m.tag||'Image')}</span><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.mimeType||'image')} · ${escapeHtml(m.alt||'Alt text not set')}</p></div></article>`).join('');
  if(!rows.length)$('#mediaGrid').innerHTML='<div class="media-empty">No media found.</div>';
  hydrateMediaSelect($('#articleCoverImage')?.value||'');
}

function renderCategories(){
  const canManage=state.currentUser?.role==='admin'||Boolean(state.currentUser?.development);
  $('#addCategory').hidden=!canManage;
  $('#editorAddCategory').hidden=!canManage;
  $('#categoryGrid').innerHTML=state.categories.map(c=>{
    const total=state.articles.filter(a=>a.category===c.name).length;
    const published=state.articles.filter(a=>a.category===c.name&&a.status==='Published').length;
    return `<article class="category-card"><div class="category-symbol">${escapeHtml(c.name.slice(0,2).toUpperCase())}</div><div><h3>${escapeHtml(c.name)}</h3><p>${total} ${total===1?'story':'stories'} · ${published} published</p></div><button type="button" data-category-remove="${escapeHtml(c.id)}" ${!canManage||total?'disabled title="Only administrators can delete an unused category"':''} aria-label="Delete ${escapeHtml(c.name)}">Delete</button></article>`;
  }).join('');
  $$('[data-category-remove]').forEach(button=>button.addEventListener('click',()=>{
    const category=state.categories.find(item=>item.id===button.dataset.categoryRemove);
    if(!category)return;
    categoryToDelete=category.id;
    $('#categoryDeleteDescription').textContent=`Delete “${category.name}”? This cannot be undone. A category must be empty before it can be removed.`;
    $('#categoryDeleteError').hidden=true;
    $('#categoryDeleteDialog').showModal();
  }));
}

function render(){hydrateCategories();renderArticles();renderMedia();renderCategories();renderSettings();}

function renderSettings(){
  const user=state.currentUser;
  const accountName=$('#accountName'),accountMeta=$('#accountMeta'),passwordForm=$('#passwordForm'),adminPanel=$('#staffAdminPanel');
  if(!accountName||!accountMeta)return;
  accountName.textContent=user?.name||'Publishing Studio account';
  accountMeta.textContent=user?(user.email?`${user.email} · ${user.role||'staff'}`:(user.development?'Local development mode':'Authenticated staff account')):'Not signed in';
  passwordForm.hidden=!user||Boolean(user.development)||Boolean(user.legacy);
  adminPanel.hidden=!user||user.role!=='admin'||Boolean(user.development)||Boolean(user.legacy);
  if(!adminPanel.hidden)renderStaffList();
}

function renderStaffList(){
  const target=$('#staffList');if(!target)return;
  if(staffListState==='loading'){target.innerHTML='<div class="media-empty" role="status">Loading staff accounts...</div>';return;}
  if(staffListState==='error'){target.innerHTML='<div class="media-empty" role="alert">Unable to load staff accounts: '+escapeHtml(staffListError)+'. Select Refresh accounts to retry.</div>';return;}
  if(!state.users.length){target.innerHTML='<div class="media-empty">No staff accounts found.</div>';return;}
  target.innerHTML=state.users.map(user=>{
    const own=user.id===state.currentUser?.id;
    const roles=['admin','editor','reviewer'].map(role=>`<option value="${role}" ${user.role===role?'selected':''}>${role==='admin'?'Administrator':role==='editor'?'Editor':'Reviewer'}</option>`).join('');
    return `<article class="staff-row"><div class="staff-identity"><h3>${escapeHtml(user.name)}</h3><p>${escapeHtml(user.email)}</p></div><div class="staff-role-editor"><label class="sr-only" for="staff-role-${escapeHtml(user.id)}">Role for ${escapeHtml(user.name)}</label><select id="staff-role-${escapeHtml(user.id)}" data-staff-role="${escapeHtml(user.id)}" ${own?'disabled title="You cannot change your own role"':''}>${roles}</select><button type="button" data-staff-role-update="${escapeHtml(user.id)}" disabled>Save role</button></div><div class="staff-actions"><button type="button" data-user-reset="${escapeHtml(user.id)}" aria-label="Reset password for ${escapeHtml(user.name)}">Reset</button><button class="remove" type="button" data-user-remove="${escapeHtml(user.id)}" ${own?'disabled title="This is your signed-in account"':''} aria-label="Remove ${escapeHtml(user.name)}">×</button></div></article>`;
  }).join('');
  $$('[data-staff-role]').forEach(select=>select.addEventListener('change',()=>{
    const user=state.users.find(item=>item.id===select.dataset.staffRole);
    const button=select.closest('.staff-role-editor').querySelector('[data-staff-role-update]');
    button.disabled=!user||select.value===user.role;
  }));
  $$('[data-staff-role-update]').forEach(button=>button.addEventListener('click',async()=>{
    const user=state.users.find(item=>item.id===button.dataset.staffRoleUpdate);
    const select=button.closest('.staff-role-editor').querySelector('[data-staff-role]');
    if(!user||user.id===state.currentUser?.id||select.value===user.role)return;
    const role=select.value;
    button.disabled=true;select.disabled=true;
    try{
      const updated=await api.updateUserRole(user.id,role);
      state.users=state.users.map(item=>item.id===updated.id?updated:item);
      renderStaffList();
      notify('Permissions updated',`${updated.name} now has ${updated.role} access. Their previous sessions have been signed out.`);
    }catch(error){
      button.disabled=false;select.disabled=false;
      notify('Role not updated',errorMessage(error));
    }
  }));
  $$('[data-user-reset]').forEach(button=>button.addEventListener('click',async()=>{
    const user=state.users.find(item=>item.id===button.dataset.userReset);if(!user)return;
    if(!confirm(`Reset the password for ${user.name}? Their current sessions will be signed out.`))return;
    button.disabled=true;
    try{
      const result=await api.resetUserPassword(user.id);
      $('#temporaryPassword').textContent=result.temporaryPassword;
      $('#temporaryPasswordBox').hidden=false;
      notify('Password reset',`A new temporary password was generated for ${user.name}.`);
    }catch(error){notify('Password not reset',errorMessage(error));}
    finally{button.disabled=false;}
  }));
  $$('[data-user-remove]').forEach(button=>button.addEventListener('click',async()=>{
    const user=state.users.find(item=>item.id===button.dataset.userRemove);if(!user)return;
    if(!confirm(`Remove Publishing Studio access for ${user.name}?`))return;
    button.disabled=true;
    try{await api.deleteUser(user.id);state.users=state.users.filter(item=>item.id!==user.id);renderStaffList();notify('Access removed',`${user.name} can no longer sign in.`);}
    catch(error){button.disabled=false;notify('Account not removed',errorMessage(error));}
  }));
}

async function loadSettings(){
  renderSettings();
  if(state.currentUser?.role!=='admin'||state.currentUser?.development||state.currentUser?.legacy)return;
  staffListState='loading';renderStaffList();
  try{
    const users=await api.listUsers();
    if(!Array.isArray(users))throw new Error('Unexpected staff account response.');
    state.users=users;staffListState='ready';staffListError='';renderStaffList();
  }catch(error){
    staffListState='error';staffListError=errorMessage(error);renderStaffList();
    notify('Staff accounts unavailable',staffListError);
  }
}

function showView(name){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));
  $$('[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  if(name==='settings')void loadSettings();
  if(typeof setSidebarOpen==='function')setSidebarOpen(false);
}
$$('[data-view]').forEach(el=>el.addEventListener('click',e=>{if(el.tagName==='A'&&el.getAttribute('href')!=='#')return;e.preventDefault();showView(el.dataset.view);}));
$$('[data-status-view]').forEach(el=>el.addEventListener('click',()=>{showView('articles');activeFilter=el.dataset.statusView;page=1;$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));renderArticles();}));

function syncConditionalFields(){
  $('#scheduleField').hidden=$('#articleStatus').value!=='Scheduled';
  $('#clinicalStatusField').hidden=!$('#articleClinicalRequired').checked;
  if(!$('#articleClinicalRequired').checked)$('#articleClinicalStatus').value='pending';
  const status=$('#articleStatus').value;
  $('#saveDraft').hidden=status==='Draft';
  $('#saveDraft').textContent=state.articles.find(a=>a.id===editingId)?.status==='Published'?'Unpublish to draft':'Save as draft';
  $('#saveArticle').textContent=({Draft:'Save draft',Review:'Send for review',Scheduled:'Schedule article',Published:'Publish article'})[status];
}

function resetEditor(){
  clearTimeout(autoSaveTimer);autoSaveConflict=false;
  editingId=null;editingRevision='';feedback();$('#editorForm').reset();$('#articleAuthor').value='TeleDoctorSA Editorial';$('#articleStatus').value='Draft';$('#editorEyebrow').textContent='NEW STORY';$('#editorHeading').textContent='Start with the idea.';$('#saveState').textContent='Not saved';$('#articleSlug').value='';$('#articleSlug').dataset.touched='';$('#excerptCount').textContent='0';$('#deleteArticle').hidden=true;hydrateCategories();hydrateMediaSelect();syncConditionalFields();
}

function toLocalDateTime(value){if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return '';const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);}

function openEditor(id){
  if(saving||autoSaveInFlight)return;
  resetEditor();
  if(id){
    const a=state.articles.find(item=>item.id===id);if(!a)return;editingId=id;editingRevision=a.revision||'';
    $('#editorEyebrow').textContent=a.status.toUpperCase();$('#editorHeading').textContent='Shape the story.';$('#articleTitle').value=a.title;$('#articleExcerpt').value=a.excerpt||'';$('#articleBody').value=a.bodyText||'';$('#articleStatus').value=a.status;$('#articleCategory').value=a.category;$('#articleAuthor').value=a.author;$('#articleSlug').value=a.slug;$('#articleSlug').dataset.touched='true';$('#articleFeatured').checked=Boolean(a.featured);$('#articleClinicalRequired').checked=Boolean(a.clinicalReviewRequired);$('#articleClinicalStatus').value=a.clinicalReviewStatus==='not_required'?'pending':a.clinicalReviewStatus;$('#articleScheduledAt').value=toLocalDateTime(a.scheduledAt);$('#articleSeoTitle').value=a.seoTitle||'';$('#articleSeoDescription').value=a.seoDescription||'';$('#excerptCount').textContent=(a.excerpt||'').length;$('#saveState').textContent=`Last updated ${prettyDate(a.updatedAt)}`;hydrateMediaSelect(a.coverImage?.url||'');$('#articleCoverAlt').value=a.coverImage?.alt||'';$('#deleteArticle').hidden=false;syncConditionalFields();
  }
  editorBaseline=JSON.stringify(editorData());
  editor.showModal();
}

$$('[data-action="new"]').forEach(button=>button.addEventListener('click',()=>openEditor()));
$('#closeEditor').addEventListener('click',closeEditor);
editor.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
$('#editorForm').addEventListener('submit',event=>{event.preventDefault();saveStory();});
$('#editorForm').addEventListener('input',rememberEditor);
$('#editorForm').addEventListener('change',rememberEditor);
window.addEventListener('beforeunload',event=>{if(isDirty()){rememberEditor();event.preventDefault();event.returnValue='';}});
$('#articleTitle').addEventListener('input',e=>{if(!$('#articleSlug').dataset.touched)$('#articleSlug').value=slugify(e.target.value);});
$('#articleSlug').addEventListener('input',e=>{e.target.dataset.touched='true';e.target.value=slugify(e.target.value);});
$('#articleExcerpt').addEventListener('input',e=>$('#excerptCount').textContent=e.target.value.length);
$('#articleStatus').addEventListener('change',syncConditionalFields);
$('#articleClinicalRequired').addEventListener('change',syncConditionalFields);
$('#articleCoverImage').addEventListener('change',e=>{const option=e.target.selectedOptions[0];if(option?.dataset.alt&&!$('#articleCoverAlt').value.trim())$('#articleCoverAlt').value=option.dataset.alt;});

function editorData(){
  const media=state.media.find(m=>m.url===$('#articleCoverImage').value);
  return {
    revision:editingRevision,title:$('#articleTitle').value.trim(),excerpt:$('#articleExcerpt').value.trim(),bodyText:$('#articleBody').value.trim(),status:$('#articleStatus').value,category:$('#articleCategory').value,author:$('#articleAuthor').value.trim()||'TeleDoctorSA Editorial',slug:slugify($('#articleSlug').value||$('#articleTitle').value),featured:$('#articleFeatured').checked,
    clinicalReviewRequired:$('#articleClinicalRequired').checked,clinicalReviewStatus:$('#articleClinicalRequired').checked?$('#articleClinicalStatus').value:'not_required',scheduledAt:$('#articleStatus').value==='Scheduled'&&$('#articleScheduledAt').value?new Date($('#articleScheduledAt').value).toISOString():'',
    coverImage:{assetId:media?.id||($('#articleCoverImage').value?state.articles.find(a=>a.id===editingId)?.coverImage?.assetId||'':''),url:$('#articleCoverImage').value,alt:$('#articleCoverAlt').value.trim()},seoTitle:$('#articleSeoTitle').value.trim(),seoDescription:$('#articleSeoDescription').value.trim()
  };
}

async function verifyPublishedArticle(article){
  if(!article?.slug)return null;
  for(let attempt=0;attempt<6;attempt++){
    try{
      const publicArticle=await api.getPublicArticle(article.slug);
      if(publicArticle?.id===article.id||publicArticle?.slug===article.slug)return publicArticle;
    }catch(error){
      if(error?.status!==404)throw error;
    }
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  return null;
}

function validateArticleClient(data){
  const errors=[];
  if(data.title.length<5)errors.push('Title must be at least 5 characters.');
  if(!data.slug)errors.push('Add a valid URL slug.');
  if(data.status!=='Draft'&&!data.category)errors.push('Choose a category.');
  if(!data.author)errors.push('Choose or enter an author.');
  if(data.excerpt.length>220)errors.push('Short introduction must be 220 characters or fewer.');
  if(data.seoTitle.length>60)errors.push('SEO title must be 60 characters or fewer.');
  if(data.seoDescription.length>160)errors.push('SEO description must be 160 characters or fewer.');
  if(data.status==='Scheduled'&&(!data.scheduledAt||!Number.isFinite(Date.parse(data.scheduledAt))||Date.parse(data.scheduledAt)<=Date.now()))errors.push('Choose a valid future publication date and time.');

  if(data.status==='Published'||data.status==='Scheduled'){
    if(data.excerpt.length<20)errors.push('Published stories need a short introduction of at least 20 characters.');
    if(data.bodyText.length<80)errors.push('Published stories need a complete article body of at least 80 characters.');
    if((data.coverImage.url||data.coverImage.assetId)&&!data.coverImage.alt)errors.push('An attached cover image needs alternative text.');
    if(data.clinicalReviewRequired&&data.clinicalReviewStatus!=='approved')errors.push('Clinical content must be approved before publication.');
  }

  return errors.join(' ');
}

async function saveStory(forcedStatus){
  if(saving)return;
  clearTimeout(autoSaveTimer);
  if(autoSaveInFlight){await autoSaveInFlight.catch(()=>{});clearTimeout(autoSaveTimer);}
  const data=editorData();if(forcedStatus)data.status=forcedStatus;
  const error=validateArticleClient(data);if(error){feedback(error);return;}
  const previous=state.articles.find(a=>a.id===editingId);
  if(previous?.status==='Published'&&data.status!=='Published'&&!confirm('Remove this article from the public blog and save it as '+data.status.toLowerCase()+'?'))return;
  if(data.status==='Published'&&!confirm(previous?.status==='Published'?'Apply these changes to the published article?':'Publish this article for readers now?'))return;
  saving=true;feedback();
  const controls=$$('#editorForm input, #editorForm textarea, #editorForm select, #editorForm button');
  const disabled=controls.map(el=>el.disabled);controls.forEach(el=>el.disabled=true);
  $('#saveState').textContent='Saving…';
  try{
    const saved=editingId?await api.updateArticle(editingId,data):await api.createArticle(data);
    if(!saved?.id)throw new Error('The service did not confirm the saved article. Refresh the list before retrying.');
    editingId=saved.id;editingRevision=saved.revision||'';
    const index=state.articles.findIndex(a=>a.id===saved.id);if(index>=0)state.articles[index]=saved;else state.articles.unshift(saved);
    clearRecovery();editor.close();
    // Always reveal the acknowledged save, even when the old list was filtered.
    showView('articles');activeFilter=saved.status;page=1;search.value='';globalSearch.value='';categoryFilter.value='all';sortFilter.value='newest';
    $$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));render();
    if(saved.status==='Published'){
      notify('Article published','Your article is available in the published preview.'+deliveryMessage(saved.delivery),{href:`/blog/${encodeURIComponent(saved.slug)}/`,label:'View published preview ↗'});
      try{if(!await verifyPublishedArticle(saved))notify('Article saved','The public preview has not refreshed yet. Your article is saved; refresh the preview shortly.');}
      catch{notify('Article saved','Public preview verification failed. Your saved article is available in Published.');}
    }else notify(saved.status==='Draft'?'Draft saved':saved.status==='Review'?'Sent for review':'Article scheduled',saved.status==='Scheduled'?'Publication requires the CMS service to remain running.':'Your article is visible in the selected list.'+deliveryMessage(saved.delivery));
  }catch(err){feedback(errorMessage(err));rememberEditor();}
  finally{saving=false;controls.forEach((el,i)=>el.disabled=disabled[i]);syncConditionalFields();}
}
$('#saveArticle').addEventListener('click',()=>saveStory());
$('#saveDraft').addEventListener('click',()=>saveStory('Draft'));

$('#deleteArticle').addEventListener('click',async()=>{
  if(saving||autoSaveInFlight||!editingId)return;
  clearTimeout(autoSaveTimer);
  const article=state.articles.find(item=>item.id===editingId);
  if(!article)return;
  if(!confirm(`Delete “${article.title}”? This removes it from the content backend and, if published, from the public feed.`))return;
  saving=true;const button=$('#deleteArticle');button.disabled=true;button.textContent='Deleting…';
  try{
    const result=await api.deleteArticle(editingId);
    state.articles=state.articles.filter(item=>item.id!==editingId);
    editingId=null;clearRecovery();editor.close();render();notify('Article deleted','The article was removed from the content service.'+deliveryMessage(result.delivery));
  }catch(error){notify('Article not deleted',errorMessage(error));}
  finally{saving=false;button.disabled=false;button.textContent='Delete article';}
});

function openPreview(){const data=editorData();$('#previewCover').hidden=!data.coverImage.url;$('#previewCover').src=data.coverImage.url||'';$('#previewCover').alt=data.coverImage.alt;$('#previewTitle').textContent=data.title||'Untitled story';$('#previewExcerpt').textContent=data.excerpt||'No introduction yet.';$('#previewCategory').textContent=data.category||'Uncategorised';$('#previewMeta').textContent=`${data.author} · ${data.status} preview`;$('#previewBody').innerHTML=(data.bodyText||'Start writing to see the article preview.').split(/\n\n+/).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');preview.showModal();}
$('#previewBtn').addEventListener('click',openPreview);$('#closePreview').addEventListener('click',()=>preview.close());

const resetPage=()=>{page=1;renderArticles();};
search.addEventListener('input',resetPage);categoryFilter.addEventListener('change',resetPage);sortFilter.addEventListener('change',resetPage);globalSearch.addEventListener('input',()=>{showView('articles');search.value=globalSearch.value;resetPage();});
$$('.tabs button').forEach(tab=>tab.addEventListener('click',()=>{$$('.tabs button').forEach(t=>t.classList.remove('active'));tab.classList.add('active');activeFilter=tab.dataset.filter;resetPage();}));
$('#mediaSearch').addEventListener('input',renderMedia);
$('#refreshBtn').addEventListener('click',()=>loadWorkspace());

loginForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const email=loginEmail.value.trim();
  const password=loginPassword.value;
  if(!email||!password){showLogin('Enter your email address and password.');return;}
  loginSubmit.disabled=true;
  $('#loginSubmitText').textContent='Signing in…';
  loginFeedback.hidden=true;
  try{
    const user=await api.login(email,password);
    state.currentUser=user;
    currentUserEl.textContent=user?.name||user?.email||'Staff';
    currentUserEl.hidden=false;
    loginPassword.value='';
    const ok=await loadWorkspace({quiet:true,authRetry:false});
    if(ok===false)showLogin('Sign-in succeeded, but the workspace could not be loaded.');
  }catch(error){
    showLogin(errorMessage(error));
    loginPassword.select();
  }finally{
    loginSubmit.disabled=false;
    $('#loginSubmitText').textContent='Sign in to Publishing Studio';
  }
});
async function signOut(){
  clearTimeout(autoSaveTimer);
  if(autoSaveInFlight)await autoSaveInFlight.catch(()=>{});
  // Clear confidential unsaved drafts before another staff member uses this browser tab.
  clearRecovery();
  if(editor.open)editor.close();
  if(preview.open)preview.close();
  signOutBtn.disabled=true;
  if(sidebarSignOutBtn)sidebarSignOutBtn.disabled=true;
  try{await api.logout();}catch{}
  api.setAccessToken('');
  currentUserEl.hidden=true;
  if(sidebarCurrentUserEl)sidebarCurrentUserEl.textContent='TeleDoctorSA staff';
  state={articles:[],categories:[],media:[],health:null,currentUser:null,users:[]};
  staffListState='idle';staffListError='';
  render();
  showLogin('You have signed out.');
  signOutBtn.disabled=false;
  if(sidebarSignOutBtn)sidebarSignOutBtn.disabled=false;
}
signOutBtn.addEventListener('click',signOut);
sidebarSignOutBtn?.addEventListener('click',signOut);

$('#previousPage').addEventListener('click',()=>{page--;renderArticles();});
$('#nextPage').addEventListener('click',()=>{page++;renderArticles();});
$('#clearFilters').addEventListener('click',()=>{search.value='';globalSearch.value='';categoryFilter.value='all';activeFilter='all';$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter==='all'));resetPage();});
$('#uploadMediaBtn').addEventListener('click',()=>$('#mediaFileInput').click());
$('#editorUpload').addEventListener('click',()=>$('#editorFileInput').click());
async function uploadMedia(event){
  const file=event.target.files?.[0];if(!file)return;
  const inEditor=event.target.id==='editorFileInput';
  const report=message=>inEditor?feedback(message):notify('Media upload',message);
  if(file.size>6*1024*1024){report('Use an image smaller than 6 MB.');event.target.value='';return;}
  const alt=prompt('Describe this image for accessibility:','')??'';
  if(alt.trim().length<3){report('Upload cancelled. Enter a description of at least 3 characters.');event.target.value='';return;}
  const button=$(inEditor?'#editorUpload':'#uploadMediaBtn');button.disabled=true;
  try{
    const media=await api.uploadMedia(file,{alt:alt.trim(),tag:'Uploaded'});state.media.unshift(media);renderMedia();
    if(inEditor){hydrateMediaSelect(media.url);$('#articleCoverAlt').value=media.alt;feedback();rememberEditor();}
    else notify('Media uploaded','The image is now available to article editors.');
  }catch(error){report(errorMessage(error));}finally{event.target.value='';button.disabled=false;}
}
$('#mediaFileInput').addEventListener('change',uploadMedia);
$('#editorFileInput').addEventListener('change',uploadMedia);
let categoryCreateInEditor=false;
let categoryToDelete='';
function addCategory(inEditor=false){
  categoryCreateInEditor=Boolean(inEditor);
  $('#categoryForm').reset();
  $('#categoryFormError').hidden=true;
  $('#categoryDialog').showModal();
  $('#categoryNameInput').focus();
}
$('#categoryCancel').addEventListener('click',()=>$('#categoryDialog').close());
$('#categoryDeleteCancel').addEventListener('click',()=>$('#categoryDeleteDialog').close());
$('#categoryForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const name=$('#categoryNameInput').value.trim();
  const button=$('#categorySubmit'),error=$('#categoryFormError');
  if(name.length<2){error.textContent='Enter at least two characters.';error.hidden=false;return;}
  button.disabled=true;error.hidden=true;
  try{
    const category=await api.createCategory(name);
    if(!state.categories.some(item=>item.id===category.id))state.categories.push(category);
    state.categories.sort((a,b)=>a.name.localeCompare(b.name));
    $('#categoryDialog').close();render();
    if(categoryCreateInEditor){$('#articleCategory').value=category.name;feedback();rememberEditor();}
    notify('Category added',`${category.name} is ready for use.`);
  }catch(err){error.textContent=errorMessage(err);error.hidden=false;}
  finally{button.disabled=false;}
});
$('#categoryDeleteConfirm').addEventListener('click',async()=>{
  const id=categoryToDelete;
  const button=$('#categoryDeleteConfirm'),error=$('#categoryDeleteError');
  if(!id)return;
  button.disabled=true;error.hidden=true;
  try{
    await api.deleteCategory(id);
    state.categories=state.categories.filter(item=>item.id!==id);
    categoryToDelete='';
    $('#categoryDeleteDialog').close();render();
    notify('Category removed','The empty category was deleted.');
  }catch(err){error.textContent=errorMessage(err);error.hidden=false;}
  finally{button.disabled=false;}
});
$('#addCategory').addEventListener('click',()=>addCategory());
$('#editorAddCategory').addEventListener('click',()=>addCategory(true));

$('#passwordForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const current=$('#currentPassword').value,newPassword=$('#newPassword').value,confirmPassword=$('#confirmPassword').value,box=$('#passwordFeedback');
  box.hidden=true;
  if(newPassword!==confirmPassword){box.textContent='The new passwords do not match.';box.hidden=false;return;}
  if(newPassword.length<10){box.textContent='Use a password of at least 10 characters.';box.hidden=false;return;}
  const button=form.querySelector('button[type="submit"]');button.disabled=true;
  try{
    await api.changePassword(current,newPassword);
    form.reset();
    state.currentUser=null;
    currentUserEl.hidden=true;
    showLogin('Password changed. Sign in again with your new password.');
  }catch(error){box.textContent=errorMessage(error);box.hidden=false;}
  finally{button.disabled=false;}
});

$('#staffForm').addEventListener('submit',async event=>{
  event.preventDefault();
  // DOM Event.currentTarget is cleared once the submit event dispatch returns.
  // Keep the form reference before awaiting the server response.
  const form=event.currentTarget;
  const button=form.querySelector('button[type="submit"]');button.disabled=true;
  try{
    const result=await api.createUser({name:$('#staffName').value.trim(),email:$('#staffEmail').value.trim(),role:$('#staffRole').value});
    form.reset();
    $('#temporaryPassword').textContent=result.temporaryPassword||'Password supplied separately';
    $('#temporaryPasswordBox').hidden=false;
    // Show the confirmed account immediately. A subsequent list-request failure
    // must never be reported as a failed account creation or hide the password.
    state.users=[...state.users.filter(user=>user.id!==result.user.id),result.user]
      .sort((a,b)=>a.name.localeCompare(b.name));
    staffListState='ready';staffListError='';
    renderStaffList();
    notify('Staff account created',`${result.user.name} can now use the Publishing Studio.`);
    try{
      const users=await api.listUsers();
      if(!Array.isArray(users))throw new Error('Unexpected staff account response.');
      state.users=users;renderStaffList();
    }catch(error){
      notify('Account created; list not refreshed','The new account was saved. Select Refresh accounts to reload the full list.');
    }
  }catch(error){
    if(error?.status===409){
      await loadSettings();
      notify('Account already exists','This email is already registered. Find the account below and use Reset to issue a new temporary password.');
    }else notify('Account not created',errorMessage(error));
  }finally{button.disabled=false;}
});
$('#refreshStaffBtn').addEventListener('click',()=>{void loadSettings();});

$('#copyTemporaryPassword').addEventListener('click',async event=>{
  const button=event.currentTarget;
  const value=$('#temporaryPassword').textContent;
  try{await navigator.clipboard.writeText(value);button.textContent='Copied';setTimeout(()=>button.textContent='Copy password',1600);}
  catch{notify('Could not copy','Select the temporary password and copy it manually.');}
});

const sidebar=$('#sidebar'),menuButton=$('#menuBtn'),sidebarBackdrop=$('#sidebarBackdrop'),sidebarClose=$('#sidebarClose');
const mobileSidebar=typeof window.matchMedia==='function'
  ? window.matchMedia('(max-width:1100px)')
  : {get matches(){return window.innerWidth<=1100;},addEventListener(){}};
function setSidebarOpen(open){
  const shouldOpen=Boolean(open&&mobileSidebar.matches);
  sidebar.classList.toggle('open',shouldOpen);
  sidebarBackdrop.hidden=!shouldOpen;
  menuButton.setAttribute('aria-expanded',String(shouldOpen));
  menuButton.setAttribute('aria-label',shouldOpen?'Close navigation':'Open navigation');
}
menuButton.addEventListener('click',()=>setSidebarOpen(!sidebar.classList.contains('open')));
sidebarClose.addEventListener('click',()=>setSidebarOpen(false));
sidebarBackdrop.addEventListener('click',()=>setSidebarOpen(false));
sidebar.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>setSidebarOpen(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar.classList.contains('open')){setSidebarOpen(false);menuButton.focus();}});
mobileSidebar.addEventListener('change',()=>setSidebarOpen(false));

async function startWorkspace(){
  const savedList=storedJson('tdsaCmsList');
  try{
    const user=await api.me();
    state.currentUser=user;
    currentUserEl.textContent=user?.name||user?.email||'Staff';
    currentUserEl.hidden=false;
  }catch{
    showLogin('Sign in to continue.');
    return;
  }
  const loaded=await loadWorkspace();
  if(loaded===false)return;
  if(savedList){page=savedList.page||1;activeFilter=['all','Draft','Review','Published','Scheduled'].includes(savedList.activeFilter)?savedList.activeFilter:'all';search.value=savedList.query||'';categoryFilter.value=state.categories.some(c=>c.name===savedList.category)?savedList.category:'all';sortFilter.value=savedList.sort||'newest';$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));renderArticles();}
  const recovery=storedJson(recoveryKey);
  if(!recovery?.data)return;
  if(!recovery.ownerId||recovery.ownerId!==state.currentUser?.id){clearRecovery();return;}
  if(!confirm('Restore the recovery copy of this article from your last session?')){clearRecovery();return;}
  const data=recovery.data;openEditor();editingId=recovery.id;editingRevision=recovery.revision||'';
  const fields={Title:'title',Excerpt:'excerpt',Body:'bodyText',Status:'status',Category:'category',Author:'author',Slug:'slug',SeoTitle:'seoTitle',SeoDescription:'seoDescription',ClinicalStatus:'clinicalReviewStatus'};
  for(const [suffix,key] of Object.entries(fields))$('#article'+suffix).value=data[key]||'';
  $('#articleFeatured').checked=data.featured;$('#articleClinicalRequired').checked=data.clinicalReviewRequired;$('#articleScheduledAt').value=toLocalDateTime(data.scheduledAt);hydrateMediaSelect(data.coverImage?.url);$('#articleCoverAlt').value=data.coverImage?.alt||'';$('#articleSlug').dataset.touched='true';$('#excerptCount').textContent=(data.excerpt||'').length;syncConditionalFields();rememberEditor();
}
startWorkspace();

