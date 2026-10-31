import {buildFtpsProbeScript,runLftpScript} from './publish-cloud-run-job.mjs';

// One-off Cloud Run Job probe: only read-only FTP directory listings.
if(process.env.CMS_PUBLISH_DRY_RUN!=='true'){
  console.error('FTPS probe refused: CMS_PUBLISH_DRY_RUN must be true.');
  process.exitCode=1;
}else{
  try{
    await runLftpScript(buildFtpsProbeScript(process.env));
    console.log('SUCCESS: Cloud Run verified read-only FTPS access to the website document root.');
    console.log('No remote files created, modified or deleted.');
  }catch(error){
    console.error('FTPS probe failed:',error.message);
    process.exitCode=1;
  }
}
