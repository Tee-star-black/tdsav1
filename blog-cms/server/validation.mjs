const STATUSES=new Set(['Draft','Review','Published','Scheduled']);

export function slugify(value=''){
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
}

export function normalizeArticle(input={}){
  const status=STATUSES.has(input.status)?input.status:'Draft';
  return {
    id:String(input.id||input._id||''),
    title:String(input.title||'').trim(),
    slug:slugify(input.slug||input.title||''),
    excerpt:String(input.excerpt||'').trim(),
    bodyText:String(input.bodyText??input.body??'').trim(),
    status,
    categoryId:String(input.categoryId||'').trim(),
    category:String(input.category||'').trim(),
    author:String(input.author||'TeleDoctorSA Editorial').trim(),
    featured:Boolean(input.featured),
    clinicalReviewRequired:Boolean(input.clinicalReviewRequired),
    clinicalReviewStatus:String(input.clinicalReviewStatus||'not_required'),
    coverImage:{
      assetId:String(input.coverImage?.assetId||''),
      url:String(input.coverImage?.url||''),
      alt:String(input.coverImage?.alt||'').trim(),
    },
    scheduledAt:input.scheduledAt?String(input.scheduledAt):'',
    publishedAt:input.publishedAt?String(input.publishedAt):'',
    updatedAt:input.updatedAt?String(input.updatedAt):'',
    seoTitle:String(input.seoTitle||'').trim(),
    seoDescription:String(input.seoDescription||'').trim(),
  };
}

export function validateEditorialArticle(article,{forPublication=false}={}){
  const a=normalizeArticle(article);
  const errors=[];
  if(a.title.length<5)errors.push('Title must be at least 5 characters.');
  if(!a.slug)errors.push('A valid URL slug is required.');
  if(!a.categoryId&&!a.category)errors.push('Choose a category.');
  if(!a.author)errors.push('Choose or enter an author.');
  if(a.excerpt.length>220)errors.push('Short introduction must be 220 characters or fewer.');
  if(a.seoTitle.length>60)errors.push('SEO title must be 60 characters or fewer.');
  if(a.seoDescription.length>160)errors.push('SEO description must be 160 characters or fewer.');
  if(a.status==='Scheduled'&&!a.scheduledAt)errors.push('Scheduled stories require a publication date and time.');

  if(forPublication||a.status==='Published'){
    if(a.excerpt.length<20)errors.push('Published stories need a short introduction of at least 20 characters.');
    if(a.bodyText.length<80)errors.push('Published stories need a complete article body.');
    if(!a.coverImage.url&&!a.coverImage.assetId)errors.push('Published stories require a cover image.');
    if(!a.coverImage.alt)errors.push('Published cover images require alternative text.');
    if(a.clinicalReviewRequired&&a.clinicalReviewStatus!=='approved')errors.push('Clinical content must be approved before publication.');
  }
  return {ok:errors.length===0,errors,article:a};
}
