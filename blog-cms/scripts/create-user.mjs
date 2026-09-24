import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAuthStore} from '../server/auth-factory.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
try{process.loadEnvFile(path.join(cmsRoot,'.env'));}catch(error){if(error?.code!=='ENOENT')throw error;}

const args=process.argv.slice(2);
function value(flag){const i=args.indexOf(flag);return i>=0?args[i+1]||'':'';}
const email=value('--email');
const name=value('--name');
const role=value('--role')||'editor';
const password=value('--password')||process.env.CMS_NEW_USER_PASSWORD||'';
if(!email||!name){
  console.error('Usage: npm run user:create -- --email person@company.co.za --name "Person Name" --role editor');
  process.exit(1);
}

const auth=createAuthStore();
const result=await auth.createUser({email,name,role,password:password||undefined});
console.log(`Created ${result.user.role} account for ${result.user.name} <${result.user.email}>.`);
if(result.temporaryPassword){
  console.log('Temporary password (shown once):');
  console.log(result.temporaryPassword);
  console.log('Store/share it securely, then have the user change it after signing in.');
}
