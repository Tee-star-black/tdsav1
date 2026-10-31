import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {buildFtpsDirectoryProbeScript,buildFtpsProbeScript,buildFtpsScript,publishingDryRun,runLftpScript,runPublishingJob,verifyLiveBlog} from '../scripts/publish-cloud-run-job.mjs';

const remoteEnv={
  CMS_FTP_HOST:'ftp.example.test',
  CMS_FTP_USERNAME:'editor',
  CMS_FTP_PASSWORD:'secret-value',
  CMS_FTP_REMOTE_ROOT:'/domains/teledoctorsa.co.za/public_html'
};

function fakePool(log){
  return {
    async connect(){return {
      async query(sql){log.push('SQL '+sql);return {rows:[{}]};},
      release(){log.push('RELEASE');}
    };},
    async end(){log.push('POOL_END');}
  };
}

test('FTP publisher forces encryption and never deletes outside /blog',()=>{
  const script=buildFtpsScript(remoteEnv);
  assert.match(script,/set ftp:ssl-force yes/);
  assert.match(script,/set ftp:ssl-protect-data yes/);
  assert.match(script,/set ssl:verify-certificate yes/);
  assert.match(script,/mirror -R --delete --verbose blog "\/domains\/teledoctorsa.co.za\/public_html\/blog"/);
  assert.doesNotMatch(script,/mirror -R --delete --verbose \.\s/);
  assert.doesNotMatch(script,/put -O .* sitemap\.xml/, 'Do not replace the live root sitemap by default.');
  const optedIn=buildFtpsScript({...remoteEnv,CMS_PUBLISH_UPLOAD_ROOT_SITEMAP:'true'});
  assert.match(optedIn,/put -O .* sitemap\.xml/);
});

test('FTP settings reject root, traversal and plaintext-untrusted host inputs',()=>{
  for(const root of ['/','/tmp','/public_html/../elsewhere','public_html']){
    assert.throws(()=>buildFtpsScript({...remoteEnv,CMS_FTP_REMOTE_ROOT:root}),/CMS_FTP_REMOTE_ROOT/);
  }
  assert.throws(()=>buildFtpsScript({...remoteEnv,CMS_FTP_HOST:'example.com; rm -rf /'}),/CMS_FTP_HOST/);
  assert.throws(()=>buildFtpsScript({...remoteEnv,CMS_FTP_PASSWORD:'bad\npassword'}),/Invalid FTP setting/);
});

test('cPanel jailed FTP account can publish to document-root / only when explicitly enabled',()=>{
  const cpanel={...remoteEnv,
    CMS_FTP_REMOTE_ROOT:'/',
    CMS_FTP_JAILED_PUBLIC_HTML:'true'
  };
  const script=buildFtpsScript(cpanel);
  assert.match(script,/open -u "editor","secret-value"/);
  assert.match(script,/set ftp:ssl-force yes/);
  assert.match(script,/set ftp:ssl-protect-data yes/);
  assert.match(script,/set ssl:verify-certificate yes/);
  assert.match(script,/mkdir -p -f "\/blog"/);
  assert.match(script,/mkdir -p -f "\/styles"/);
  assert.match(script,/mkdir -p -f "\/scripts"/);
  assert.doesNotMatch(script,/(?:^|\n)mkdir -p "[^"]+"/m);
  assert.match(script,/mirror -R --delete --verbose blog "\/blog"/);
  assert.match(script,/put -O "\/styles" styles\/blog\.css/);
  assert.match(script,/put -O "\/scripts" scripts\/blog\.js/);
  assert.doesNotMatch(script,/put -O "\/" sitemap\.xml/);
  assert.match(buildFtpsScript({...cpanel,CMS_PUBLISH_UPLOAD_ROOT_SITEMAP:'true'}),/put -O "\/" sitemap\.xml/);
  assert.doesNotMatch(script,/mirror -R --delete --verbose blog "\/"/);
  assert.doesNotMatch(script,/mirror -R --delete --verbose \. /);

  assert.throws(()=>buildFtpsScript({...cpanel,CMS_FTP_JAILED_PUBLIC_HTML:'false'}),/CMS_FTP_JAILED_PUBLIC_HTML/);
  assert.throws(()=>buildFtpsScript({...cpanel,CMS_FTP_JAILED_PUBLIC_HTML:'yes'}),/CMS_FTP_JAILED_PUBLIC_HTML/);
  assert.throws(()=>buildFtpsScript({...cpanel,CMS_FTP_REMOTE_ROOT:'/public_html'}),/CMS_FTP_REMOTE_ROOT/);
  assert.throws(()=>buildFtpsScript({...cpanel,CMS_FTP_REMOTE_ROOT:'/../../public_html'}),/CMS_FTP_REMOTE_ROOT/);
});

test('read-only Cloud Run probe never contains FTP write commands',()=>{
  const script=buildFtpsProbeScript({...remoteEnv,CMS_FTP_REMOTE_ROOT:'/',CMS_FTP_JAILED_PUBLIC_HTML:'true'});
  assert.match(script,/set ssl:verify-certificate yes/);
  assert.match(script,/set ftp:ssl-force yes/);
  assert.match(script,/cls -1 \/index\.html/);
  assert.match(script,/cls -1 \/sitemap\.xml/);
  assert.doesNotMatch(script,/(?:^|\n)(?:mkdir|mirror|put|rm|mput|mv|chmod|delete|rmdir|mrm)\b/m);
  assert.equal(script.split('\n').filter(line=>line.startsWith('open -u ')).length,1);
});

test('publisher directory creation is idempotent for existing cPanel folders',()=>{
  const script=buildFtpsScript({...remoteEnv,CMS_FTP_REMOTE_ROOT:'/',CMS_FTP_JAILED_PUBLIC_HTML:'true'});
  assert.match(script,/(?:^|\n)mkdir -p -f "\/blog"/);
  assert.match(script,/(?:^|\n)mkdir -p -f "\/styles"/);
  assert.match(script,/(?:^|\n)mkdir -p -f "\/scripts"/);
  assert.doesNotMatch(script,/(?:^|\n)mkdir -p "(?:\/blog|\/styles|\/scripts)"/);
  assert.match(script,/set cmd:fail-exit yes/);
  assert.match(script,/set ssl:verify-certificate yes/);
  assert.match(script,/set ftp:ssl-force yes/);
  assert.match(script,/mirror -R --delete --verbose blog "\/blog"/);
  assert.doesNotMatch(script,/put -O "\/" sitemap\.xml/);
});

test('directory preflight confirms existing paths before any attempted mkdir',()=>{
  const env={...remoteEnv,CMS_FTP_REMOTE_ROOT:'/',CMS_FTP_JAILED_PUBLIC_HTML:'true'};
  const script=buildFtpsDirectoryProbeScript(env);
  const lines=script.split('\n').filter(Boolean);
  const mkdirs=lines.filter(x=>x.startsWith('mkdir '));
  const checks=lines.filter(x=>x.startsWith('cls -1 '));
  assert.deepEqual(checks,['cls -1 "/blog"','cls -1 "/styles"','cls -1 "/scripts"']);
  assert.deepEqual(mkdirs,['mkdir -p -f "/blog"','mkdir -p -f "/styles"','mkdir -p -f "/scripts"']);
  assert.ok(lines.indexOf(checks[2])<lines.indexOf(mkdirs[0]));
  assert.doesNotMatch(script,/(?:^|\n)(?:put|mirror|rm|mput|delete|rmdir|mrm)\b/m);
  assert.match(script,/set ssl:verify-certificate yes/);
  assert.match(script,/set ftp:ssl-force yes/);
});

test('FTPS command file is private, not passed via argv, and deleted after success',async()=>{
  const secret='not-a-real-password-42';
  let filePath='';
  await runLftpScript('echo '+secret+'\nbye\n',{
    run:async(file,args)=>{
      assert.equal(file,'lftp');
      assert.deepEqual(args.slice(0,2),['--norc','-f']);
      assert.equal(args.length,3);
      assert.doesNotMatch(args.join(' '),/not-a-real-password-42/);
      filePath=args[2];
      assert.equal(path.basename(filePath),'commands.lftp');
      assert.equal((await stat(filePath)).mode&0o777,0o600);
      assert.equal((await stat(path.dirname(filePath))).mode&0o777,0o700);
      assert.match(await readFile(filePath,'utf8'),/not-a-real-password-42/);
    }
  });
  await assert.rejects(access(filePath),{code:'ENOENT'});
});

test('FTPS command file is removed even after lftp fails',async()=>{
  let filePath='';
  await assert.rejects(runLftpScript('bye\n',{
    run:async(file,args)=>{
      assert.equal(file,'lftp');
      filePath=args[2];
      throw new Error('simulated FTPS network failure');
    }
  }),/simulated FTPS network failure/);
  await assert.rejects(access(filePath),{code:'ENOENT'});
});

test('default publisher execution builds from PostgreSQL but cannot touch FTP',async()=>{
  const log=[];
  const out=await runPublishingJob({
    env:{CMS_BACKEND:'postgres'},
    pool:fakePool(log),
    run:async(file,args)=>log.push(file+' '+args.join(' ')),
    inspectFiles:async()=>log.push('FILES_OK'),
    read:async()=>JSON.stringify({articles:[{slug:'story-one'}]}),
    logger:{log:()=>{},error:()=>{}}
  });
  assert.equal(publishingDryRun({}),true);
  assert.equal(out.ok,true);
  assert.equal(out.dryRun,true);
  assert.equal(out.count,1);
  assert.equal(log.filter(x=>x.includes('scripts/')).length,2);
  assert.equal(log.some(x=>x.startsWith('lftp ')),false);
  assert.equal(log.filter(x=>x.includes('pg_advisory_lock')).length,1);
  assert.equal(log.filter(x=>x.includes('pg_advisory_unlock')).length,1);
  assert.ok(log.includes('POOL_END'));
});

test('live publisher holds advisory lock through upload and verification',async()=>{
  const log=[];
  const env={...remoteEnv,CMS_BACKEND:'postgres',CMS_PUBLISH_DRY_RUN:'false'};
  const result=await runPublishingJob({
    env,
    pool:fakePool(log),
    run:async(file,args,options)=>{
      log.push(file+' '+args.join(' '));
      if(file==='lftp'){
        assert.deepEqual(args.slice(0,2),['--norc','-f']);
        assert.equal(args.length,3);
        assert.match(await readFile(args[2],'utf8'),/set ftp:ssl-force yes/);
        assert.match(await readFile(args[2],'utf8'),/mirror -R --delete/);
        assert.doesNotMatch(args.join(' '),/secret-value/);
      }
    },
    inspectFiles:async()=>{},
    read:async()=>JSON.stringify({articles:[{slug:'story-two'},{slug:'story-one'}]}),
    verify:async(slugs)=>{assert.deepEqual(slugs,['story-two','story-one']);log.push('VERIFIED');},
    logger:{log:()=>{},error:()=>{}}
  });
  assert.equal(result.dryRun,false);
  assert.equal(log.filter(x=>x.startsWith('lftp ')).length,1);
  assert.ok(log.indexOf('VERIFIED')<log.findIndex(x=>x.includes('pg_advisory_unlock')));
});

test('failed build releases advisory lock and cannot upload',async()=>{
  const log=[];
  await assert.rejects(runPublishingJob({
    env:{CMS_BACKEND:'postgres'},
    pool:fakePool(log),
    run:async()=>{throw new Error('build failed');},
    inspectFiles:async()=>{},
    read:async()=>JSON.stringify({articles:[]}),
    logger:{log:()=>{},error:()=>{}}
  }),/build failed/);
  assert.ok(log.some(x=>x.includes('pg_advisory_unlock')));
  assert.ok(log.includes('POOL_END'));
  assert.equal(log.some(x=>x.startsWith('lftp ')),false);
});

test('live website verification compares published slugs, including empty withdrawal',async()=>{
  const response={ok:true,json:async()=>({articles:[]})};
  assert.equal(await verifyLiveBlog([],{base:'https://teledoctorsa.co.za',request:async()=>response}),true);
  await assert.rejects(verifyLiveBlog([],{
    base:'http://teledoctorsa.co.za',
    request:async()=>response
  }),/HTTPS/);
});
