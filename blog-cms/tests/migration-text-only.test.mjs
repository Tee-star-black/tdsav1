import test from 'node:test';
import assert from 'node:assert/strict';
import {planTextOnlyMigration} from '../scripts/plan-text-only-migration.mjs';

const category={name:'Health Education',slug:'health-education'};
function story(overrides={}){
  return {
    title:'A complete guide to telemedicine',
    slug:'complete-guide-to-telemedicine',
    excerpt:'A comprehensive guide to remote care for South African patients.',
    bodyText:'Telemedicine can improve accessibility to clinicians by helping patients connect remotely, share information securely and receive appropriate follow-up care.',
    status:'Published',
    category:'Health Education',
    author:'TeleDoctorSA Editorial',
    publishedAt:'2026-09-15T08:30:00Z',
    coverImage:{
      assetId:'image-sanity-cover',
      url:'https://cdn.sanity.io/images/glz6ptd8/production/cover.jpg',
      alt:'A patient having a video consultation'
    },
    ...overrides
  };
}

test('text-only plan preserves Sanity cover URL and never keeps Sanity asset id',()=>{
  const original=story();
  const plan=planTextOnlyMigration({sourceCategories:[category],sourceArticles:[original]});
  assert.equal(plan.errors.length,0);
  assert.deepEqual(plan.categoriesToCreate,[category]);
  assert.equal(plan.articlesToCreate.length,1);
  const article=plan.articlesToCreate[0];
  assert.equal(article.status,'Published');
  assert.equal(article.publishedAt,'2026-09-15T08:30:00Z');
  assert.equal(article.coverImage.url,original.coverImage.url);
  assert.equal(article.coverImage.assetId,'');
  assert.equal(article.coverImage.alt,original.coverImage.alt);
  assert.equal(original.coverImage.assetId,'image-sanity-cover','source must remain unchanged');
});

test('known placeholder posts become unpublished drafts while retaining their content',()=>{
  const plan=planTextOnlyMigration({
    sourceCategories:[category],
    sourceArticles:[
      story({title:'testtet',slug:'testtet'}),
      story({title:'BDFJNY JS JS',slug:'bdfjny-js-js'})
    ]
  });
  assert.equal(plan.errors.length,0);
  assert.deepEqual(plan.downgradedPlaceholders,['testtet','bdfjny-js-js']);
  for(const article of plan.articlesToCreate){
    assert.equal(article.status,'Draft');
    assert.equal(article.publishedAt,'');
    assert.equal(article.featured,false);
  }
});

test('existing articles and categories remain untouched on retry',()=>{
  const plan=planTextOnlyMigration({
    sourceCategories:[category,category],
    sourceArticles:[story()],
    targetCategories:[category],
    targetArticles:[{slug:'complete-guide-to-telemedicine'}]
  });
  assert.equal(plan.categoriesToCreate.length,0);
  assert.equal(plan.articlesToCreate.length,0);
  assert.deepEqual(plan.skippedArticles,['complete-guide-to-telemedicine']);
});

test('missing published cover fails preflight instead of importing a broken published article',()=>{
  const plan=planTextOnlyMigration({
    sourceCategories:[category],
    sourceArticles:[story({coverImage:{assetId:'image-xyz',url:'',alt:''}})]
  });
  assert.equal(plan.articlesToCreate.length,0);
  assert.equal(plan.errors.length,1);
  assert.match(plan.errors[0].issues.join(' '),/cover image/i);
});

test('review-stage articles can migrate without image uploads',()=>{
  const plan=planTextOnlyMigration({
    sourceCategories:[category],
    sourceArticles:[story({status:'Review',coverImage:{},publishedAt:''})]
  });
  assert.equal(plan.errors.length,0);
  assert.equal(plan.articlesToCreate[0].status,'Review');
  assert.equal(plan.articlesToCreate[0].coverImage.url,'');
});


test('restricted dotted-ID published article is imported as Draft to prevent accidental exposure',()=>{
  const privateId='article.how-telemedicine-is-changing-everyday-healthcare';
  const plan=planTextOnlyMigration({
    sourceCategories:[category],
    sourceArticles:[story({id:privateId,slug:'how-telemedicine-is-changing-everyday-healthcare'})]
  });
  assert.equal(plan.errors.length,0);
  assert.deepEqual(plan.downgradedPrivateArticles,['how-telemedicine-is-changing-everyday-healthcare']);
  assert.equal(plan.articlesToCreate.length,1);
  const imported=plan.articlesToCreate[0];
  assert.equal(imported.status,'Draft');
  assert.equal(imported.featured,false);
  assert.equal(imported.publishedAt,'');
  assert.equal(imported.coverImage.url,'https://cdn.sanity.io/images/glz6ptd8/production/cover.jpg');
});
