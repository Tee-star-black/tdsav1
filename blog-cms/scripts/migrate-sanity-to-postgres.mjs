import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SanityRepository} from '../server/sanity-repository.mjs';
import {PostgresRepository} from '../server/postgres-repository.mjs';
import {getPgPool} from '../server/postgres.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
try{process.loadEnvFile(path.join(cmsRoot,'.env'));}catch(error){if(error?.code!=='ENOENT')throw error;}

if(!process.env.DATABASE_URL&&!process.env.PGHOST)throw new Error('Configure DATABASE_URL or PG* Cloud SQL connection settings first.');
if(!process.env.GCS_BUCKET&&String(process.env.CMS_MEDIA_BACKEND||'').toLowerCase()==='gcs')throw new Error('GCS_BUCKET is required when CMS_MEDIA_BACKEND=gcs.');

const source=new SanityRepository();
const target=new PostgresRepository();
const pool=getPgPool();

const [categories,media,articles]=await Promise.all([source.listCategories(),source.listMedia(),source.listArticles()]);
const existingCategories=await target.listCategories();
for(const category of categories){
  if(!existingCategories.some(item=>item.slug===category.slug))await target.createCategory(category.name);
}

const mediaMap=new Map();
const existingMedia=await target.listMedia();
for(const item of media){
  const same=existingMedia.find(row=>row.name===item.name&&row.alt===item.alt);
  if(same){mediaMap.set(item.id,same);continue;}
  if(!item.url)continue;
  const response=await fetch(item.url);
  if(!response.ok)throw new Error(`Could not download media ${item.name}: HTTP ${response.status}`);
  const mimeType=response.headers.get('content-type')||item.mimeType||'image/jpeg';
  const dataUrl=`data:${mimeType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
  const uploaded=await target.uploadMedia({name:item.name,alt:item.alt||item.name,tag:item.tag||'Migrated',dataUrl});
  mediaMap.set(item.id,uploaded);
  console.log(`Migrated media: ${item.name}`);
}

let migrated=0;
for(const sourceArticle of articles){
  const duplicate=(await pool.query('SELECT id FROM cms_articles WHERE slug=$1 LIMIT 1',[sourceArticle.slug])).rows[0];
  if(duplicate){console.log(`Skipped existing article: ${sourceArticle.slug}`);continue;}
  const mapped=sourceArticle.coverImage?.assetId?mediaMap.get(sourceArticle.coverImage.assetId):null;
  const article={...sourceArticle,id:'',revision:'',coverImage:mapped?{assetId:mapped.id,url:mapped.url,alt:sourceArticle.coverImage.alt||mapped.alt}:sourceArticle.coverImage};
  await target.saveArticle(article);
  migrated++;
  console.log(`Migrated article: ${sourceArticle.slug}`);
}

console.log(`Migration complete. ${migrated} article(s), ${mediaMap.size} media item(s), ${categories.length} category record(s) processed.`);
await pool.end();
