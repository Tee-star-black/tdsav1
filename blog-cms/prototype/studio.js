const articles=[
 {title:'5 Ways Telemedicine Improves Access to Care',excerpt:'How connected care can reduce distance and improve access across South Africa.',status:'Published',category:'Health Education',author:'Dr N. Patel',date:'Today · 10:24'},
 {title:'Keeping Your Family Healthy This Winter',excerpt:'Practical guidance for families navigating colder months and seasonal illness.',status:'Review',category:'Health Education',author:'T. Maseko',date:'Yesterday · 16:03'},
 {title:'TeleDoctorSA at the African Health Conference',excerpt:'Highlights from our team, our technology and the conversations shaping digital care.',status:'Published',category:'Company News',author:'T. Sibiya',date:'28 Oct · 09:12'},
 {title:'A Guide to Your First Telehealth Appointment',excerpt:'What to expect, how to prepare and how to get the most from a virtual consultation.',status:'Draft',category:'Patient Guides',author:'Editorial',date:'25 Oct · 14:20'},
 {title:'Understanding Blood Pressure at Home',excerpt:'A practical introduction to home readings, healthy habits and when to seek help.',status:'Review',category:'Digital Health',author:'Dr N. Patel',date:'24 Oct · 08:00'},
 {title:'Why Connected Care Matters Between Appointments',excerpt:'Digital health can help people stay connected to care beyond the consultation room.',status:'Published',category:'Digital Health',author:'T. Maseko',date:'20 Oct · 11:45'}
];

const list=document.querySelector('#articleList');
const empty=document.querySelector('#emptyState');
const count=document.querySelector('#resultCount');
const search=document.querySelector('#articleSearch');
const globalSearch=document.querySelector('#globalSearch');
const category=document.querySelector('#categoryFilter');
const tabs=[...document.querySelectorAll('.tabs button')];
let activeFilter='all';

function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function render(){
 const query=search.value.trim().toLowerCase();
 const selectedCategory=category.value;
 const filtered=articles.filter(a=>{
   const matchesText=!query||`${a.title} ${a.excerpt} ${a.author} ${a.category}`.toLowerCase().includes(query);
   const matchesStatus=activeFilter==='all'||a.status===activeFilter;
   const matchesCategory=selectedCategory==='all'||a.category===selectedCategory;
   return matchesText&&matchesStatus&&matchesCategory;
 });
 list.innerHTML=filtered.map(a=>`<article class="article-row"><div class="story"><div class="thumb" aria-hidden="true"></div><div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt)}</p></div></div><span class="badge ${a.status}">${a.status==='Review'?'In review':a.status}</span><span class="category">${escapeHtml(a.category)}</span><span class="date"><span class="author">${escapeHtml(a.author)}</span><br>${escapeHtml(a.date)}</span><button class="row-menu" aria-label="Article options">•••</button></article>`).join('');
 empty.hidden=filtered.length!==0;
 count.textContent=`Showing ${filtered.length} ${filtered.length===1?'story':'stories'}`;
}

search.addEventListener('input',render); category.addEventListener('change',render);
globalSearch.addEventListener('input',()=>{search.value=globalSearch.value;render();});
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active'));tab.classList.add('active');activeFilter=tab.dataset.filter;render();}));

const dialog=document.querySelector('#editorDialog');
document.querySelectorAll('[data-action="new"]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
document.querySelector('#createDraft').addEventListener('click',event=>{
 const title=document.querySelector('#newTitle');
 if(!title.value.trim()){event.preventDefault();title.focus();return;}
 articles.unshift({title:title.value.trim(),excerpt:'New editorial draft. Continue writing when you are ready.',status:'Draft',category:document.querySelector('#newCategory').value,author:'TeleDoctorSA Editorial',date:'Just now'});
 search.value=''; activeFilter='all'; tabs.forEach((t,i)=>t.classList.toggle('active',i===0)); render();
 setTimeout(()=>{const toast=document.querySelector('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);},80);
});

const sidebar=document.querySelector('#sidebar');
document.querySelector('#menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));
document.addEventListener('click',event=>{if(innerWidth<=760&&sidebar.classList.contains('open')&&!sidebar.contains(event.target)&&event.target.id!=='menuBtn')sidebar.classList.remove('open');});
render();