import {mkdir,writeFile} from 'node:fs/promises'
import path from 'node:path'
import {createClient} from '@sanity/client'

const projectId=process.env.SANITY_PROJECT_ID
const dataset=process.env.SANITY_DATASET||'production'
const apiVersion=process.env.SANITY_API_VERSION||'2026-09-01'
const token=process.env.SANITY_READ_TOKEN
if(!projectId){console.error('Missing SANITY_PROJECT_ID');process.exit(2)}

const client=createClient({projectId,dataset,apiVersion,token,useCdn:false,perspective:'published'})
const query=`*[_type == "article" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "author": {"name": author->name, "role": author->role},
  "category": {"title": category->title, "slug": category->slug.current},
  "coverImage": {"url": coverImage.asset->url, "alt": coverImage.alt},
  body,
  "featured": coalesce(featured, false),
  "clinicalReviewRequired": coalesce(clinicalReviewRequired, false),
  "clinicalReviewStatus": coalesce(clinicalReviewStatus, "not_required"),
  publishedAt,
  "seoTitle": coalesce(seoTitle, ""),
  "seoDescription": coalesce(seoDescription, "")
}`

const articles=await client.fetch(query)
const outDir=path.resolve(process.cwd(),'content')
await mkdir(outDir,{recursive:true})
await writeFile(path.join(outDir,'articles.json'),JSON.stringify({articles},null,2),'utf8')
console.log(`Fetched ${articles.length} published article(s) from Sanity.`)
