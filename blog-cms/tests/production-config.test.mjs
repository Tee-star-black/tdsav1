import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const baseline={
  ...process.env,
  NODE_ENV:'production',
  CMS_BACKEND:'postgres',
  CMS_AUTH_BACKEND:'postgres',
  CMS_MEDIA_BACKEND:'gcs',
  CMS_COOKIE_SECURE:'true',
  CMS_SCHEDULE_WORKER_ENABLED:'false',
  PGDATABASE:'tdsa_cms',
  PGUSER:'tdsa-cms-app',
  PGPASSWORD:'test-placeholder-not-real',
  GCS_BUCKET:'test-placeholder',
  CMS_INTERNAL_TOKEN:'test-placeholder',
  CMS_PUBLIC_ORIGIN:'https://cms.teledoctorsa.co.za'
};

function startup(overrides){
  return spawnSync(process.execPath,['server/server.mjs'],{
    cwd:process.cwd(),
    env:{...baseline,...overrides},
    encoding:'utf8',
    timeout:4000
  });
}

for(const [name,overrides,expected] of [
  ['local content backend',{CMS_BACKEND:'local'},'CMS_BACKEND=postgres'],
  ['file authentication',{CMS_AUTH_BACKEND:'file'},'CMS_AUTH_BACKEND=postgres'],
  ['local media storage',{CMS_MEDIA_BACKEND:'local'},'CMS_MEDIA_BACKEND=gcs'],
  ['insecure cookies',{CMS_COOKIE_SECURE:'false'},'CMS_COOKIE_SECURE=true'],
  ['in-process scheduler',{CMS_SCHEDULE_WORKER_ENABLED:'true'},'CMS_SCHEDULE_WORKER_ENABLED=false'],
  ['legacy admin token',{CMS_ACCESS_TOKEN:'not-for-production'},'prohibits CMS_ACCESS_TOKEN'],
  ['missing database user',{PGUSER:''},'requires PGUSER'],
  ['missing internal token',{CMS_INTERNAL_TOKEN:''},'requires CMS_INTERNAL_TOKEN'],
  ['missing CMS origin',{CMS_PUBLIC_ORIGIN:''},'requires CMS_PUBLIC_ORIGIN']
]){
  test(`production startup rejects ${name}`,()=>{
    const result=startup(overrides);
    assert.notEqual(result.status,0);
    assert.match(result.stderr, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  });
}
