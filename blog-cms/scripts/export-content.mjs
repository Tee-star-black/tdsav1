import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRepository} from '../server/repository.mjs';

const repo=createRepository();
const articles=await repo.listPublicArticles();
const outDir=path.resolve(process.cwd(),'content');
await mkdir(outDir,{recursive:true});
await writeFile(path.join(outDir,'articles.json'),JSON.stringify({articles},null,2),'utf8');
console.log(`Exported ${articles.length} published article(s) from ${repo.backendName} backend.`);
