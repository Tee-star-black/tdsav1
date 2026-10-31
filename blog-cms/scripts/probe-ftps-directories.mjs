import {buildFtpsDirectoryProbeScript,runLftpScript} from './publish-cloud-run-job.mjs';

// Test cPanel's existing-directory response while all targets already exist.
// The script lists each directory BEFORE attempting an idempotent MKD.
if(process.env.CMS_PUBLISH_DRY_RUN!=='true'){
  console.error('FTPS directory probe refused: dry-run must be true.');
  process.exitCode=1;
}else{
  try{
    await runLftpScript(buildFtpsDirectoryProbeScript(process.env));
    console.log('SUCCESS: Existing FTP directory creation is idempotent on cPanel.');
    console.log('No blog files uploaded or deleted.');
  }catch(error){
    console.error('FTPS directory probe failed:',error.message);
    process.exitCode=1;
  }
}
