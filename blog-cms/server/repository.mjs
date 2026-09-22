import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {LocalRepository} from './local-repository.mjs';
import {SanityRepository} from './sanity-repository.mjs';

export function createRepository(){
  try{process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../.env'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const mode=(process.env.CMS_BACKEND||'local').toLowerCase();
  if(mode==='sanity')return new SanityRepository();
  return new LocalRepository();
}

