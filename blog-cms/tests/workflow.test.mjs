import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {validateEditorialArticle} from '../server/validation.mjs';


const directory=await mkdtemp(path.join(tmpdir(),'cms-workflow-'));
process.env.CMS_LOCAL_STORE=path.join(directory,'store.json');
const {LocalRepository}=await import('../server/local-repository.mjs');
test.after(()=>rm(directory,{recursive:true,force:true}));
const draft={title:'A draft idea',status:'Draft'};
const complete={...draft,category:'Health Education',excerpt:'An introduction with enough detail for our readers.',bodyText:'A complete article body that provides enough information for readers to understand this editorial workflow test clearly.',coverImage:{assetId:'image-test',url:'https://example.com/cover.png',alt:'Cover image'},clinicalReviewRequired:true,clinicalReviewStatus:'approved'};

test('minimal drafts persist, stay private, and survive a repository restart',async()=>{
  const repo=new LocalRepository();const saved=await repo.saveArticle(draft);
  assert.equal(saved.status,'Draft');assert.ok(saved.id);assert.ok(saved.revision);
  assert.equal((await new LocalRepository().getArticle(saved.id)).title,draft.title);
  assert.equal(await repo.getPublicArticleBySlug(saved.slug),null);
  const changed=await repo.saveArticle({...saved,title:'A revised draft idea'},saved.id);
  await assert.rejects(repo.saveArticle({...saved,title:'A stale editor change'},saved.id),{statusCode:409});
  assert.equal((await repo.getArticle(saved.id)).title,changed.title);
});

test('review, publication, withdrawal, scheduling and deletion work in sequence',async()=>{
  const repo=new LocalRepository();let article=await repo.saveArticle({...complete,slug:'full-lifecycle'});
  article=await repo.saveArticle({...article,status:'Review'},article.id);
  assert.equal(await repo.getPublicArticleBySlug(article.slug),null);
  await assert.rejects(repo.saveArticle({...article,status:'Published',clinicalReviewStatus:'pending'},article.id),{statusCode:400});
  article=await repo.saveArticle({...article,status:'Published'},article.id);
  assert.equal((await repo.getPublicArticleBySlug(article.slug)).id,article.id);
  article=await repo.saveArticle({...article,status:'Draft'},article.id);
  assert.equal(await repo.getPublicArticleBySlug(article.slug),null);
  article=await repo.saveArticle({...article,status:'Scheduled',scheduledAt:new Date(Date.now()+60000).toISOString()},article.id);
  assert.equal(await repo.getPublicArticleBySlug(article.slug),null);
  await repo.deleteArticle(article.id);
  await assert.rejects(repo.saveArticle(article,article.id),{statusCode:404});
});

test('schedule rejects invalid dates, incomplete content and pending clinical review',()=>{
  for(const scheduledAt of ['', 'not-a-date','2020-01-01T00:00:00Z'])assert.equal(validateEditorialArticle({...complete,status:'Scheduled',scheduledAt}).ok,false);
  const scheduledAt=new Date(Date.now()+60000).toISOString();
  assert.equal(validateEditorialArticle({...draft,status:'Scheduled',scheduledAt}).ok,false);
  assert.equal(validateEditorialArticle({...complete,status:'Scheduled',scheduledAt,clinicalReviewStatus:'pending'}).ok,false);
  assert.equal(validateEditorialArticle({...complete,status:'Scheduled',scheduledAt}).ok,true);
});

test('concurrent local writes retain every new draft and reject unknown categories',async()=>{
  const repo=new LocalRepository();const saved=await Promise.all(Array.from({length:15},(_,i)=>repo.saveArticle({...draft,title:`Concurrent article ${i}`})));
  assert.equal(new Set(saved.map(a=>a.id)).size,15);
  const list=await repo.listArticles();assert.ok(saved.every(a=>list.some(b=>b.id===a.id)));
  await assert.rejects(repo.saveArticle({...draft,title:'Unknown category',category:'Missing'}),{statusCode:400});
});

test('published and scheduled text-only stories do not require an image',()=>{
  const source={...complete,coverImage:{},clinicalReviewRequired:false,clinicalReviewStatus:'not_required'};
  const published=validateEditorialArticle({...source,status:'Published'},{forPublication:true});
  assert.equal(published.ok,true,published.errors.join(' '));
  const scheduled=validateEditorialArticle({...source,status:'Scheduled',scheduledAt:new Date(Date.now()+3600000).toISOString()});
  assert.equal(scheduled.ok,true,scheduled.errors.join(' '));
  const withCover=validateEditorialArticle({...source,status:'Published',coverImage:{url:'https://example.com/cover.png',alt:''}});
  assert.equal(withCover.ok,false);
  assert.match(withCover.errors.join(' '),/alternative text/i);
});
