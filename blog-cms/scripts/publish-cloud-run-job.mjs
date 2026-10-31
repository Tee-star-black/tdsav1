import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {getPgPool} from '../server/postgres.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const siteRoot=path.resolve(root,'..');
const LOCK_SQL="SELECT pg_advisory_lock(hashtext('tdsa_blog_publisher'))";
const UNLOCK_SQL="SELECT pg_advisory_unlock(hashtext('tdsa_blog_publisher'))";

export function publishingDryRun(env=process.env){
  return String(env.CMS_PUBLISH_DRY_RUN||'true').toLowerCase()!=='false';
}

function lftpQuote(value){
  const input=String(value||'');
  if(!input||/[\r\n\0]/.test(input))throw new Error('Invalid FTP setting.');
  return '"'+input.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"';
}

// Only explicit TLS FTP is supported: no unencrypted FTP and no ignored TLS errors.
// Remote publishing is confined to a configured public_html directory.
export function buildFtpsScript(env=process.env){
  const rawHost=String(env.CMS_FTP_HOST||'').trim();
  const host=rawHost.replace(/^ftp:\/\//i,'');
  if(!/^[A-Za-z0-9.-]+(?::[0-9]{2,5})?$/.test(host))
    throw new Error('CMS_FTP_HOST must be an FTP hostname (optionally with a port).');
  const user=lftpQuote(env.CMS_FTP_USERNAME);
  const password=lftpQuote(env.CMS_FTP_PASSWORD);
  const configuredRoot=String(env.CMS_FTP_REMOTE_ROOT||'').trim();
  const ftpAccountJailed=String(env.CMS_FTP_JAILED_PUBLIC_HTML||'').trim().toLowerCase()==='true';
  const remote=configuredRoot==='/'?'/':configuredRoot.replace(/\/+$/,'');
  const remoteIsExplicitPublicHtml=remote!=='/'
    && remote.startsWith('/')
    && remote.split('/').includes('public_html')
    && /^\/[A-Za-z0-9._/-]+$/.test(remote)
    && !remote.split('/').some(segment=>segment==='..'||segment==='.');
  if(remote==='/'){
    if(!ftpAccountJailed){
      throw new Error('CMS_FTP_REMOTE_ROOT=/ requires CMS_FTP_JAILED_PUBLIC_HTML=true and a verified FTP account restricted to the website document root.');
    }
  }else if(!remoteIsExplicitPublicHtml||ftpAccountJailed){
    throw new Error('CMS_FTP_REMOTE_ROOT must contain public_html, or be / with CMS_FTP_JAILED_PUBLIC_HTML=true for a restricted cPanel FTP account.');
  }
  // A cPanel FTP account whose home directory is public_html sees it as '/'.
  // Keep deletions confined to /blog and never mirror the entire document root.
  const target=remote==='/'?'':remote.replace(/\/+/g,'/');
  const remotePath=(suffix)=>target+suffix;
  return [
    'set cmd:fail-exit yes',
    'set net:max-retries 2',
    'set net:timeout 20',
    'set ssl:verify-certificate yes',
    'set ftp:ssl-force yes',
    'set ftp:ssl-protect-data yes',
    'set ftp:passive-mode yes',
    'open -u '+user+','+password+' '+lftpQuote('ftp://'+host),
    // cPanel FTP replies 550 when MKD targets an existing directory; lftp
    // mkdir -p -f treats existing directories as a successful no-op.
    // Keep cmd:fail-exit for transfer errors (uploads still fail on denial).
    'mkdir -p -f '+lftpQuote(remotePath('/blog')),
    'mkdir -p -f '+lftpQuote(remotePath('/styles')),
    'mkdir -p -f '+lftpQuote(remotePath('/scripts')),
    'mirror -R --delete --verbose blog '+lftpQuote(remotePath('/blog')),
    'put -O '+lftpQuote(remotePath('/styles'))+' styles/blog.css',
    'put -O '+lftpQuote(remotePath('/scripts'))+' scripts/blog.js',
    // The live root sitemap may differ from the repository snapshot. Opt in
    // only after reviewing a fresh diff and taking a verified backup.
    ...(String(env.CMS_PUBLISH_UPLOAD_ROOT_SITEMAP||'').toLowerCase()==='true'
      ? ['put -O '+lftpQuote(target||'/')+' sitemap.xml']
      : []),
    'bye'
  ].join('\n')+'\n';
}

// Safe diagnostic script: connection settings plus read-only file listings.
// It deliberately excludes mirror, mkdir, put and the sitemap upload.
export function buildFtpsProbeScript(env=process.env){
  const commands=buildFtpsScript(env).split('\n').filter(
    line=>line.startsWith('set ')||line.startsWith('open -u ')
  );
  if(commands.filter(line=>line.startsWith('open -u ')).length!==1)
    throw new Error('Expected one validated FTPS login command.');
  return [...commands,'cls -1 /index.html','cls -1 /sitemap.xml','cls -1 /','bye'].join('\n')+'\n';
}

// Regression probe: before issuing any MKD, prove all three target
// directories already exist by listing each. Then exercise the exact
// idempotent mkdir syntax in the deployed lftp against cPanel's 550 response.
// With a known-existing root this does not create, upload or delete files.
export function buildFtpsDirectoryProbeScript(env=process.env){
  const commands=buildFtpsScript(env).split('\n');
  const header=commands.filter(
    line=>line.startsWith('set ')||line.startsWith('open -u ')
  );
  const mkdirs=commands.filter(line=>line.startsWith('mkdir -p -f '));
  if(header.filter(line=>line.startsWith('open -u ')).length!==1||mkdirs.length!==3)
    throw new Error('Invalid FTPS directory probe configuration.');
  const dirs=mkdirs.map(line=>line.slice('mkdir -p -f '.length));
  return [...header,...dirs.map(dir=>'cls -1 '+dir),...mkdirs,'bye'].join('\n')+'\n';
}

export function spawnPublisherCommand(binary,args,{cwd=root,env=process.env,stdin=''}={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(binary,args,{cwd,env,stdio:['pipe','inherit','inherit']});
    child.once('error',reject);
    child.once('close',code=>code===0?resolve():reject(new Error(path.basename(binary)+' exited with status '+code+'.')));
    child.stdin.on('error',reject);
    child.stdin.end(stdin);
  });
}

// Node's child_process 'pipe' can be socket-backed, so lftp -f /dev/stdin
// fails when it attempts to reopen FD 0. Use a private ephemeral command file
// instead, without putting FTP credentials in process command-line arguments.
export async function runLftpScript(script,{run=spawnPublisherCommand,env=process.env}={}){
  const directory=await mkdtemp(path.join(tmpdir(),'tdsa-ftps-'));
  const scriptPath=path.join(directory,'commands.lftp');
  try{
    await writeFile(scriptPath,script,{mode:0o600,flag:'wx'});
    await run('lftp',['--norc','-f',scriptPath],{cwd:siteRoot,env});
  }finally{
    await rm(directory,{recursive:true,force:true});
  }
}

export async function verifyLiveBlog(slugs,{base='https://teledoctorsa.co.za',request=fetch}={}){
  const url=new URL(base);
  if(url.protocol!=='https:')throw new Error('Public blog verification requires HTTPS.');
  const expected=[...slugs].sort();
  for(let attempt=1;attempt<=5;attempt++){
    try{
      const response=await request(new URL('/blog/feed.json?cms_check='+Date.now(),url),{
        headers:{'Cache-Control':'no-cache'},
        signal:AbortSignal.timeout(15000)
      });
      if(!response.ok)throw new Error('Live blog feed returned HTTP '+response.status+'.');
      const body=await response.json();
      if(!Array.isArray(body.articles))throw new Error('Live blog feed was not valid.');
      const actual=body.articles.map(item=>item.slug).sort();
      if(JSON.stringify(actual)===JSON.stringify(expected))return true;
    }catch(error){
      if(attempt===5)throw new Error('Live blog verification failed: '+error.message);
    }
    if(attempt<5)await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw new Error('Live blog feed did not match the published PostgreSQL articles.');
}

async function requireBuiltFiles(){
  for(const relative of ['blog/index.html','blog/feed.json','blog/sitemap.xml','sitemap.xml','styles/blog.css','scripts/blog.js']){
    const file=path.join(siteRoot,relative);
    const info=await stat(file);
    if(!info.isFile()||info.size===0)throw new Error('Required generated file missing: '+relative);
  }
}

export async function runPublishingJob({
  env=process.env,
  pool=getPgPool(),
  run=spawnPublisherCommand,
  verify=verifyLiveBlog,
  inspectFiles=requireBuiltFiles,
  read=readFile,
  logger=console
}={}){
  if(String(env.CMS_BACKEND||'').toLowerCase()!=='postgres')
    throw new Error('Publisher must use CMS_BACKEND=postgres to read Cloud SQL.');
  const dryRun=publishingDryRun(env);
  // Validate the destination before reading or writing anything on production hosting.
  const ftpScript=dryRun?'':buildFtpsScript(env);
  const client=await pool.connect();
  let locked=false;
  try{
    await client.query(LOCK_SQL);
    locked=true;
    // The advisory lock serializes overlapping job executions. Each execution
    // re-exports the latest database state only AFTER obtaining the lock.
    await run(process.execPath,['scripts/export-content.mjs'],{cwd:root,env});
    await run(process.execPath,['scripts/build-blog.mjs'],{cwd:root,env});
    await inspectFiles();
    const {articles}=JSON.parse(await read(path.join(root,'content/articles.json'),'utf8'));
    if(!Array.isArray(articles))throw new Error('Published content export is invalid.');
    logger.log('Built static blog from Cloud SQL:',articles.length,'published articles.');
    if(dryRun){
      logger.log('DRY RUN: No files uploaded. Set CMS_PUBLISH_DRY_RUN=false after acceptance.');
      return {ok:true,dryRun:true,count:articles.length};
    }
    await runLftpScript(ftpScript,{run,env});
    await verify(articles.map(article=>article.slug),{base:env.CMS_PUBLISH_VERIFY_BASE_URL||'https://teledoctorsa.co.za'});
    logger.log('Published static blog verified on live website:',articles.length,'articles.');
    return {ok:true,dryRun:false,count:articles.length};
  }finally{
    if(locked)await client.query(UNLOCK_SQL).catch(error=>logger.error('Advisory lock cleanup failed:',error.message));
    client.release();
    await pool.end();
  }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  runPublishingJob().catch(error=>{
    console.error('Blog publishing job failed:',error.message);
    process.exitCode=1;
  });
}
