import test from 'node:test';
import assert from 'node:assert/strict';
import nunjucks from 'nunjucks';
import path from 'node:path';

const templatesDir=path.resolve('templates');
const env=nunjucks.configure(templatesDir,{autoescape:true,noCache:true});
const site={name:'TeleDoctorSA',baseUrl:'https://teledoctorsa.co.za'};
const article={
  title:'Safe publishing without images',
  slug:'safe-publishing-without-images',
  seoTitle:'',
  seoDescription:'',
  excerpt:'A full introduction for an article with no image attachment.',
  category:'Health Education',
  author:'TeleDoctorSA Editorial',
  publishedAt:'2026-10-29T08:00:00.000Z',
  updatedAt:'2026-10-29T08:00:00.000Z',
  featured:true,
  clinicalReviewRequired:false,
  coverImage:{url:'',alt:''},
  bodyParagraphs:['A meaningful article body that requires no image at all.'],
  schemaJson:JSON.stringify({'@context':'https://schema.org','@type':'Article'})
};

test('article template renders no empty image tags when cover is absent',()=>{
  const html=env.render('article.njk',{site,article});
  assert.doesNotMatch(html,/<figure class="article-hero article-hero-image">/);
  assert.doesNotMatch(html,/<img src=""/);
  assert.match(html,/Safe publishing without images/);
  assert.match(html,/https:\/\/teledoctorsa\.co\.za\/android-chrome-512x512\.png/);
});

test('blog listing renders intentional text-only cards without broken image tags',()=>{
  const html=env.render('index.njk',{site,articles:[article],featured:article,categories:[article.category]});
  assert.match(html,/class="text-only-visual"/);
  assert.doesNotMatch(html,/<img src=""/);
  assert.match(html,/\/blog\/safe-publishing-without-images\//);
});
