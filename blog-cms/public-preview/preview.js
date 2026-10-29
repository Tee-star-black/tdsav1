const api=window.TDSACmsApi;
const grid=document.querySelector('#storyGrid');
const count=document.querySelector('#storyCount');
const search=document.querySelector('#searchInput');
const chips=document.querySelector('#categoryChips');
const feature=document.querySelector('#featureCard');
const errorBox=document.querySelector('#publicError');
const emptyBox=document.querySelector('#publicEmpty');
const publicationDate=document.querySelector('#publicationDate');
let stories=[];
let active='All';

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',year:'numeric'}).format(d);}
function categories(){return ['All',...new Set(stories.map(s=>s.category).filter(Boolean))];}
function articleUrl(story){return `/blog/${encodeURIComponent(story.slug)}/`;}
function storyImage(story,loading='lazy'){return story.coverImage?.url?`<img src="${esc(story.coverImage.url)}" alt="${esc(story.coverImage.alt||'')}" loading="${loading}">`:'<span class="text-only-visual" aria-hidden="true">Blog & Insights</span>';}

function renderChips(){
  chips.innerHTML=categories().map(c=>`<button class="${c===active?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  chips.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.category;renderChips();render();}));
}

function renderFeature(){
  const story=stories.find(s=>s.featured)||stories[0];
  if(!story){
    feature.innerHTML='<div class="feature-copy"><span>FEATURED STORY</span><h2>Stories are coming soon.</h2><p>Published TeleDoctorSA articles will appear here.</p></div>';
    return;
  }
  feature.innerHTML=`<a class="feature-media ${story.coverImage?.url?'has-image':''}" href="${articleUrl(story)}">${storyImage(story,'eager')}</a><div class="feature-copy"><span>FEATURED STORY · ${esc(story.category||'BLOG & INSIGHTS')}</span><h2><a href="${articleUrl(story)}">${esc(story.title)}</a></h2><p>${esc(story.excerpt||'')}</p><div class="feature-meta">${esc(story.author||'TeleDoctorSA Editorial')} · ${esc(formatDate(story.publishedAt||story.updatedAt))}</div><a class="feature-link" href="${articleUrl(story)}">Read the story →</a></div>`;
}

function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=stories.filter(s=>(active==='All'||s.category===active)&&(!q||`${s.title} ${s.excerpt} ${s.category} ${s.author}`.toLowerCase().includes(q)));
  grid.innerHTML=filtered.map(s=>`<article class="story-card"><a class="story-visual ${s.coverImage?.url?'has-image':''}" href="${articleUrl(s)}">${storyImage(s)}</a><div class="story-body"><span class="meta">${esc(s.category||'BLOG & INSIGHTS')} · ${esc(formatDate(s.publishedAt||s.updatedAt))}</span><h3><a href="${articleUrl(s)}">${esc(s.title)}</a></h3><p>${esc(s.excerpt||'')}</p><div class="story-footer"><span>${esc(s.author||'TeleDoctorSA Editorial')}</span><a href="${articleUrl(s)}">Read →</a></div></div></article>`).join('');
  count.textContent=`${filtered.length} ${filtered.length===1?'published story':'published stories'}`;
  emptyBox.hidden=filtered.length!==0||stories.length===0;
}

async function load(){
  publicationDate.textContent=new Intl.DateTimeFormat('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  try{
    stories=await api.listPublicArticles();
    stories.sort((a,b)=>new Date(b.publishedAt||b.updatedAt)-new Date(a.publishedAt||a.updatedAt));
    errorBox.hidden=true;
    renderFeature();
    renderChips();
    render();
  }catch(error){
    console.error(error);
    stories=[];
    renderFeature();
    renderChips();
    render();
    errorBox.hidden=false;
    count.textContent='Content unavailable';
  }
}

search.addEventListener('input',render);
load();