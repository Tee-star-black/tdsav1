process.env.SANITY_PROJECT_ID ||= 'glz6ptd8';
process.env.SANITY_DATASET ||= 'staging';

const {SanityRepository}=await import('../server/sanity-repository.mjs');

function assert(condition,message){
  if(!condition)throw new Error(message);
}

const repo=new SanityRepository();
const [health,categories,articles,media,publicArticles]=await Promise.all([
  repo.health(),
  repo.listCategories(),
  repo.listArticles(),
  repo.listMedia(),
  repo.listPublicArticles()
]);

assert(health.ok&&health.backend==='sanity','Sanity repository health check failed.');
assert(categories.length>=5,'Staging Sanity should expose the editorial category set.');
assert(media.length>=4,'Staging Sanity should expose the seeded media library.');
assert(articles.length>=4,'Staging Sanity should expose the starter article set.');

const requiredCategories=['Health Education','Company News','Patient Guides','Digital Health','Telehealth'];
for(const name of requiredCategories){
  assert(categories.some(category=>category.name===name),`Missing staging category: ${name}`);
}

const requiredSlugs=[
  'telemedicine-improves-access-to-care',
  'keeping-your-family-healthy-this-winter',
  'african-health-conference',
  'first-telehealth-appointment'
];
for(const slug of requiredSlugs){
  assert(articles.some(article=>article.slug===slug),`Missing staging article: ${slug}`);
}

const articleSlugs=articles.map(article=>article.slug);
assert(new Set(articleSlugs).size===articleSlugs.length,'Duplicate article slugs exist in staging Sanity.');

const categorySlugs=categories.map(category=>category.slug);
assert(new Set(categorySlugs).size===categorySlugs.length,'Duplicate category slugs exist in staging Sanity.');

const categoryNames=new Set(categories.map(category=>category.name));
for(const article of articles){
  assert(categoryNames.has(article.category),`Article ${article.slug} references a missing category.`);
}

assert(publicArticles.every(article=>article.status==='Published'),'Non-published editorial content leaked into the public Sanity query.');

console.log(`Sanity staging contract passed: ${articles.length} articles, ${categories.length} categories, ${media.length} media records, ${publicArticles.length} public articles.`);
