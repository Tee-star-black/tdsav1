const api=window.TDSACmsApi;
let state={articles:[],categories:[],media:[],health:null};
let activeFilter='all';
let editingId=null;
let editingRevision='', editorBaseline='', saving=false, page=1;
const pageSize=10;
const recoveryKey='tdsaCmsEditorRecovery';
function storedJson(key){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
function storeJson(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function clearRecovery(){try{sessionStorage.removeItem(recoveryKey);}catch{}}
function feedback(message=''){const el=$('#editorFeedback');el.textContent=message;el.hidden=!message;}
function isDirty(){return editor.open&&JSON.stringify(editorData())!==editorBaseline;}
function rememberEditor(){if(isDirty()){const stored=storeJson(recoveryKey,{id:editingId,revision:editingRevision,data:editorData()});$('#saveState').textContent=stored?'Unsaved changes · recovery copy in this tab':'Unsaved changes';}}
function closeEditor(){if(saving)return;if(isDirty()&&!confirm('Discard these unsaved changes?'))return;clearRecovery();editor.close();}


const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const list=$('#articleList'),empty=$('#emptyState'),count=$('#resultCount'),search=$('#articleSearch'),globalSearch=$('#globalSearch'),categoryFilter=$('#categoryFilter'),sortFilter=$('#sortFilter');
const editor=$('#editorDialog'),preview=$('#previewDialog');

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
function deliveryMessage(delivery){if(!delivery)return '';if(!delivery.configured)return ' The live website still needs a build and deployment.';return delivery.ok?' A website rebuild was requested; live deployment is not yet verified.':' The website rebuild request failed. Retry deployment before expecting the live site to change.';}
function errorMessage(error){return error?.details?.length?error.details.join(' '):error?.message||'Something went wrong.';}

function setBackendStatus(mode,message){
  const el=$('#backendStatus');el.classList.remove('online','offline');if(mode)el.classList.add(mode);
  el.querySelector('b').textContent=message;
  $('#backendMetric').textContent=mode==='online'?(state.health?.backend||'API').toUpperCase():'OFF';
  $('#backendMetricNote').textContent=mode==='online'?(state.health?.backend==='sanity'?`${state.health.projectId}/${state.health.dataset} · ${state.health.categoryCount??0} categories`:'Connected content service'):'Backend unavailable';
}

async function loadWorkspace({quiet=false,authRetry=true}={}){
  if(!quiet)setBackendStatus('','Connecting backend…');

  const requests=[
    ['health',api.health()],
    ['articles',api.listArticles()],
    ['categories',api.listCategories()],
    ['media',api.listMedia()],
  ];
  const results=await Promise.allSettled(requests.map(([,promise])=>promise));

  const unauthorized=results.some(result=>result.status==='rejected'&&result.reason?.status===401);
  if(unauthorized&&authRetry){
    const token=prompt('Enter the TeleDoctorSA Publishing Studio access token:','');
    if(token?.trim()){
      api.setAccessToken(token.trim());
      return loadWorkspace({quiet,authRetry:false});
    }
  }
  const values={};
  const failures=[];

  results.forEach((result,index)=>{
    const key=requests[index][0];
    if(result.status==='fulfilled')values[key]=result.value;
    else failures.push({key,error:result.reason});
  });

  state={
    health:values.health||state.health,
    articles:Array.isArray(values.articles)?values.articles:state.articles,
    categories:Array.isArray(values.categories)?values.categories:state.categories,
    media:Array.isArray(values.media)?values.media:state.media,
  };

  if(values.health){
    const secured=values.health.authRequired?' · secured':'';
    const message=failures.length?`${values.health.backend} connected · partial data`:`${values.health.backend} backend connected${secured}`;
    setBackendStatus('online',message);
  }else{
    setBackendStatus('offline','Backend unavailable');
  }

  render();

  if(!quiet&&failures.length){
    const failedNames=failures.map(item=>item.key).join(', ');
    const authFailed=failures.some(item=>item.error?.status===401);
    notify(authFailed?'Studio access required':'Some CMS data could not load',authFailed?'The access token was not accepted. Refresh and enter the correct Studio token.':`Failed: ${failedNames}. Other available content has still been loaded.`);
  }
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
  $('#categoryGrid').innerHTML=state.categories.map(c=>{const total=state.articles.filter(a=>a.category===c.name).length,published=state.articles.filter(a=>a.category===c.name&&a.status==='Published').length;return `<article class="category-card"><div class="category-symbol">${escapeHtml(c.name.slice(0,2).toUpperCase())}</div><div><h3>${escapeHtml(c.name)}</h3><p>${total} ${total===1?'story':'stories'} · ${published} published</p></div><button data-category-remove="${escapeHtml(c.id)}" ${total?'disabled title="Move articles before deleting this category"':''}>×</button></article>`;}).join('');
  $$('[data-category-remove]').forEach(b=>b.addEventListener('click',async()=>{try{await api.deleteCategory(b.dataset.categoryRemove);state.categories=state.categories.filter(c=>c.id!==b.dataset.categoryRemove);render();notify('Category removed','The category was removed from the content service.');}catch(error){notify('Category not removed',errorMessage(error));}}));
}

function render(){hydrateCategories();renderArticles();renderMedia();renderCategories();}

function showView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));$$('[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===name));if(innerWidth<=760)$('#sidebar').classList.remove('open');}
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
  editingId=null;editingRevision='';feedback();$('#editorForm').reset();$('#articleAuthor').value='TeleDoctorSA Editorial';$('#articleStatus').value='Draft';$('#editorEyebrow').textContent='NEW STORY';$('#editorHeading').textContent='Start with the idea.';$('#saveState').textContent='Not saved';$('#articleSlug').value='';$('#articleSlug').dataset.touched='';$('#excerptCount').textContent='0';$('#deleteArticle').hidden=true;hydrateCategories();hydrateMediaSelect();syncConditionalFields();
}

function toLocalDateTime(value){if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return '';const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);}

function openEditor(id){
  if(saving)return;
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
    if(!data.coverImage.url&&!data.coverImage.assetId)errors.push('Published stories require a cover image.');
    if(!data.coverImage.alt)errors.push('Published cover images require alternative text.');
    if(data.clinicalReviewRequired&&data.clinicalReviewStatus!=='approved')errors.push('Clinical content must be approved before publication.');
  }

  return errors.join(' ');
}

async function saveStory(forcedStatus){
  if(saving)return;
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
  if(saving||!editingId)return;
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
async function addCategory(inEditor=false){
  const name=prompt('Category name');if(!name?.trim())return;
  const button=$(inEditor?'#editorAddCategory':'#addCategory');button.disabled=true;
  try{
    const category=await api.createCategory(name.trim());if(!state.categories.some(c=>c.id===category.id))state.categories.push(category);
    state.categories.sort((a,b)=>a.name.localeCompare(b.name));render();
    if(inEditor){$('#articleCategory').value=category.name;feedback();rememberEditor();}
    else notify('Category added',`${category.name} is now available to the editor.`);
  }catch(error){if(inEditor)feedback(errorMessage(error));else notify('Category not added',errorMessage(error));}
  finally{button.disabled=false;}
}
$('#addCategory').addEventListener('click',()=>addCategory());
$('#editorAddCategory').addEventListener('click',()=>addCategory(true));

const sidebar=$('#sidebar');$('#menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));document.addEventListener('click',event=>{if(innerWidth<=760&&sidebar.classList.contains('open')&&!sidebar.contains(event.target)&&event.target.id!=='menuBtn')sidebar.classList.remove('open');});

async function startWorkspace(){
  const savedList=storedJson('tdsaCmsList');
  await loadWorkspace();
  if(savedList){page=savedList.page||1;activeFilter=['all','Draft','Review','Published','Scheduled'].includes(savedList.activeFilter)?savedList.activeFilter:'all';search.value=savedList.query||'';categoryFilter.value=state.categories.some(c=>c.name===savedList.category)?savedList.category:'all';sortFilter.value=savedList.sort||'newest';$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));renderArticles();}
  const recovery=storedJson(recoveryKey);
  if(!recovery?.data)return;
  if(!confirm('Restore the unsaved article from this tab?')){clearRecovery();return;}
  const data=recovery.data;openEditor();editingId=recovery.id;editingRevision=recovery.revision||'';
  const fields={Title:'title',Excerpt:'excerpt',Body:'bodyText',Status:'status',Category:'category',Author:'author',Slug:'slug',SeoTitle:'seoTitle',SeoDescription:'seoDescription',ClinicalStatus:'clinicalReviewStatus'};
  for(const [suffix,key] of Object.entries(fields))$('#article'+suffix).value=data[key]||'';
  $('#articleFeatured').checked=data.featured;$('#articleClinicalRequired').checked=data.clinicalReviewRequired;$('#articleScheduledAt').value=toLocalDateTime(data.scheduledAt);hydrateMediaSelect(data.coverImage?.url);$('#articleCoverAlt').value=data.coverImage?.alt||'';$('#articleSlug').dataset.touched='true';$('#excerptCount').textContent=(data.excerpt||'').length;syncConditionalFields();rememberEditor();
}
startWorkspace();

