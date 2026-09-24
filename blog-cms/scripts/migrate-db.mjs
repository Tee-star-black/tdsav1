import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getPgPool} from '../server/postgres.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const cmsRoot=path.resolve(here,'..');
try{process.loadEnvFile(path.join(cmsRoot,'.env'));}catch(error){if(error?.code!=='ENOENT')throw error;}

const pool=getPgPool();
const dir=path.join(cmsRoot,'db','migrations');
await pool.query(`CREATE TABLE IF NOT EXISTS cms_schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`);

const applied=new Set((await pool.query('SELECT name FROM cms_schema_migrations')).rows.map(row=>row.name));
const files=(await readdir(dir)).filter(name=>/^\d+.*\.sql$/.test(name)).sort();
let count=0;

for(const name of files){
  if(applied.has(name))continue;
  const sql=await readFile(path.join(dir,name),'utf8');
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO cms_schema_migrations(name) VALUES($1)',[name]);
    await client.query('COMMIT');
    console.log(`Applied ${name}`);
    count++;
  }catch(error){
    await client.query('ROLLBACK').catch(()=>{});
    throw error;
  }finally{client.release();}
}

console.log(count?`Applied ${count} CMS database migration(s).`:'CMS database is already up to date.');
await pool.end();
