import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=String(process.env.CMS_PUBLIC_API_URL||'').replace(/\/$/,'');
if(!base)throw new Error('CMS_PUBLIC_API_URL is required, for example https://cms.teledoctorsa.co.za');

// Google Cloud Run IAM validates a short-lived Google-signed ID token.
// Never print the token or persist it in the generated content.
const identityToken=String(process.env.CMS_PUBLIC_API_TOKEN||'').trim();
const headers={Accept:'application/json'};
if(identityToken)headers.Authorization=`Bearer ${identityToken}`;
const response=await fetch(`${base}/api/public/articles`,{headers});
if(!response.ok)throw new Error(`CMS public API returned HTTP ${response.status}.`);
const payload=await response.json();
const articles=Array.isArray(payload?.articles)?payload.articles:[];
const outDir=path.resolve(process.cwd(),'content');
await mkdir(outDir,{recursive:true});
await writeFile(path.join(outDir,'articles.json'),JSON.stringify({articles},null,2),'utf8');
console.log(`Fetched ${articles.length} published article(s) from ${base}.`);
