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
function renderBody(text=''){return String(text).split(/\n\n+/).filter(Boolean).map((p,index)=>index===0?`<p class="article-lead">${esc(p).replace(/\n/g,'<br>')}</p>`:`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');}
function readTime(text=''){return Math.max(1,Math.ceil(String(text).trim().split(/\s+/).filter(Boolean).length/220));}
function setMeta(selector,value,attribute='content'){const el=document.querySelector(selector);if(el&&value)el.setAttribute(attribute,value);}
function absoluteUrl(value=''){try{return new URL(value,location.origin).href;}catch{return value;}}

async function load(){
  if(!slug){loading.hidden=true;errorBox.hidden=false;return;}
  try{
    const article=await api.getPublicArticle(slug);
    const canonical=`https://teledoctorsa.co.za/blog/${encodeURIComponent(article.slug)}/`;
    const description=article.seoDescription||article.excerpt||'';
    const title=`${article.seoTitle||article.title} | TeleDoctorSA`;
    const image=article.coverImage?.url?absoluteUrl(article.coverImage.url):'https://teledoctorsa.co.za/android-chrome-512x512.png';

    document.title=title;
    setMeta('meta[name="description"]',description);
    setMeta('#articleCanonical',canonical,'href');
    setMeta('#ogTitle',article.title);
    setMeta('#ogDescription',description);
    setMeta('#ogUrl',canonical);
    setMeta('#ogImage',image);

    document.querySelector('#articleCategory').textContent=(article.category||'Blog & Insights').toUpperCase();
    document.querySelector('#articleTitle').textContent=article.title;
    document.querySelector('#articleExcerpt').textContent=article.excerpt||'';
    document.querySelector('#articleAuthor').textContent=`By ${article.author||'TeleDoctorSA Editorial'}`;
    document.querySelector('#articleDate').textContent=formatDate(article.publishedAt||article.updatedAt);
    document.querySelector('#articleReadTime').textContent=`${readTime(article.bodyText)} min read`;

    const heroImage=document.querySelector('#articleImage');
    const hero=document.querySelector('#articleHero');
    if(article.coverImage?.url){
      heroImage.src=article.coverImage.url;
      heroImage.alt=article.coverImage.alt||'';
      document.querySelector('#articleImageCaption').textContent=article.coverImage.alt||'';
    }else hero.hidden=true;

    document.querySelector('#articleBody').innerHTML=renderBody(article.bodyText);
    document.querySelector('#clinicalNote').hidden=!article.clinicalReviewRequired;

    const shareUrl=encodeURIComponent(canonical);
    const shareTitle=encodeURIComponent(article.title);
    document.querySelector('#shareLinkedIn').href=`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    document.querySelector('#shareFacebook').href=`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    document.querySelector('#copyArticleLink').addEventListener('click',async event=>{
      try{await navigator.clipboard.writeText(canonical);event.currentTarget.textContent='Copied';setTimeout(()=>event.currentTarget.textContent='Copy link',1800);}catch{event.currentTarget.textContent='Copy failed';}
    });

    const schema={
      '@context':'https://schema.org',
      '@type':'Article',
      headline:article.title,
      description,
      datePublished:article.publishedAt,
      dateModified:article.updatedAt||article.publishedAt,
      mainEntityOfPage:canonical,
      image,
      author:{'@type':'Person',name:article.author||'TeleDoctorSA Editorial'},
      publisher:{'@type':'Organization',name:'TeleDoctorSA',url:'https://teledoctorsa.co.za/'}
    };
    const script=document.createElement('script');
    script.type='application/ld+json';
    script.textContent=JSON.stringify(schema).replace(/</g,'\\u003c');
    document.head.appendChild(script);

    loading.hidden=true;
    errorBox.hidden=true;
    content.hidden=false;
  }catch(error){
    console.error(error);
    loading.hidden=true;
    content.hidden=true;
    errorBox.hidden=false;
  }
}

load();