import {readFile} from 'node:fs/promises';
import {normalizeArticle,validateEditorialArticle} from '../server/validation.mjs';

export function validateArticles(items){
  const slugs=new Set();
  return items.map((item,index)=>{
    const article=normalizeArticle(item);
    const check=validateEditorialArticle({...article,status:'Published'},{forPublication:true});
    const errors=[...check.errors];
    if(slugs.has(article.slug))errors.push(`Duplicate slug: ${article.slug}`);
    if(article.slug)slugs.add(article.slug);
    return errors.length?{ok:false,index,id:article.id||'unknown',errors}:{ok:true,index,id:article.id,data:{...check.article,status:'Published'}};
  });
}

if(import.meta.url===`file://${process.argv[1]}`){
  const file=process.argv[2];
  if(!file){console.error('Usage: node scripts/validate-content.mjs <articles.json>');process.exit(2)}
  const input=JSON.parse(await readFile(file,'utf8'));
  const results=validateArticles(Array.isArray(input)?input:input.articles||[]);
  const failures=results.filter(r=>!r.ok);
  if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1)}
  console.log(`Validated ${results.length} publishable article(s).`);
}
