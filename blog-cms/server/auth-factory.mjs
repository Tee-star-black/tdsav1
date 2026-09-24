import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {AuthStore} from './auth.mjs';
import {PostgresAuthStore} from './postgres-auth.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');

export function createAuthStore(){
  const contentBackend=String(process.env.CMS_BACKEND||'local').toLowerCase();
  const mode=String(process.env.CMS_AUTH_BACKEND||(contentBackend==='postgres'?'postgres':'file')).toLowerCase();
  const common={sessionHours:Number(process.env.CMS_SESSION_HOURS||12),cookieSecure:String(process.env.CMS_COOKIE_SECURE||'').toLowerCase()==='true'};
  if(mode==='postgres')return new PostgresAuthStore(common);
  const store=new AuthStore({filePath:process.env.CMS_AUTH_FILE||path.join(cmsRoot,'data','auth.local.json'),...common});
  store.backendName='file';
  return store;
}
