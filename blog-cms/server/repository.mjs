import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {LocalRepository} from './local-repository.mjs';
import {PostgresRepository} from './postgres-repository.mjs';

export function createRepository(){
  try{process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../.env'));}catch(error){if(error?.code!=='ENOENT')throw error;}
  const mode=String(process.env.CMS_BACKEND||(process.env.NODE_ENV==='production'?'postgres':'local')).toLowerCase();
  if(['postgres','postgresql','cloudsql'].includes(mode))return new PostgresRepository();
  if(mode==='local'&&process.env.NODE_ENV!=='production')return new LocalRepository();
  throw new Error('Unsupported CMS_BACKEND: configure postgres for production, or local for development.');
}
