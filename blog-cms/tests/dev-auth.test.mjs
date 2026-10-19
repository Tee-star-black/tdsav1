import test from 'node:test';
import assert from 'node:assert/strict';
import {canUseLocalDevelopmentAdmin} from '../server/dev-auth.mjs';

test('production does not grant an administrator when the database has no users',()=>{
  assert.equal(canUseLocalDevelopmentAdmin({environment:'production',hasUsers:false,accessToken:''}),false);
});

test('a configured staff account disables the development-only administrator',()=>{
  assert.equal(canUseLocalDevelopmentAdmin({environment:'development',hasUsers:true,accessToken:''}),false);
});

test('development-only administrator is unavailable when a legacy access token exists',()=>{
  assert.equal(canUseLocalDevelopmentAdmin({environment:'development',hasUsers:false,accessToken:'secret'}),false);
});

test('development without staff or token retains the local bootstrap workflow',()=>{
  assert.equal(canUseLocalDevelopmentAdmin({environment:'development',hasUsers:false,accessToken:''}),true);
});

test('unknown account state fails closed',()=>{
  assert.equal(canUseLocalDevelopmentAdmin({environment:'development',accessToken:''}),false);
});
