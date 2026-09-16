import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {SanityRepository} from '../server/sanity-repository.mjs';

const repo=new SanityRepository();
const articles=await repo.listPublicArticles();
const outDir=path.resolve(process.cwd(),'content');
await mkdir(outDir,{recursive:true});
await writeFile(path.join(outDir,'articles.json'),JSON.stringify({articles},null,2),'utf8');
console.log(`Fetched ${articles.length} published article(s) from Sanity.`);
