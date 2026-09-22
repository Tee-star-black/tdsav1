const api=window.TDSACmsApi;
let state={articles:[],categories:[],media:[],health:null};
let activeFilter='all';
let editingId=null;

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const list=$('#articleList'),empty=$('#emptyState'),count=$('#resultCount'),search=$('#articleSearch'),globalSearch=$('#globalSearch'),categoryFilter=$('#categoryFilter'),sortFilter=$('#sortFilter');
const editor=$('#editorDialog'),preview=$('#previewDialog');

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function slugify(value){return String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);}
function prettyDate(value){if(!value)return 'Not published';const date=new Date(value);if(Number.isNaN(date.getTime()))return 'Unknown date';return new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);}
function notify(title,message){$('#toastTitle').textContent=title;$('#toastMessage').textContent=message;const toast=$('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200);}
function errorMessage(error){return error?.details?.length?error.details.join(' '):error?.message||'Something went wrong.';}

function setBackendStatus(mode,message){
  const el=$('#backendStatus');el.classList.remove('online','offline');el.classList.add(mode);
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
  $('#articleNavCount').textContent=state.articles.length;$('#reviewNavCount').textContent=counts('Review');
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
  editorSelect.innerHTML=state.categories.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  editorSelect.value=state.categories.some(c=>c.name===editorCurrent)?editorCurrent:state.categories[0].name;
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
  const rows=filteredArticles();
  list.innerHTML=rows.map(a=>`<article class="article-row" data-id="${escapeHtml(a.id)}"><button class="story story-button" data-edit="${escapeHtml(a.id)}"><div class="thumb" aria-hidden="true">${a.coverImage?.url?`<img src="${escapeHtml(a.coverImage.url)}" alt="">`:`<span>${a.featured?'★':'+'}</span>`}</div><div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt||'No introduction yet.')}</p></div></button><span class="badge ${escapeHtml(a.status)}">${a.status==='Review'?'In review':escapeHtml(a.status)}</span><span class="category">${escapeHtml(a.category)}</span><span class="date"><span class="author">${escapeHtml(a.author)}</span><br>${prettyDate(a.updatedAt)}</span><button class="row-menu" data-edit="${escapeHtml(a.id)}" aria-label="Edit ${escapeHtml(a.title)}">•••</button></article>`).join('');
  empty.hidden=rows.length!==0;count.textContent=`Showing ${rows.length} ${rows.length===1?'story':'stories'}`;updateCounts();
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
$$('[data-status-view]').forEach(el=>el.addEventListener('click',()=>{showView('articles');activeFilter=el.dataset.statusView;$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));renderArticles();}));

function syncConditionalFields(){
  $('#scheduleField').hidden=$('#articleStatus').value!=='Scheduled';
  $('#clinicalStatusField').hidden=!$('#articleClinicalRequired').checked;
  if(!$('#articleClinicalRequired').checked)$('#articleClinicalStatus').value='pending';
}

function resetEditor(){
  editingId=null;$('#editorForm').reset();$('#articleAuthor').value='TeleDoctorSA Editorial';$('#articleStatus').value='Draft';$('#editorEyebrow').textContent='NEW STORY';$('#editorHeading').textContent='Start with the idea.';$('#saveState').textContent='Not saved';$('#articleSlug').value='';$('#articleSlug').dataset.touched='';$('#excerptCount').textContent='0';$('#deleteArticle').hidden=true;hydrateCategories();hydrateMediaSelect();syncConditionalFields();
}

function toLocalDateTime(value){if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return '';const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);}

function openEditor(id){
  resetEditor();
  if(id){
    const a=state.articles.find(item=>item.id===id);if(!a)return;editingId=id;
    $('#editorEyebrow').textContent=a.status.toUpperCase();$('#editorHeading').textContent='Shape the story.';$('#articleTitle').value=a.title;$('#articleExcerpt').value=a.excerpt||'';$('#articleBody').value=a.bodyText||'';$('#articleStatus').value=a.status;$('#articleCategory').value=a.category;$('#articleAuthor').value=a.author;$('#articleSlug').value=a.slug;$('#articleFeatured').checked=Boolean(a.featured);$('#articleClinicalRequired').checked=Boolean(a.clinicalReviewRequired);$('#articleClinicalStatus').value=a.clinicalReviewStatus==='not_required'?'pending':a.clinicalReviewStatus;$('#articleScheduledAt').value=toLocalDateTime(a.scheduledAt);$('#articleSeoTitle').value=a.seoTitle||'';$('#articleSeoDescription').value=a.seoDescription||'';$('#excerptCount').textContent=(a.excerpt||'').length;$('#saveState').textContent=`Last updated ${prettyDate(a.updatedAt)}`;hydrateMediaSelect(a.coverImage?.url||'');$('#articleCoverAlt').value=a.coverImage?.alt||'';$('#deleteArticle').hidden=false;syncConditionalFields();
  }
  editor.showModal();
}

$$('[data-action="new"]').forEach(button=>button.addEventListener('click',()=>openEditor()));
$('#closeEditor').addEventListener('click',()=>editor.close());
$('#articleTitle').addEventListener('input',e=>{if(!editingId||!$('#articleSlug').dataset.touched)$('#articleSlug').value=slugify(e.target.value);});
$('#articleSlug').addEventListener('input',e=>{e.target.dataset.touched='true';e.target.value=slugify(e.target.value);});
$('#articleExcerpt').addEventListener('input',e=>$('#excerptCount').textContent=e.target.value.length);
$('#articleStatus').addEventListener('change',syncConditionalFields);
$('#articleClinicalRequired').addEventListener('change',syncConditionalFields);
$('#articleCoverImage').addEventListener('change',e=>{const option=e.target.selectedOptions[0];if(option?.dataset.alt&&!$('#articleCoverAlt').value.trim())$('#articleCoverAlt').value=option.dataset.alt;});

function editorData(){
  const media=state.media.find(m=>m.url===$('#articleCoverImage').value);
  return {
    title:$('#articleTitle').value.trim(),excerpt:$('#articleExcerpt').value.trim(),bodyText:$('#articleBody').value.trim(),status:$('#articleStatus').value,category:$('#articleCategory').value,author:$('#articleAuthor').value.trim()||'TeleDoctorSA Editorial',slug:slugify($('#articleSlug').value||$('#articleTitle').value),featured:$('#articleFeatured').checked,
    clinicalReviewRequired:$('#articleClinicalRequired').checked,clinicalReviewStatus:$('#articleClinicalRequired').checked?$('#articleClinicalStatus').value:'not_required',scheduledAt:$('#articleStatus').value==='Scheduled'&&$('#articleScheduledAt').value?new Date($('#articleScheduledAt').value).toISOString():'',
    coverImage:{assetId:media?.id||'',url:$('#articleCoverImage').value,alt:$('#articleCoverAlt').value.trim()},seoTitle:$('#articleSeoTitle').value.trim(),seoDescription:$('#articleSeoDescription').value.trim()
  };
}

function validateArticleClient(data){
  const errors=[];
  if(data.title.length<5)errors.push('Title must be at least 5 characters.');
  if(!data.slug)errors.push('Add a valid URL slug.');
  if(!data.category)errors.push('Choose a category.');
  if(!data.author)errors.push('Choose or enter an author.');
  if(data.excerpt.length>220)errors.push('Short introduction must be 220 characters or fewer.');
  if(data.seoTitle.length>60)errors.push('SEO title must be 60 characters or fewer.');
  if(data.seoDescription.length>160)errors.push('SEO description must be 160 characters or fewer.');
  if(data.status==='Scheduled'&&!data.scheduledAt)errors.push('Choose a schedule date and time.');

  if(data.status==='Published'){
    if(data.excerpt.length<20)errors.push('Published stories need a short introduction of at least 20 characters.');
    if(data.bodyText.length<80)errors.push('Published stories need a complete article body of at least 80 characters.');
    if(!data.coverImage.url&&!data.coverImage.assetId)errors.push('Published stories require a cover image.');
    if(!data.coverImage.alt)errors.push('Published cover images require alternative text.');
    if(data.clinicalReviewRequired&&data.clinicalReviewStatus!=='approved')errors.push('Clinical content must be approved before publication.');
  }

  return errors.join(' ');
}

$('#saveArticle').addEventListener('click',async()=>{
  const data=editorData(),error=validateArticleClient(data);if(error){notify('Check this story',error);return;}
  const button=$('#saveArticle');button.disabled=true;button.textContent='Saving…';
  try{
    const saved=editingId?await api.updateArticle(editingId,data):await api.createArticle(data);
    editingId=saved.id;
    const index=state.articles.findIndex(a=>a.id===saved.id);if(index>=0)state.articles[index]=saved;else state.articles.unshift(saved);
    render();editor.close();notify(saved.status==='Published'?'Story published':'Story saved',saved.status==='Published'?'The public content API now exposes this article.':'Changes are stored in the shared content backend.');
  }catch(err){notify('Story not saved',errorMessage(err));}
  finally{button.disabled=false;button.textContent='Save story →';}
});

$('#deleteArticle').addEventListener('click',async()=>{
  if(!editingId)return;
  const article=state.articles.find(item=>item.id===editingId);
  if(!article)return;
  if(!confirm(`Delete “${article.title}”? This removes it from the content backend and, if published, from the public feed.`))return;
  const button=$('#deleteArticle');button.disabled=true;button.textContent='Deleting…';
  try{
    await api.deleteArticle(editingId);
    state.articles=state.articles.filter(item=>item.id!==editingId);
    editingId=null;editor.close();render();notify('Article deleted','The article was removed from the content backend and public API.');
  }catch(error){notify('Article not deleted',errorMessage(error));}
  finally{button.disabled=false;button.textContent='Delete article';}
});

function openPreview(){const data=editorData();$('#previewTitle').textContent=data.title||'Untitled story';$('#previewExcerpt').textContent=data.excerpt||'No introduction yet.';$('#previewCategory').textContent=data.category||'Uncategorised';$('#previewMeta').textContent=`${data.author} · ${data.status} preview`;$('#previewBody').innerHTML=(data.bodyText||'Start writing to see the article preview.').split(/\n\n+/).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');preview.showModal();}
$('#previewBtn').addEventListener('click',openPreview);$('#closePreview').addEventListener('click',()=>preview.close());

search.addEventListener('input',renderArticles);categoryFilter.addEventListener('change',renderArticles);sortFilter.addEventListener('change',renderArticles);globalSearch.addEventListener('input',()=>{showView('articles');search.value=globalSearch.value;renderArticles();});
$$('.tabs button').forEach(tab=>tab.addEventListener('click',()=>{$$('.tabs button').forEach(t=>t.classList.remove('active'));tab.classList.add('active');activeFilter=tab.dataset.filter;renderArticles();}));
$('#mediaSearch').addEventListener('input',renderMedia);
$('#refreshBtn').addEventListener('click',()=>loadWorkspace());

$('#uploadMediaBtn').addEventListener('click',()=>$('#mediaFileInput').click());
$('#mediaFileInput').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>6*1024*1024){notify('Image too large','Use an image smaller than 6 MB.');event.target.value='';return;}
  const alt=prompt('Describe this image for accessibility:','')??'';if(!alt.trim()){notify('Upload cancelled','Alternative text is required for editorial images.');event.target.value='';return;}
  try{const media=await api.uploadMedia(file,{alt:alt.trim(),tag:'Uploaded'});state.media.unshift(media);renderMedia();notify('Media uploaded','The image is now available to article editors.');}catch(error){notify('Upload failed',errorMessage(error));}finally{event.target.value='';}
});

$('#addCategory').addEventListener('click',async()=>{
  const name=prompt('Category name');if(!name)return;
  try{const category=await api.createCategory(name.trim());state.categories.push(category);state.categories.sort((a,b)=>a.name.localeCompare(b.name));render();notify('Category added',`${category.name} is now available to the editor.`);}catch(error){notify('Category not added',errorMessage(error));}
});

const sidebar=$('#sidebar');$('#menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));document.addEventListener('click',event=>{if(innerWidth<=760&&sidebar.classList.contains('open')&&!sidebar.contains(event.target)&&event.target.id!=='menuBtn')sidebar.classList.remove('open');});

loadWorkspace();
