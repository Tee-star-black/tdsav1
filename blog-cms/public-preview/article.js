const api=window.TDSACmsApi;
const params=new URLSearchParams(location.search);
const pathParts=location.pathname.split('/').filter(Boolean);
const pathSlug=pathParts[0]==='blog'&&pathParts[1]?decodeURIComponent(pathParts[1]):'';
const slug=params.get('slug')||pathSlug;
const loading=document.querySelector('#articleLoading');
const content=document.querySelector('#articleContent');
const errorBox=document.querySelector('#articleError');

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'long',year:'numeric'}).format(d);}
function renderBody(text=''){return String(text).split(/\n\n+/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');}
function readTime(text=''){return Math.max(1,Math.ceil(String(text).trim().split(/\s+/).filter(Boolean).length/220));}

async function load(){
  if(!slug){loading.hidden=true;errorBox.hidden=false;return;}
  try{
    const article=await api.getPublicArticle(slug);
    document.title=`${article.seoTitle||article.title} | TeleDoctorSA`;
    const description=document.querySelector('meta[name="description"]');if(description)description.setAttribute('content',article.seoDescription||article.excerpt||'');
    document.querySelector('#articleCategory').textContent=(article.category||'Blog & Insights').toUpperCase();
    document.querySelector('#articleTitle').textContent=article.title;
    document.querySelector('#articleExcerpt').textContent=article.excerpt||'';
    document.querySelector('#articleAuthor').textContent=`By ${article.author||'TeleDoctorSA Editorial'}`;
    document.querySelector('#articleDate').textContent=formatDate(article.publishedAt||article.updatedAt);
    document.querySelector('#articleReadTime').textContent=`${readTime(article.bodyText)} min read`;
    const image=document.querySelector('#articleImage');const hero=document.querySelector('#articleHero');
    if(article.coverImage?.url){image.src=article.coverImage.url;image.alt=article.coverImage.alt||'';}else{hero.hidden=true;}
    document.querySelector('#articleBody').innerHTML=renderBody(article.bodyText);
    loading.hidden=true;errorBox.hidden=true;content.hidden=false;
  }catch(error){console.error(error);loading.hidden=true;content.hidden=true;errorBox.hidden=false;}
}

load();
