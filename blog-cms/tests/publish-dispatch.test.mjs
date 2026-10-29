import test from 'node:test';
import assert from 'node:assert/strict';
import {publishJobConfig,triggerPublishJob} from '../server/publish-dispatch.mjs';

const env={
  CMS_PUBLISH_PROJECT:'teledoctor-it',
  CMS_PUBLISH_REGION:'africa-south1',
  CMS_PUBLISH_JOB:'tdsa-blog-publisher'
};

test('not configured means no call to any external publishing system',async()=>{
  const result=await triggerPublishJob('test',{env:{},request:()=>{throw new Error('should not be called');}});
  assert.deepEqual(result,{configured:false,mode:'cloud-run-job'});
  assert.equal(publishJobConfig(env).job,'tdsa-blog-publisher');
});

test('Cloud Run service identity queues publishing job without GitHub dispatch',async()=>{
  let called=0;
  const request=async(url,options)=>{
    called++;
    if(called===1){
      assert.match(String(url),/metadata\.google\.internal/);
      assert.equal(options.headers['Metadata-Flavor'],'Google');
      return {ok:true,json:async()=>({access_token:'mock-google-token'})};
    }
    assert.match(String(url),/run\.googleapis\.com\/v2\/projects\/teledoctor-it\/locations\/africa-south1\/jobs\/tdsa-blog-publisher:run$/);
    assert.equal(options.headers.Authorization,'Bearer mock-google-token');
    assert.equal(options.method,'POST');
    assert.equal(options.body,'{}');
    return {ok:true,json:async()=>({name:'projects/example/operations/123'})};
  };
  const queued=await triggerPublishJob('article-published:test',{env,request});
  assert.equal(called,2);
  assert.equal(queued.configured,true);
  assert.equal(queued.ok,true);
  assert.equal(queued.queued,true);
  assert.equal(queued.operation,'projects/example/operations/123');
});

test('permissions failure is reported without claiming website deployment',async()=>{
  let called=0;
  const request=async()=>{
    called++;
    if(called===1)return {ok:true,json:async()=>({access_token:'token'})};
    return {ok:false,status:403};
  };
  const response=await triggerPublishJob('article-updated:test',{env,request});
  assert.equal(response.configured,true);
  assert.equal(response.ok,false);
  assert.match(response.error,/HTTP 403/);
  assert.equal(response.queued,undefined);
});

test('a misconfigured job name fails closed',async()=>{
  const response=await triggerPublishJob('test',{
    env:{...env,CMS_PUBLISH_JOB:'../bad-name'},
    request:()=>{throw new Error('Should never fetch');}
  });
  assert.equal(response.ok,false);
  assert.match(response.error,/Invalid Cloud Run publisher/);
});
