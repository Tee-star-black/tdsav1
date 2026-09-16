import {spawn} from 'node:child_process';

const port=8799;
const child=spawn(process.execPath,['server/server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),CMS_BACKEND:'local'},stdio:['ignore','pipe','pipe']});
const origin=`http://127.0.0.1:${port}`;
const base=`${origin}/api`;

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function request(path,options={}){const response=await fetch(`${base}${path}`,{headers:{'Content-Type':'application/json'},...options});const payload=await response.json().catch(()=>({}));if(!response.ok){const error=new Error(payload.error||`HTTP ${response.status}`);error.status=response.status;error.details=payload.details||[];throw error;}return payload;}
async function expectFailure(fn,message){let failed=false;try{await fn();}catch{failed=true;}if(!failed)throw new Error(message);}

let draftId='';
let categoryId='';
try{
  let ready=false;
  for(let i=0;i<40;i++){try{await request('/health');ready=true;break;}catch{await sleep(100);}}
  if(!ready)throw new Error('CMS API did not start.');

  const studioResponse=await fetch(`${origin}/prototype/`);
  if(!studioResponse.ok||!(await studioResponse.text()).includes('Publishing Studio'))throw new Error('Publishing Studio route is not serving the frontend.');

  const publicBlogResponse=await fetch(`${origin}/blog/`);
  if(!publicBlogResponse.ok||!(await publicBlogResponse.text()).includes('BLOG & INSIGHTS'))throw new Error('Clean /blog/ route is not serving the public frontend.');

  const categoryName=`Smoke ${Date.now()}`;
  const category=(await request('/categories',{method:'POST',body:JSON.stringify({name:categoryName})})).category;
  categoryId=category.id;

  const tinyPng='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const uploaded=(await request('/media',{method:'POST',body:JSON.stringify({name:'smoke-cover.png',alt:'Smoke test cover image',tag:'Smoke Test',dataUrl:tinyPng})})).media;
  const media=(await request('/media')).media;
  if(!media.some(item=>item.id===uploaded.id))throw new Error('Uploaded media did not return through the media library.');

  const slug=`smoke-${Date.now()}`;
  const draft=(await request('/articles',{method:'POST',body:JSON.stringify({title:'CMS vertical smoke article',slug,excerpt:'A temporary article created by the connected smoke test.',bodyText:'This temporary article verifies that the editor contract can write through the API, use shared media and categories, remain private as a draft, obey clinical review, publish to the public feed, and then withdraw cleanly.',status:'Draft',category:category.name,author:'Smoke Test',featured:true,clinicalReviewRequired:true,clinicalReviewStatus:'pending',coverImage:{assetId:uploaded.id,url:uploaded.url,alt:uploaded.alt}})})).article;
  draftId=draft.id;

  const publicBefore=(await request('/public/articles')).articles;
  if(publicBefore.some(a=>a.id===draft.id))throw new Error('Draft leaked into public feed.');

  await expectFailure(()=>request(`/categories/${encodeURIComponent(category.id)}`,{method:'DELETE'}),'Category deletion should be blocked while an article references it.');
  await expectFailure(()=>request(`/articles/${encodeURIComponent(draft.id)}`,{method:'PUT',body:JSON.stringify({...draft,status:'Published',clinicalReviewStatus:'pending'})}),'Clinical review guardrail did not block publication.');

  const published=(await request(`/articles/${encodeURIComponent(draft.id)}`,{method:'PUT',body:JSON.stringify({...draft,status:'Published',clinicalReviewStatus:'approved'})})).article;
  const publicArticle=(await request(`/public/articles/${encodeURIComponent(published.slug)}`)).article;
  if(publicArticle.id!==draft.id)throw new Error('Published article did not reach public API.');

  const feedResponse=await fetch(`${origin}/blog/feed.json`);
  const feed=await feedResponse.json();
  if(!feed.articles.some(article=>article.slug===published.slug&&article.featured))throw new Error('Published featured article did not reach the TeleMedia blog feed.');

  const articlePage=await fetch(`${origin}/blog/${encodeURIComponent(published.slug)}/`);
  if(!articlePage.ok||!(await articlePage.text()).includes('articleContent'))throw new Error('Clean public article route is not serving the article frontend.');

  await request(`/articles/${encodeURIComponent(draft.id)}`,{method:'DELETE'});
  draftId='';
  const publicAfter=(await request('/public/articles')).articles;
  if(publicAfter.some(a=>a.id===draft.id))throw new Error('Deleted article remained in public feed.');
  await expectFailure(()=>request(`/public/articles/${encodeURIComponent(published.slug)}`),'Deleted article remained accessible through the public API.');

  await request(`/categories/${encodeURIComponent(category.id)}`,{method:'DELETE'});
  categoryId='';
  console.log('Blog CMS connected vertical-slice smoke test passed.');
}finally{
  if(draftId){try{await request(`/articles/${encodeURIComponent(draftId)}`,{method:'DELETE'});}catch{}}
  if(categoryId){try{await request(`/categories/${encodeURIComponent(categoryId)}`,{method:'DELETE'});}catch{}}
  child.kill();
}
