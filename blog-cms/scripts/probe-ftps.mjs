import {buildFtpsScript,runLftpScript} from './publish-cloud-run-job.mjs';

// One-off Cloud Run Job probe. Intentionally read-only and refuses to run
// unless the live publisher is explicitly kept in dry-run mode.
if(process.env.CMS_PUBLISH_DRY_RUN!=='true'){
  console.error('FTPS probe refused: CMS_PUBLISH_DRY_RUN must be true.');
  process.exitCode=1;
}else{
  try{
    // Build the validated FTPS configuration, but retain only connection and
    // security directives. Never pass mkdir, mirror, put or any other write
    // command to the diagnostic lftp session.
    const lines=buildFtpsScript(process.env).split('\n').filter(
      line=>line.startsWith('set ')||line.startsWith('open -u ')
    );
    if(lines.filter(line=>line.startsWith('open -u ')).length!==1)
      throw new Error('Expected one validated FTPS connection directive.');
    lines.push('cls -1 /index.html','cls -1 /sitemap.xml','cls -1 /','bye');
    await runLftpScript(lines.join('\n')+'\n');
    console.log('SUCCESS: Cloud Run verified read-only FTPS access to the website document root.');
    console.log('No remote files created, modified or deleted.');
  }catch(error){
    console.error('FTPS probe failed:',error.message);
    process.exitCode=1;
  }
}
