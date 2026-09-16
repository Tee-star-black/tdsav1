const stories=[
{title:'5 Ways Telemedicine Improves Access to Care',excerpt:'How connected care can reduce distance and improve access across South Africa.',category:'Health Education',author:'Dr N. Patel',date:'16 Sep 2026',href:'./article.html'},
{title:'A Guide to Your First Telehealth Appointment',excerpt:'What to expect, how to prepare and how to get more value from a virtual consultation.',category:'Patient Guides',author:'TeleDoctorSA Editorial',date:'12 Sep 2026',href:'./article.html'},
{title:'Understanding Blood Pressure at Home',excerpt:'A practical introduction to home readings, healthy habits and when to seek clinical advice.',category:'Digital Health',author:'Dr N. Patel',date:'8 Sep 2026',href:'./article.html'},
{title:'TeleDoctorSA at the African Health Conference',excerpt:'Highlights from the conversations, technology and people shaping connected care.',category:'Company News',author:'T. Sibiya',date:'1 Sep 2026',href:'./article.html'},
{title:'Keeping Your Family Healthy This Winter',excerpt:'Useful guidance for families navigating colder months and seasonal illness.',category:'Health Education',author:'T. Maseko',date:'27 Aug 2026',href:'./article.html'},
{title:'Why Connected Care Matters Between Appointments',excerpt:'Digital health can help people stay connected to care beyond the consultation room.',category:'Digital Health',author:'T. Maseko',date:'18 Aug 2026',href:'./article.html'}
];
const grid=document.querySelector('#storyGrid');
const count=document.querySelector('#storyCount');
const search=document.querySelector('#searchInput');
const chips=document.querySelector('#categoryChips');
let active='All';
const categories=['All',...new Set(stories.map(s=>s.category))];
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderChips(){chips.innerHTML=categories.map(c=>`<button class="${c===active?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');chips.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.category;renderChips();render();}));}
function render(){const q=search.value.trim().toLowerCase();const filtered=stories.filter(s=>(active==='All'||s.category===active)&&(!q||`${s.title} ${s.excerpt} ${s.category} ${s.author}`.toLowerCase().includes(q)));grid.innerHTML=filtered.map(s=>`<article class="story-card"><div class="story-visual"></div><div class="story-body"><span class="meta">${esc(s.category)} · ${esc(s.date)}</span><h3>${esc(s.title)}</h3><p>${esc(s.excerpt)}</p><a href="${s.href}">Read story →</a></div></article>`).join('');count.textContent=`${filtered.length} ${filtered.length===1?'story':'stories'}`;}
search.addEventListener('input',render);renderChips();render();