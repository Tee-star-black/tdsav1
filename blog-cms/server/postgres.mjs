import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

let sharedPool=null;

export function createPgPool(options={}){
  const {Pool}=require('pg');
  if(options.pool)return options.pool;
  const config={
    max:Number(process.env.PGPOOL_MAX||5),
    idleTimeoutMillis:Number(process.env.PG_IDLE_TIMEOUT_MS||30000),
    connectionTimeoutMillis:Number(process.env.PG_CONNECTION_TIMEOUT_MS||10000),
    ...(process.env.DATABASE_URL?{connectionString:process.env.DATABASE_URL}:{})
  };
  if(String(process.env.PGSSL||'').toLowerCase()==='require')config.ssl={rejectUnauthorized:false};
  const pool=new Pool(config);
  // node-postgres emits errors on idle clients after network interruptions.
  // Without a listener, EventEmitter can terminate the Node.js process.
  pool.on('error',(error)=>{
    console.error('CMS PostgreSQL idle client error:',error?.code||error?.message||'unknown');
  });
  return pool;
}

export function getPgPool(){
  if(!sharedPool)sharedPool=createPgPool();
  return sharedPool;
}
