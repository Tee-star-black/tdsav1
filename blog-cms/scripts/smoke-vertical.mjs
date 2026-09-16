import {spawn} from 'node:child_process';

const port=8799;
const child=spawn(process.execPath,['server/server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),CMS_BACKEND:'local'},stdio:['ignore','pipe','pipe']});
const base=`http://127.0.0.1:${port}/api`;

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function request(path,options={}){const response=await fetch(`${base}${path}`,{headers:{'Content-Type':'application/json'},...options});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||`HTTP ${response.status}`);return payload;}

try{
  let ready=false;
  for(let i=0;i<30;i++){try{await request('/health');ready=true;break;}catch{await sleep(100);}}
  if(!ready)throw new Error('CMS API did not start.');

  const categories=(await request('/categories')).categories;
  const media=(await request('/media')).media;
  if(!categories.length||!media.length)throw new Error('Seed data not available.');

  const slug=`smoke-${Date.now()}`;
  const draft=(await request('/articles',{method:'POST',body:JSON.stringify({title:'CMS vertical smoke article',slug,excerpt:'A temporary article created by the connected smoke test.',bodyText:'This temporary article verifies that the editor contract can write through the API and become public only after the publication rules have been satisfied.',status:'Draft',category:categories[0].name,author:'Smoke Test',featured:false,clinicalReviewRequired:true,clinicalReviewStatus:'pending',coverImage:{assetId:media[0].id,url:media[0].url,alt:media[0].alt||'Smoke test cover image'}})})).article;

  const publicBefore=(await request('/public/articles')).articles;
  if(publicBefore.some(a=>a.id===draft.id))throw new Error('Draft leaked into public feed.');

  let blocked=false;
  try{await request(`/articles/${encodeURIComponent(draft.id)}`,{method:'PUT',body:JSON.stringify({...draft,status:'Published',clinicalReviewStatus:'pending'})});}catch{blocked=true;}
  if(!blocked)throw new Error('Clinical review guardrail did not block publication.');

  const published=(await request(`/articles/${encodeURIComponent(draft.id)}`,{method:'PUT',body:JSON.stringify({...draft,status:'Published',clinicalReviewStatus:'approved'})})).article;
  const publicArticle=(await request(`/public/articles/${encodeURIComponent(published.slug)}`)).article;
  if(publicArticle.id!==draft.id)throw new Error('Published article did not reach public feed.');

  await request(`/articles/${encodeURIComponent(draft.id)}`,{method:'DELETE'});
  console.log('Blog CMS vertical-slice smoke test passed.');
}finally{
  child.kill();
}
