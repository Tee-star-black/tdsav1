import {z} from 'zod'

export const articleSchema=z.object({
  _id:z.string().min(1),
  title:z.string().min(5).max(120),
  slug:z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt:z.string().min(20).max(220),
  author:z.object({name:z.string().min(2),role:z.string().optional().default('')}),
  category:z.object({title:z.string().min(2),slug:z.string().min(2)}),
  coverImage:z.object({url:z.string().url(),alt:z.string().min(3)}),
  body:z.array(z.unknown()).min(1),
  featured:z.boolean().default(false),
  clinicalReviewRequired:z.boolean().default(false),
  clinicalReviewStatus:z.enum(['not_required','pending','approved','changes_requested']).default('not_required'),
  publishedAt:z.string().datetime(),
  seoTitle:z.string().max(60).optional().default(''),
  seoDescription:z.string().max(160).optional().default(''),
}).superRefine((article,ctx)=>{
  if(article.clinicalReviewRequired&&article.clinicalReviewStatus!=='approved')ctx.addIssue({code:'custom',path:['clinicalReviewStatus'],message:'Clinical content must be approved before publication.'})
})

export function validateArticles(items){
 const slugs=new Set();
 return items.map((item,index)=>{
   const parsed=articleSchema.safeParse(item);
   if(!parsed.success)return {ok:false,index,id:item?._id||'unknown',errors:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`)};
   if(slugs.has(parsed.data.slug))return {ok:false,index,id:parsed.data._id,errors:[`slug: duplicate slug ${parsed.data.slug}`]};
   slugs.add(parsed.data.slug);
   return {ok:true,index,id:parsed.data._id,data:parsed.data};
 });
}

if(import.meta.url===`file://${process.argv[1]}`){
 const file=process.argv[2];
 if(!file){console.error('Usage: node scripts/validate-content.mjs <articles.json>');process.exit(2)}
 const {readFile}=await import('node:fs/promises');
 const input=JSON.parse(await readFile(file,'utf8'));
 const results=validateArticles(Array.isArray(input)?input:input.articles||[]);
 const failures=results.filter(r=>!r.ok);
 if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1)}
 console.log(`Validated ${results.length} article(s).`)
}
