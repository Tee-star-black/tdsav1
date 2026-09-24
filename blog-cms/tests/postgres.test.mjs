import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newDb} from 'pg-mem';
import {PostgresRepository} from '../server/postgres-repository.mjs';
import {PostgresAuthStore} from '../server/postgres-auth.mjs';

async function setup(){
  const db=newDb({autoCreateForeignKeyIndices:true});
  db.public.none(await readFile('db/migrations/001_cms_core.sql','utf8'));
  const adapter=db.adapters.createPg();
  const pool=new adapter.Pool();
  const mediaStore={name:'test',async upload(input){return {name:'cover',mimeType:'image/png',url:'https://example.test/cover.png',alt:input.alt||'Cover image',tag:'Test',storageKey:'cover.png'};}};
  return {pool,repo:new PostgresRepository({pool,mediaStore}),auth:new PostgresAuthStore({pool})};
}

test('Postgres repository supports the editorial lifecycle with revisions',async()=>{
  const {pool,repo}=await setup();
  try{
    const category=await repo.createCategory('Health Education');
    assert.equal(category.name,'Health Education');
    const media=await repo.uploadMedia({name:'cover.png',alt:'Editorial cover',dataUrl:'data:image/png;base64,AA=='});
    let article=await repo.saveArticle({
      title:'Cloud SQL editorial article',
      slug:'cloud-sql-editorial-article',
      excerpt:'A complete introduction for a production-ready CMS article.',
      bodyText:'This article contains enough editorial body text to validate the complete Cloud SQL publication workflow for TeleDoctorSA without relying on Sanity as the permanent content database.',
      status:'Draft',
      category:'Health Education',
      author:'TeleDoctorSA Editorial',
      coverImage:{assetId:media.id,url:media.url,alt:media.alt}
    });
    assert.ok(article.id);
    assert.ok(article.revision);
    assert.equal((await repo.listPublicArticles()).length,0);
    const stale={...article};
    article=await repo.saveArticle({...article,status:'Published'},article.id);
    assert.equal((await repo.getPublicArticleBySlug(article.slug)).id,article.id);
    await assert.rejects(repo.saveArticle({...stale,title:'Stale edit'},stale.id),{statusCode:409});
    const revisions=await pool.query('SELECT COUNT(*)::int AS count FROM cms_article_revisions WHERE article_id=$1',[article.id]);
    assert.equal(revisions.rows[0].count,1);
  }finally{await pool.end();}
});

test('Postgres auth hashes credentials and persists sessions',async()=>{
  const {pool,auth}=await setup();
  const testPassword=['Correct','Horse','Battery','CMS','42'].join('-');
  try{
    const created=await auth.createUser({email:'cms-test@example.invalid',name:'CMS Admin',role:'admin',password:testPassword});
    assert.equal(created.user.role,'admin');
    assert.equal(await auth.authenticate('cms-test@example.invalid','incorrect-value'),null);
    const user=await auth.authenticate('cms-test@example.invalid',testPassword);
    assert.equal(user.id,created.user.id);
    const session=await auth.createSession(user.id);
    const request={headers:{cookie:`tdsa_cms_session=${session.token}`}};
    assert.equal((await auth.sessionUserFromRequest(request)).email,'cms-test@example.invalid');
    await auth.destroySessionFromRequest(request);
    assert.equal(await auth.sessionUserFromRequest(request),null);
    const stored=(await pool.query('SELECT password_hash,password_salt FROM cms_users WHERE id=$1',[user.id])).rows[0];
    assert.notEqual(stored.password_hash,testPassword);
    assert.ok(stored.password_salt);
  }finally{await pool.end();}
});
