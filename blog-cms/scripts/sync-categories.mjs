import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
try{
  process.loadEnvFile(path.resolve(here,'..','.env'));
}catch(error){
  if(error?.code!=='ENOENT')throw error;
}

process.env.CMS_BACKEND='sanity';
process.env.SANITY_DATASET='staging';
process.env.CMS_ALLOW_PRODUCTION_WRITES='false';

const [{createRepository},{syncEditorialCategories}]=await Promise.all([
  import('../server/repository.mjs'),
  import('../server/category-catalog.mjs')
]);

const repo=createRepository();
const result=await syncEditorialCategories(repo);
console.log(`Editorial categories synced to ${repo.backendName}/${repo.dataset}: ${result.categories.length} total, ${result.created.length} created.`);
for(const category of result.categories)console.log(`- ${category.name} [${category.slug}]`);
