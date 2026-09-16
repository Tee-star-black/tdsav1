const api=window.TDSACmsApi;
const grid=document.querySelector('#storyGrid');
const count=document.querySelector('#storyCount');
const search=document.querySelector('#searchInput');
const chips=document.querySelector('#categoryChips');
const feature=document.querySelector('#featureCard');
const errorBox=document.querySelector('#publicError');
let stories=[];
let active='All';

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',year:'numeric'}).format(d);}
function categories(){return ['All',...new Set(stories.map(s=>s.category).filter(Boolean))];}
function articleUrl(story){return `/blog/${encodeURIComponent(story.slug)}/`;}

function renderChips(){
  chips.innerHTML=categories().map(c=>`<button class="${c===active?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  chips.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.category;renderChips();render();}));
}

function renderFeature(){
  const story=stories.find(s=>s.featured)||stories[0];
  if(!story){feature.innerHTML='<span>FEATURED</span><h2>No published stories yet.</h2><p>Publish an article from the Studio to populate this space.</p>';return;}
  feature.innerHTML=`<span>FEATURED</span><h2>${esc(story.title)}</h2><p>${esc(story.excerpt)}</p><a href="${articleUrl(story)}">Read story →</a>`;
}

function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=stories.filter(s=>(active==='All'||s.category===active)&&(!q||`${s.title} ${s.excerpt} ${s.category} ${s.author}`.toLowerCase().includes(q)));
  grid.innerHTML=filtered.map(s=>`<article class="story-card">${s.coverImage?.url?`<div class="story-visual has-image"><img src="${esc(s.coverImage.url)}" alt="${esc(s.coverImage.alt||'')}"></div>`:'<div class="story-visual"></div>'}<div class="story-body"><span class="meta">${esc(s.category)} · ${esc(formatDate(s.publishedAt||s.updatedAt))}</span><h3>${esc(s.title)}</h3><p>${esc(s.excerpt)}</p><a href="${articleUrl(s)}">Read story →</a></div></article>`).join('');
  count.textContent=`${filtered.length} ${filtered.length===1?'story':'stories'}`;
}

async function load(){
  try{
    stories=await api.listPublicArticles();
    errorBox.hidden=true;renderFeature();renderChips();render();
  }catch(error){
    console.error(error);stories=[];renderFeature();renderChips();render();errorBox.hidden=false;count.textContent='0 stories';
  }
}

search.addEventListener('input',render);
load();
