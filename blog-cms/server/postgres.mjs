import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

let sharedPool=null;

export function createPgPool(options={}){
  const {Pool}=require('pg');
  if(options.pool)return options.pool;
  const config={
    max:Number(process.env.PGPOOL_MAX||10),
    idleTimeoutMillis:Number(process.env.PG_IDLE_TIMEOUT_MS||30000),
    connectionTimeoutMillis:Number(process.env.PG_CONNECTION_TIMEOUT_MS||10000),
    ...(process.env.DATABASE_URL?{connectionString:process.env.DATABASE_URL}:{})
  };
  if(String(process.env.PGSSL||'').toLowerCase()==='require')config.ssl={rejectUnauthorized:false};
  return new Pool(config);
}

export function getPgPool(){
  if(!sharedPool)sharedPool=createPgPool();
  return sharedPool;
}
