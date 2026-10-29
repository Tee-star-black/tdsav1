// Trigger the in-house static publisher as a Cloud Run Job.
// The Google Cloud Run service identity needs run.jobs.run on this job only.
const METADATA_TOKEN_URL='http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

export function publishJobConfig(env=process.env){
  return {
    project:String(env.CMS_PUBLISH_PROJECT||'teledoctor-it').trim(),
    region:String(env.CMS_PUBLISH_REGION||'africa-south1').trim(),
    job:String(env.CMS_PUBLISH_JOB||'').trim()
  };
}

export async function triggerPublishJob(reason,{env=process.env,request=fetch}={}){
  const config=publishJobConfig(env);
  const base={configured:Boolean(config.job),mode:'cloud-run-job'};
  if(!config.job)return base;
  if(!/^[a-z][a-z0-9-]{0,62}$/.test(config.job)
    || !/^[a-z][a-z0-9-]*$/.test(config.project)
    || !/^[a-z]+-[a-z]+\d+$/.test(config.region)){
    return {...base,ok:false,error:'Invalid Cloud Run publisher configuration.'};
  }

  try{
    const identity=await request(METADATA_TOKEN_URL,{
      headers:{'Metadata-Flavor':'Google'},
      signal:AbortSignal.timeout(10000)
    });
    if(!identity.ok)throw new Error('Service identity unavailable (HTTP '+identity.status+').');
    const credentials=await identity.json();
    if(!credentials.access_token)throw new Error('Service identity returned no access token.');

    const endpoint='https://run.googleapis.com/v2/projects/'
      +encodeURIComponent(config.project)+'/locations/'
      +encodeURIComponent(config.region)+'/jobs/'
      +encodeURIComponent(config.job)+':run';
    const response=await request(endpoint,{
      method:'POST',
      headers:{
        Authorization:'Bearer '+credentials.access_token,
        'Content-Type':'application/json'
      },
      body:'{}',
      signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)throw new Error('Cloud Run Jobs API returned HTTP '+response.status+'.');
    const operation=await response.json();
    if(!operation.name)throw new Error('Cloud Run Jobs API returned no execution operation.');
    console.log('Queued blog publishing job:',String(reason||'content-updated'),operation.name);
    return {...base,ok:true,queued:true,operation:operation.name};
  }catch(error){
    const message=error?.name==='TimeoutError'?'Cloud Run Jobs API timed out.':error?.message||'Unable to start publisher.';
    console.error('Blog publishing job could not be queued:',message);
    return {...base,ok:false,error:message};
  }
}
