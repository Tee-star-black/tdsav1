import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {JSDOM} from 'jsdom';
const directory=await mkdtemp(path.join(tmpdir(),'cms-editor-'));
const origin='http://127.0.0.1:8801';
const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'8801',CMS_BACKEND:'local',CMS_ACCESS_TOKEN:'',CMS_LOCAL_STORE:path.join(directory,'store.json'),CMS_DEPLOY_WEBHOOK_URL:''},stdio:'pipe'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(predicate){for(let n=0;n<100;n++){if(await predicate())return;await pause(30);}throw new Error('Expected editor state did not arrive');}
await until(async()=>{try{return(await fetch(origin+'/api/health')).ok;}catch{return false;}});
const html=await readFile('prototype/index.html','utf8'),api=await readFile('client/cms-api.js','utf8'),studio=await readFile('prototype/studio.js','utf8');
const windows=[];
async function open(storage={}){
try{
  const dom=new JSDOM(html,{url:origin+'/prototype/',runScripts:'outside-only'}),w=dom.window;windows.push(w);
  w.fetch=(url,options)=>fetch(new URL(url,origin),options);w.AbortController=AbortController;w.confirm=()=>true;w.prompt=()=>null;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  for(const [k,v] of Object.entries(storage))w.sessionStorage.setItem(k,v);
  try{w.eval(api);w.eval(studio);}catch(error){console.error(error.name,error.message,error.stack);throw error;}await until(()=>w.document.querySelector('#backendStatus').classList.contains('online'));
  return {w,$:s=>w.document.querySelector(s),fill(s,value){const el=w.document.querySelector(s);el.value=value;el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}};
}catch(error){throw new Error(error.message,{cause:error});}
}
test.after(async()=>{for(const w of windows)w.close();child.kill();await rm(directory,{recursive:true,force:true});});
test('editor saves a minimal draft and reveals it despite active filters',async()=>{
  const {$,fill}=await open();$('[data-filter="Published"]').click();fill('#articleSearch','does not exist');
  $('[data-action="new"]').click();fill('#articleTitle','Editor draft test');$('#saveArticle').click();await until(()=>!$('#editorDialog').open);
  assert.ok($('#articleList').textContent.includes('Editor draft test'));assert.equal($('.tabs button.active').dataset.filter,'Draft');assert.equal($('#articleSearch').value,'');
  const fresh=await open();assert.ok(fresh.$('#articleList').textContent.includes('Editor draft test'));
  const publicRows=await(await fetch(origin+'/api/public/articles')).json();assert.ok(!publicRows.articles.some(a=>a.title==='Editor draft test'));
});
test('inline validation, review submission, stable slug and return to draft',async()=>{
  const {$,fill}=await open();$('[data-action="new"]').click();$('#saveArticle').click();assert.equal($('#editorFeedback').hidden,false);assert.ok($('#editorDialog').open);
  fill('#articleTitle','Editor review test');fill('#articleCategory','Health Education');fill('#articleStatus','Review');assert.equal($('#saveArticle').textContent,'Send for review');$('#saveArticle').click();await until(()=>!$('#editorDialog').open);
  assert.equal($('.tabs button.active').dataset.filter,'Review');
  [...$('#articleList').querySelectorAll('[data-edit]')].find(el=>el.textContent.includes('Editor review test')).click();const slug=$('#articleSlug').value;fill('#articleTitle','Renamed review article');assert.equal($('#articleSlug').value,slug);
  $('#saveDraft').click();await until(()=>!$('#editorDialog').open);assert.equal($('.tabs button.active').dataset.filter,'Draft');
});
test('unsaved close protection, recovery and form submission without reload',async()=>{
  const {w,$,fill}=await open();$('[data-action="new"]').click();fill('#articleTitle','Recover this writing');fill('#articleBody','Precious unsaved content');
  w.confirm=()=>false;$('#closeEditor').click();assert.ok($('#editorDialog').open);const recovery=w.sessionStorage.getItem('tdsaCmsEditorRecovery');assert.ok(recovery.includes('Precious unsaved content'));
  const recovered=await open({tdsaCmsEditorRecovery:recovery});await until(()=>recovered.$('#editorDialog').open);assert.equal(recovered.$('#articleBody').value,'Precious unsaved content');
  const event=new recovered.w.Event('submit',{bubbles:true,cancelable:true});recovered.$('#editorForm').dispatchEvent(event);assert.equal(event.defaultPrevented,true);await until(()=>!recovered.$('#editorDialog').open);assert.equal(recovered.w.sessionStorage.getItem('tdsaCmsEditorRecovery'),null);
});
test('pagination changes rows and restores the last page',async()=>{
  for(let i=0;i<12;i++)await fetch(origin+'/api/articles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:`Pagination story ${i}`,status:'Draft'})});
  const {w,$}=await open();assert.equal($('#articleList').children.length,10);assert.equal($('#previousPage').disabled,true);$('#nextPage').click();assert.ok($('#pageLabel').textContent.includes('Page 2'));assert.equal($('#previousPage').disabled,false);
  const restored=await open({tdsaCmsList:w.sessionStorage.getItem('tdsaCmsList')});await until(()=>restored.$('#pageLabel').textContent.includes('Page 2'));assert.equal(restored.$('#articleList').textContent,$('#articleList').textContent);
});
test('editor publishes content, previews the cover and withdraws to draft',async()=>{
  const {$,fill}=await open();$('[data-action="new"]').click();fill('#articleTitle','Editor publication test');fill('#articleExcerpt','A useful introduction for this complete editorial test.');fill('#articleBody','This article contains enough text to verify the full editorial publication flow, including cover selection, preview, public visibility and withdrawal.');fill('#articleCategory','Health Education');fill('#articleCoverImage',$('#articleCoverImage').options[1].value);fill('#articleCoverAlt','A test cover image');
  $('#previewBtn').click();assert.ok($('#previewDialog').open);assert.equal($('#previewCover').hidden,false);$('#closePreview').click();fill('#articleStatus','Published');$('#saveArticle').click();await until(()=>!$('#editorDialog').open);await until(()=>$('#saveArticle').disabled===false);
  let rows=(await(await fetch(origin+'/api/public/articles')).json()).articles;assert.ok(rows.some(a=>a.title==='Editor publication test'));
  [...$('#articleList').querySelectorAll('[data-edit]')].find(el=>el.textContent.includes('Editor publication test')).click();$('#saveDraft').click();await until(()=>!$('#editorDialog').open);
  rows=(await(await fetch(origin+'/api/public/articles')).json()).articles;assert.ok(!rows.some(a=>a.title==='Editor publication test'));
});
test('editor publishes a complete text-only article with no media uploads',async()=>{
  const {$,fill}=await open();
  $('[data-action="new"]').click();
  fill('#articleTitle','Text-only editorial article');
  fill('#articleExcerpt','This article is intentionally published with no image attachment.');
  fill('#articleBody','Our publishing workflow supports complete stories without a cover image. The author can write, review and publish directly to PostgreSQL without calling an external image service.');
  fill('#articleCategory','Health Education');
  fill('#articleStatus','Published');
  $('#saveArticle').click();
  await until(()=>!$('#editorDialog').open);
  const published=(await(await fetch(origin+'/api/public/articles')).json()).articles;
  const article=published.find(a=>a.title==='Text-only editorial article');
  assert.ok(article);
  assert.equal(article.coverImage.url,'');
});

test('stale-save errors preserve the open editor and its recovery copy',async()=>{
  const {$,fill,w}=await open();$('[data-action="new"]').click();fill('#articleTitle','Concurrent editor test');$('#saveArticle').click();await until(()=>!$('#editorDialog').open);
  const edit=[...$('#articleList').querySelectorAll('[data-edit]')].find(el=>el.textContent.includes('Concurrent editor test'));edit.click();
  const id=edit.dataset.edit;const current=(await(await fetch(origin+'/api/articles/'+id)).json()).article;
  await fetch(origin+'/api/articles/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...current,title:'Newer remote title'})});
  fill('#articleTitle','My unsaved title');$('#saveArticle').click();await until(()=>!$('#editorFeedback').hidden);
  assert.ok($('#editorDialog').open);assert.equal($('#articleTitle').value,'My unsaved title');assert.ok($('#editorFeedback').textContent.includes('changed since'));assert.ok(w.sessionStorage.getItem('tdsaCmsEditorRecovery').includes('My unsaved title'));
});
test('category creation within the editor retains writing and assigns the new category',async()=>{
  const {$,fill,w}=await open();$('[data-action="new"]').click();fill('#articleTitle','In editor category test');fill('#articleBody','Keep this text while adding a category.');w.prompt=()=> 'Editorial test category';$('#editorAddCategory').click();await until(()=>$('#articleCategory').value==='Editorial test category');
  assert.equal($('#articleBody').value,'Keep this text while adding a category.');$('#saveArticle').click();await until(()=>!$('#editorDialog').open);assert.ok($('#articleList').textContent.includes('Editorial test category'));
});
