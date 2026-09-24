import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

function decodeImage(input={}){
  const name=String(input.name||'upload-image').replace(/[^a-zA-Z0-9._-]/g,'-');
  const match=String(input.dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);
  if(!match)throw Object.assign(new Error('A valid image upload is required.'),{statusCode:400});
  const mimeType=match[1];
  if(!mimeType.startsWith('image/'))throw Object.assign(new Error('Only image uploads are supported.'),{statusCode:400});
  const alt=String(input.alt||'').trim();
  if(alt.length<3)throw Object.assign(new Error('Alternative text is required for editorial images.'),{statusCode:400});
  const ext=(mimeType.split('/')[1]||'img').replace('jpeg','jpg').replace(/[^a-z0-9]/g,'')||'img';
  const base=path.parse(name).name||'image';
  const filename=`${Date.now()}-${Math.random().toString(36).slice(2,9)}-${base}.${ext}`;
  return {name:base,mimeType,alt,tag:String(input.tag||'Uploaded').trim()||'Uploaded',filename,buffer:Buffer.from(match[2],'base64')};
}

export class LocalMediaStore{
  constructor({directory,publicPrefix='/uploads'}={}){
    this.directory=path.resolve(directory||path.join(process.cwd(),'server','uploads'));
    this.publicPrefix=publicPrefix.replace(/\/$/,'');
    this.name='local';
  }
  async upload(input){
    const file=decodeImage(input);
    await mkdir(this.directory,{recursive:true});
    await writeFile(path.join(this.directory,file.filename),file.buffer);
    return {...file,storageKey:file.filename,url:`${this.publicPrefix}/${file.filename}`};
  }
}

export class GcsMediaStore{
  constructor({bucketName,publicBaseUrl,prefix='blog'}={}){
    this.bucketName=bucketName||process.env.GCS_BUCKET||'';
    if(!this.bucketName)throw new Error('GCS_BUCKET is required for Google Cloud Storage media.');
    this.publicBaseUrl=(publicBaseUrl||process.env.GCS_PUBLIC_BASE_URL||`https://storage.googleapis.com/${this.bucketName}`).replace(/\/$/,'');
    this.prefix=String(prefix||process.env.GCS_PREFIX||'blog').replace(/^\/+|\/+$/g,'');
    const {Storage}=require('@google-cloud/storage');
    this.storage=new Storage();
    this.bucket=this.storage.bucket(this.bucketName);
    this.name='gcs';
  }
  async upload(input){
    const file=decodeImage(input);
    const key=`${this.prefix}/${new Date().toISOString().slice(0,10)}/${file.filename}`;
    const object=this.bucket.file(key);
    await object.save(file.buffer,{contentType:file.mimeType,resumable:false,metadata:{cacheControl:'public, max-age=31536000, immutable'}});
    return {...file,storageKey:key,url:`${this.publicBaseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`};
  }
}

export function createMediaStore(options={}){
  const backend=(options.backend||process.env.CMS_MEDIA_BACKEND||(process.env.GCS_BUCKET?'gcs':'local')).toLowerCase();
  if(backend==='gcs')return new GcsMediaStore(options);
  return new LocalMediaStore(options);
}
