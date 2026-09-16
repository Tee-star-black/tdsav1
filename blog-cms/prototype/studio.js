const STORAGE_KEY='tdsa-blog-cms-prototype-v2';
const DEFAULT_CATEGORIES=['Health Education','Company News','Patient Guides','Digital Health'];
const DEFAULT_ARTICLES=[
 {id:'a1',title:'5 Ways Telemedicine Improves Access to Care',excerpt:'How connected care can reduce distance and improve access across South Africa.',body:'Telemedicine can help patients reach care when distance, work schedules or mobility make in-person visits difficult.\n\nThis draft demonstrates how the eventual CMS will render structured editorial content into the public TeleDoctorSA blog.',status:'Published',category:'Health Education',author:'Dr N. Patel',slug:'telemedicine-improves-access-to-care',featured:true,updatedAt:'2026-09-16T08:24:00.000Z'},
 {id:'a2',title:'Keeping Your Family Healthy This Winter',excerpt:'Practical guidance for families navigating colder months and seasonal illness.',body:'Seasonal illness can disrupt families quickly. Clear information can help people understand common symptoms, prevention and when professional care may be appropriate.',status:'Review',category:'Health Education',author:'T. Maseko',slug:'keeping-your-family-healthy-this-winter',featured:false,updatedAt:'2026-09-15T14:03:00.000Z'},
 {id:'a3',title:'TeleDoctorSA at the African Health Conference',excerpt:'Highlights from our team, our technology and the conversations shaping digital care.',body:'TeleDoctorSA joined healthcare leaders to discuss accessible digital care and connected clinical workflows.',status:'Published',category:'Company News',author:'T. Sibiya',slug:'african-health-conference',featured:true,updatedAt:'2026-09-12T07:12:00.000Z'},
 {id:'a4',title:'A Guide to Your First Telehealth Appointment',excerpt:'What to expect, how to prepare and how to get the most from a virtual consultation.',body:'A little preparation can make a virtual consultation smoother. Keep your medication list, recent readings and key questions nearby.',status:'Draft',category:'Patient Guides',author:'TeleDoctorSA Editorial',slug:'first-telehealth-appointment',featured:false,updatedAt:'2026-09-10T12:20:00.000Z'},
 {id:'a5',title:'Understanding Blood Pressure at Home',excerpt:'A practical introduction to home readings, healthy habits and when to seek help.',body:'Home blood pressure readings can be useful when they are taken consistently and interpreted in clinical context.',status:'Review',category:'Digital Health',author:'Dr N. Patel',slug:'understanding-blood-pressure-at-home',featured:false,updatedAt:'2026-09-09T06:00:00.000Z'},
 {id:'a6',title:'Why Connected Care Matters Between Appointments',excerpt:'Digital health can help people stay connected to care beyond the consultation room.',body:'Care does not stop when a consultation ends. Digital tools can support reminders, follow-up and continuity between visits.',status:'Published',category:'Digital Health',author:'T. Maseko',slug:'connected-care-between-appointments',featured:false,updatedAt:'2026-09-08T09:45:00.000Z'}
];
const MEDIA=[
 {name:'TeleDoctorSA clinical team',type:'Image',tag:'Company',tone:'clinical'},
 {name:'Connected care ecosystem',type:'Image',tag:'Digital Health',tone:'network'},
 {name:'Doctor video consultation',type:'Image',tag:'Telemedicine',tone:'consult'},
 {name:'ECG247 monitoring',type:'Image',tag:'Devices',tone:'ecg'},
 {name:'Patient mobile app',type:'Image',tag:'Product',tone:'mobile'},
 {name:'Healthcare dashboard',type:'Image',tag:'Platform',tone:'dashboard'}
];

function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&Array.isArray(saved.articles))return saved;}catch(_){}return {articles:DEFAULT_ARTICLES,categories:DEFAULT_CATEGORIES};}
let state=loadState();
let activeFilter='all';
let editingId=null;

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const list=$('#articleList'),empty=$('#emptyState'),count=$('#resultCount'),search=$('#articleSearch'),globalSearch=$('#globalSearch'),categoryFilter=$('#categoryFilter'),sortFilter=$('#sortFilter');
const editor=$('#editorDialog'),preview=$('#previewDialog');

function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function slugify(value){return String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);}
function prettyDate(value){const date=new Date(value);return new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(date);}
function notify(title,message){$('#toastTitle').textContent=title;$('#toastMessage').textContent=message;const toast=$('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2700);}

function updateCounts(){
 const counts=status=>state.articles.filter(a=>a.status===status).length;
 $('#publishedMetric').textContent=counts('Published');$('#reviewMetric').textContent=counts('Review');$('#draftMetric').textContent=counts('Draft');
 $('#allCount').textContent=state.articles.length;$('#publishedCount').textContent=counts('Published');$('#draftCount').textContent=counts('Draft');$('#reviewCount').textContent=counts('Review');
 $('#articleNavCount').textContent=state.articles.length;$('#reviewNavCount').textContent=counts('Review');
}
function hydrateCategories(){
 const current=categoryFilter.value||'all';categoryFilter.innerHTML='<option value="all">All categories</option>'+state.categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('');categoryFilter.value=state.categories.includes(current)?current:'all';
 $('#articleCategory').innerHTML=state.categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('');
}
function filteredArticles(){
 const query=search.value.trim().toLowerCase(),selected=categoryFilter.value;
 const rows=state.articles.filter(a=>(!query||`${a.title} ${a.excerpt} ${a.author} ${a.category}`.toLowerCase().includes(query))&&(activeFilter==='all'||a.status===activeFilter)&&(selected==='all'||a.category===selected));
 return rows.sort((a,b)=>sortFilter.value==='az'?a.title.localeCompare(b.title):sortFilter.value==='oldest'?new Date(a.updatedAt)-new Date(b.updatedAt):new Date(b.updatedAt)-new Date(a.updatedAt));
}
function renderArticles(){
 const rows=filteredArticles();
 list.innerHTML=rows.map(a=>`<article class="article-row" data-id="${a.id}"><button class="story story-button" data-edit="${a.id}"><div class="thumb ${escapeHtml(a.category.toLowerCase().replace(/\s+/g,'-'))}" aria-hidden="true"><span>${a.featured?'★':'+'}</span></div><div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt||'No introduction yet.')}</p></div></button><span class="badge ${a.status}">${a.status==='Review'?'In review':a.status}</span><span class="category">${escapeHtml(a.category)}</span><span class="date"><span class="author">${escapeHtml(a.author)}</span><br>${prettyDate(a.updatedAt)}</span><button class="row-menu" data-edit="${a.id}" aria-label="Edit ${escapeHtml(a.title)}">•••</button></article>`).join('');
 empty.hidden=rows.length!==0;count.textContent=`Showing ${rows.length} ${rows.length===1?'story':'stories'}`;updateCounts();
 $$('[data-edit]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.edit)));
}
function renderMedia(){
 const q=$('#mediaSearch').value.trim().toLowerCase();$('#mediaGrid').innerHTML=MEDIA.filter(m=>!q||`${m.name} ${m.tag}`.toLowerCase().includes(q)).map(m=>`<article class="media-item"><div class="media-visual ${m.tone}"><span>✦</span></div><div><span>${escapeHtml(m.tag)}</span><h3>${escapeHtml(m.name)}</h3><p>${m.type} · Sanity-ready placeholder</p></div><button aria-label="Media options">•••</button></article>`).join('');
}
function renderCategories(){
 $('#categoryGrid').innerHTML=state.categories.map(c=>{const total=state.articles.filter(a=>a.category===c).length,published=state.articles.filter(a=>a.category===c&&a.status==='Published').length;return `<article class="category-card"><div class="category-symbol">${escapeHtml(c.slice(0,2).toUpperCase())}</div><div><h3>${escapeHtml(c)}</h3><p>${total} ${total===1?'story':'stories'} · ${published} published</p></div><button data-category-remove="${escapeHtml(c)}" ${total?'disabled title="Move articles before deleting this category"':''}>×</button></article>`;}).join('');
 $$('[data-category-remove]').forEach(b=>b.addEventListener('click',()=>{state.categories=state.categories.filter(c=>c!==b.dataset.categoryRemove);persist();hydrateCategories();renderCategories();notify('Category removed','The unused category was removed from this prototype.');}));
}
function render(){hydrateCategories();renderArticles();renderMedia();renderCategories();}

function showView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));$$('[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===name));if(innerWidth<=760)$('#sidebar').classList.remove('open');}
$$('[data-view]').forEach(el=>el.addEventListener('click',e=>{if(el.tagName==='A'&&el.getAttribute('href')!=='#')return;e.preventDefault();showView(el.dataset.view);}));
$$('[data-status-view]').forEach(el=>el.addEventListener('click',()=>{showView('articles');activeFilter=el.dataset.statusView;$$('.tabs button').forEach(t=>t.classList.toggle('active',t.dataset.filter===activeFilter));renderArticles();}));

function resetEditor(){editingId=null;$('#editorForm').reset();$('#articleAuthor').value='TeleDoctorSA Editorial';$('#articleStatus').value='Draft';$('#editorEyebrow').textContent='NEW STORY';$('#editorHeading').textContent='Start with the idea.';$('#saveState').textContent='Not saved';$('#articleSlug').value='';$('#excerptCount').textContent='0';}
function openEditor(id){
 resetEditor();
 if(id){const a=state.articles.find(item=>item.id===id);if(!a)return;editingId=id;$('#editorEyebrow').textContent=a.status.toUpperCase();$('#editorHeading').textContent='Shape the story.';$('#articleTitle').value=a.title;$('#articleExcerpt').value=a.excerpt||'';$('#articleBody').value=a.body||'';$('#articleStatus').value=a.status;$('#articleCategory').value=a.category;$('#articleAuthor').value=a.author;$('#articleSlug').value=a.slug;$('#articleFeatured').checked=Boolean(a.featured);$('#excerptCount').textContent=(a.excerpt||'').length;$('#saveState').textContent=`Last updated ${prettyDate(a.updatedAt)}`;}
 editor.showModal();
}
$$('[data-action="new"]').forEach(button=>button.addEventListener('click',()=>openEditor()));
$('#closeEditor').addEventListener('click',()=>editor.close());
$('#articleTitle').addEventListener('input',e=>{if(!editingId||!$('#articleSlug').dataset.touched)$('#articleSlug').value=slugify(e.target.value);});
$('#articleSlug').addEventListener('input',e=>{e.target.dataset.touched='true';e.target.value=slugify(e.target.value);});
$('#articleExcerpt').addEventListener('input',e=>$('#excerptCount').textContent=e.target.value.length);

function editorData(){return {title:$('#articleTitle').value.trim(),excerpt:$('#articleExcerpt').value.trim(),body:$('#articleBody').value.trim(),status:$('#articleStatus').value,category:$('#articleCategory').value,author:$('#articleAuthor').value.trim()||'TeleDoctorSA Editorial',slug:slugify($('#articleSlug').value||$('#articleTitle').value),featured:$('#articleFeatured').checked};}
function validateArticle(data){if(!data.title)return 'Add a title before saving.';if(!data.slug)return 'Add a valid URL slug.';if(state.articles.some(a=>a.slug===data.slug&&a.id!==editingId))return 'That URL slug is already being used.';if(data.status==='Published'&&(!data.excerpt||!data.body))return 'Published stories need an introduction and article body.';return '';}
$('#saveArticle').addEventListener('click',()=>{const data=editorData(),error=validateArticle(data);if(error){notify('Check this story',error);return;}const now=new Date().toISOString();if(editingId){const index=state.articles.findIndex(a=>a.id===editingId);state.articles[index]={...state.articles[index],...data,updatedAt:now};}else{editingId=`a-${Date.now()}`;state.articles.unshift({id:editingId,...data,updatedAt:now});}persist();render();editor.close();notify(data.status==='Published'?'Story marked published':'Story saved',data.status==='Published'?'Prototype state updated. Real publishing will require Sanity + deployment verification.':'Your draft is stored in this browser.');});

function openPreview(){const data=editorData();$('#previewTitle').textContent=data.title||'Untitled story';$('#previewExcerpt').textContent=data.excerpt||'No introduction yet.';$('#previewCategory').textContent=data.category;$('#previewMeta').textContent=`${data.author} · Preview only`;$('#previewBody').innerHTML=(data.body||'Start writing to see the article preview.').split(/\n\n+/).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');preview.showModal();}
$('#previewBtn').addEventListener('click',openPreview);$('#closePreview').addEventListener('click',()=>preview.close());

search.addEventListener('input',renderArticles);categoryFilter.addEventListener('change',renderArticles);sortFilter.addEventListener('change',renderArticles);globalSearch.addEventListener('input',()=>{showView('articles');search.value=globalSearch.value;renderArticles();});
$$('.tabs button').forEach(tab=>tab.addEventListener('click',()=>{$$('.tabs button').forEach(t=>t.classList.remove('active'));tab.classList.add('active');activeFilter=tab.dataset.filter;renderArticles();}));
$('#mediaSearch').addEventListener('input',renderMedia);
$('#uploadMock').addEventListener('click',()=>notify('Media upload scaffolded','Real file upload will be connected to Sanity assets rather than browser storage.'));
$('#addCategory').addEventListener('click',()=>{const name=prompt('Category name');if(!name)return;const clean=name.trim();if(!clean||state.categories.some(c=>c.toLowerCase()===clean.toLowerCase()))return notify('Category not added','Use a unique category name.');state.categories.push(clean);persist();render();notify('Category added',`${clean} is ready for articles.`);});
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tdsa-blog-cms-prototype.json';a.click();URL.revokeObjectURL(url);notify('Export ready','Prototype content was exported as JSON.');});

const sidebar=$('#sidebar');$('#menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));document.addEventListener('click',event=>{if(innerWidth<=760&&sidebar.classList.contains('open')&&!sidebar.contains(event.target)&&event.target.id!=='menuBtn')sidebar.classList.remove('open');});
render();