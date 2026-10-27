import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureArticleCoverInStorage} from '../scripts/import-cover-media.mjs';

test('migration copies a standalone Sanity cover to CMS media storage',async()=>{
  const mediaMap=new Map(),existingMedia=[];
  const uploads=[];
  const target={async uploadMedia(input){
    uploads.push(input);
    return {id:'media-imported',name:input.name,alt:input.alt,url:'https://storage.googleapis.com/cms/cover.jpg'};
  }};
  let fetches=0;
  const fetchImage=async(url)=>{
    fetches++;
    assert.equal(url,'https://cdn.sanity.io/images/cover.jpg');
    return {ok:true,headers:{get:()=> 'image/jpeg'},arrayBuffer:async()=>Uint8Array.from([1,2,3]).buffer};
  };
  const article={slug:'cover-only-article',title:'Cover only article',coverImage:{
    assetId:'image-standalone',url:'https://cdn.sanity.io/images/cover.jpg',alt:'Article illustration'
  }};
  const result=await ensureArticleCoverInStorage(article,{mediaMap,existingMedia,target,fetchImage});
  assert.equal(result.url,'https://storage.googleapis.com/cms/cover.jpg');
  assert.equal(mediaMap.get('image-standalone'),result);
  assert.equal(uploads.length,1);
  assert.equal(uploads[0].dataUrl,'data:image/jpeg;base64,AQID');
  assert.equal(fetches,1);
  assert.equal(existingMedia.length,1);

  const duplicate=await ensureArticleCoverInStorage(article,{mediaMap,existingMedia,target,fetchImage});
  assert.equal(duplicate.id,'media-imported');
  assert.equal(fetches,1,'same cover should never be fetched again');
});

test('migration reuses a previously imported cover on retry',async()=>{
  const existingMedia=[{id:'saved',name:'cover-repeat-article',alt:'Cover alternative',url:'https://storage.googleapis.com/cms/repeat.jpg'}];
  const mediaMap=new Map();
  const article={slug:'repeat-article',title:'Repeat article',coverImage:{assetId:'image-repeat',url:'https://cdn.sanity.io/images/repeat.jpg',alt:'Cover alternative'}};
  const result=await ensureArticleCoverInStorage(article,{
    mediaMap,existingMedia,
    target:{uploadMedia(){throw new Error('Unexpected upload');}},
    fetchImage(){throw new Error('Unexpected fetch');}
  });
  assert.equal(result.id,'saved');
  assert.equal(mediaMap.get('image-repeat'),result);
});

test('migration ignores articles without covers',async()=>{
  const result=await ensureArticleCoverInStorage({slug:'draft',coverImage:{}},{
    mediaMap:new Map(),existingMedia:[],
    target:{uploadMedia(){throw new Error('Unexpected upload');}}
  });
  assert.equal(result,null);
});
