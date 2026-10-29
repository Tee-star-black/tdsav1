import {normalizeArticle,slugify,validateEditorialArticle} from '../server/validation.mjs';

// These are known placeholder stories in the TDSA Sanity dataset. Import them
// for editorial reference, but never promote them to the public blog.
export const PLACEHOLDER_ARTICLE_SLUGS=new Set(['testtet','bdfjny-js-js']);

export function planTextOnlyMigration({
  sourceCategories=[],
  sourceArticles=[],
  targetCategories=[],
  targetArticles=[],
}={}){
  const existingCategorySlugs=new Set(targetCategories.map(category=>category.slug||slugify(category.name)));
  const categoriesToCreate=[];
  const availableCategoryNames=new Set(targetCategories.map(category=>category.name));
  const errors=[];

  for(const category of sourceCategories){
    const name=String(category.name||'').trim();
    const slug=slugify(category.slug||name);
    if(name.length<2||!slug){
      errors.push({kind:'category',slug,issues:['Invalid category name or slug.']});
      continue;
    }
    if(existingCategorySlugs.has(slug))continue;
    existingCategorySlugs.add(slug);
    availableCategoryNames.add(name);
    categoriesToCreate.push({name,slug});
  }

  const existingArticleSlugs=new Set(targetArticles.map(article=>article.slug));
  const articlesToCreate=[];
  const skippedArticles=[];
  const downgradedPlaceholders=[];

  for(const source of sourceArticles){
    const slug=slugify(source.slug||source.title||'');
    if(existingArticleSlugs.has(slug)){
      skippedArticles.push(slug);
      continue;
    }
    existingArticleSlugs.add(slug);

    const placeholder=PLACEHOLDER_ARTICLE_SLUGS.has(slug);
    const article=normalizeArticle({
      ...source,
      id:'',
      revision:'',
      status:placeholder?'Draft':source.status,
      featured:placeholder?false:source.featured,
      publishedAt:placeholder?'':source.publishedAt,
      // No object is uploaded or inserted into cms_media. An external Sanity
      // CDN URL is usable now and can be replaced by GCS at the later cutover.
      coverImage:{
        assetId:'',
        url:source.coverImage?.url||'',
        alt:source.coverImage?.alt||''
      }
    });

    const validated=validateEditorialArticle(article,{forPublication:article.status==='Published'});
    const issues=[...validated.errors];
    if(article.category&&!availableCategoryNames.has(article.category)){
      issues.push(`Category "${article.category}" is not available in the destination.`);
    }
    if(issues.length){
      errors.push({kind:'article',slug,issues});
      continue;
    }

    if(placeholder&&source.status==='Published')downgradedPlaceholders.push(slug);
    articlesToCreate.push(article);
  }

  return {categoriesToCreate,articlesToCreate,skippedArticles,downgradedPlaceholders,errors};
}
