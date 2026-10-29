import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SanityRepository} from '../server/sanity-repository.mjs';
import {PostgresRepository} from '../server/postgres-repository.mjs';
import {getPgPool} from '../server/postgres.mjs';
import {planTextOnlyMigration} from './plan-text-only-migration.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
try{process.loadEnvFile(path.join(cmsRoot,'.env'));}catch(error){if(error?.code!=='ENOENT')throw error;}

const args=process.argv.slice(2);
if(args.some(arg=>!['--apply','--dry-run'].includes(arg))||args.includes('--apply')&&args.includes('--dry-run')){
  console.error('Usage: npm run migrate:sanity-text-only -- [--dry-run | --apply]');
  process.exit(2);
}
const apply=args.includes('--apply');
if(!process.env.DATABASE_URL&&!process.env.PGHOST)throw new Error('Set DATABASE_URL or PG* to connect to the target CMS database.');
// The TDSA production dataset contains articles with dotted document IDs.
// Anonymous Sanity requests silently omit those records, so a read token
// must be present before even previewing the migration.
if(!String(process.env.SANITY_READ_TOKEN||process.env.SANITY_WRITE_TOKEN||'').trim()){
  throw new Error('Set SANITY_READ_TOKEN to a Sanity Viewer API token; anonymous access omits private dotted-ID articles.');
}

const pool=getPgPool();
// Explicitly refuse media writes: this temporary cutover has NO GCS access.
const disabledMediaStore={
  name:'deferred',
  upload(){throw new Error('Media uploads are intentionally disabled in text-only migration.');}
};
const target=new PostgresRepository({pool,mediaStore:disabledMediaStore});
const source=new SanityRepository();

try{
  const [sourceCategories,sourceArticles,targetCategories,targetArticles]=await Promise.all([
    source.listCategories(),
    source.listArticles(),
    target.listCategories(),
    target.listArticles()
  ]);
  // This specific TDSA record exists only for authenticated source queries.
  // If it is absent, a token may be invalid or not authorized to read it.
  const requiredSlug='how-telemedicine-is-changing-everyday-healthcare';
  if(source.projectId==='glz6ptd8'&&source.dataset==='production'&&!sourceArticles.some(article=>article.slug===requiredSlug)){
    throw new Error(`Sanity source is incomplete: missing restricted article ${requiredSlug}. No changes made. Verify the Viewer token.`);
  }
  const plan=planTextOnlyMigration({sourceCategories,sourceArticles,targetCategories,targetArticles});

  console.log(`Sanity source: ${source.projectId}/${source.dataset}`);
  console.log(`Mode: ${apply?'APPLY':'DRY RUN - NO CHANGES'}`);
  console.log(`Categories to create: ${plan.categoriesToCreate.length}`);
  console.log(`Articles to create: ${plan.articlesToCreate.length}`);
  console.log(`Existing articles to leave unchanged: ${plan.skippedArticles.length}`);
  console.log('Media records and GCS uploads: 0');
  if(plan.downgradedPlaceholders.length){
    console.log(`Placeholder articles imported as Draft: ${plan.downgradedPlaceholders.join(', ')}`);
  }
  if(plan.downgradedPrivateArticles.length){
    console.log(`Private-ID articles imported as Draft: ${plan.downgradedPrivateArticles.join(', ')}`);
  }
  for(const article of plan.articlesToCreate){
    console.log(`  ${article.status.padEnd(9)} ${article.slug}${article.coverImage.url?' (external cover URL)':''}`);
  }
  if(plan.errors.length){
    for(const item of plan.errors){
      console.error(`INVALID ${item.kind}: ${item.slug||'(missing slug)'}: ${item.issues.join(' | ')}`);
    }
    throw new Error('Migration preflight failed. No changes were made.');
  }

  if(!apply){
    console.log('Preview finished. Run with --apply only after reviewing the list above.');
  }else{
    for(const category of plan.categoriesToCreate){
      try{
        await target.createCategory(category.name);
        console.log(`Created category: ${category.slug}`);
      }catch(error){
        if(error?.statusCode===409){
          console.log(`Category already exists: ${category.slug}`);
          continue;
        }
        throw error;
      }
    }
    for(const article of plan.articlesToCreate){
      // Repeat the duplicate check to make retrying safe if a prior run
      // completed only partway through.
      const check=await pool.query('SELECT id FROM cms_articles WHERE slug=$1 LIMIT 1',[article.slug]);
      if(check.rowCount){
        console.log(`Skipped existing article: ${article.slug}`);
        continue;
      }
      const saved=await target.saveArticle(article);
      console.log(`Imported ${saved.status}: ${saved.slug}`);
    }
    console.log('Article-only migration completed. Sanity assets remain external until GCS is ready.');
  }
}finally{
  await pool.end();
}
