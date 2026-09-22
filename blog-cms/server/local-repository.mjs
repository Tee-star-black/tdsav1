import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeArticle,slugify,validateEditorialArticle} from './validation.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const seedPath=path.join(root,'data','seed.json');
const storePath=path.join(root,'data','store.local.json');
const uploadDir=path.join(root,'server','uploads');

async function ensureStore(){
  try{await readFile(storePath,'utf8');}catch{await copyFile(seedPath,storePath);}
  await mkdir(uploadDir,{recursive:true});
}

async function readStore(){await ensureStore();return JSON.parse(await readFile(storePath,'utf8'));}
async function writeStore(store){await writeFile(storePath,JSON.stringify(store,null,2),'utf8');return store;}

export class LocalRepository{
  constructor(){this.backendName='local';this.queue=Promise.resolve();}
  async health(){await ensureStore();return {ok:true,backend:this.backendName};}
  async listArticles(){const store=await readStore();return store.articles.map(article=>this.#withCategoryIdentity(store,article)).sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0));}
  async getArticle(id){const store=await readStore();const article=store.articles.find(a=>a.id===id);return article?this.#withCategoryIdentity(store,article):null;}
  async getPublicArticleBySlug(slug){const store=await readStore();const article=store.articles.find(a=>a.slug===slug&&a.status==='Published');return article?this.#withCategoryIdentity(store,article):null;}
  async listPublicArticles(){const store=await readStore();return store.articles.filter(a=>a.status==='Published').map(article=>this.#withCategoryIdentity(store,article)).sort((a,b)=>new Date(b.publishedAt||b.updatedAt||0)-new Date(a.publishedAt||a.updatedAt||0));}
  async saveArticle(input,id=''){
    return this.#mutate(async store=>{
      const now=new Date().toISOString();
      const base=normalizeArticle({...input,id:id||input.id||`article-${Date.now()}`,updatedAt:now});
      const category=store.categories.find(c=>c.id===base.categoryId)||(base.category?store.categories.find(c=>c.name===base.category):null);
      if(!category)throw Object.assign(new Error('Choose a saved category before saving this article.'),{statusCode:400,details:['The selected category does not exist in the active repository.']});
      base.categoryId=category.id;
      base.category=category.name;
      const duplicate=store.articles.find(a=>a.slug===base.slug&&a.id!==base.id);
      if(duplicate)throw Object.assign(new Error('That URL slug is already in use.'),{statusCode:409});
      const check=validateEditorialArticle(base,{forPublication:base.status==='Published'});
      if(!check.ok)throw Object.assign(new Error(check.errors.join(' ')),{statusCode:400,details:check.errors});
      const existing=store.articles.find(a=>a.id===base.id);
      const article={...existing,...check.article,updatedAt:now};
      if(article.status==='Published')article.publishedAt=article.publishedAt||existing?.publishedAt||now;else article.publishedAt='';
      if(article.status!=='Scheduled')article.scheduledAt='';
      const index=store.articles.findIndex(a=>a.id===article.id);
      if(index>=0)store.articles[index]=article;else store.articles.unshift(article);
      return {store,value:article};
    });
  }
  async deleteArticle(id){
    return this.#mutate(async store=>{const before=store.articles.length;store.articles=store.articles.filter(a=>a.id!==id);if(store.articles.length===before)throw Object.assign(new Error('Article not found.'),{statusCode:404});return {store,value:{ok:true}};});
  }
  async listCategories(){const store=await readStore();return store.categories;}
  async createCategory(input){
    return this.#mutate(async store=>{
      const definition=typeof input==='string'?{name:input}:input||{};
      const clean=String(definition.name||'').trim();
      if(clean.length<2)throw Object.assign(new Error('Category name is too short.'),{statusCode:400});
      const slug=slugify(definition.slug||clean);
      const description=String(definition.description||'').trim();
      const existing=store.categories.find(c=>c.slug===slug);
      if(existing){
        if(typeof input!=='string'){
          existing.name=clean;
          existing.slug=slug;
          if(description)existing.description=description;
        }
        return {store,value:existing};
      }
      const category={id:`cat-${slug}`,name:clean,slug,...(description?{description}:{})};
      store.categories.push(category);
      return {store,value:category};
    });
  }
  async deleteCategory(id){
    return this.#mutate(async store=>{const category=store.categories.find(c=>c.id===id);if(!category)throw Object.assign(new Error('Category not found.'),{statusCode:404});if(store.articles.some(a=>a.categoryId===category.id||a.category===category.name))throw Object.assign(new Error('Move articles out of this category before deleting it.'),{statusCode:409});store.categories=store.categories.filter(c=>c.id!==id);return {store,value:{ok:true}};});
  }
  async listMedia(){const store=await readStore();return store.media;}
  async uploadMedia(input={}){
    return this.#mutate(async store=>{
      const name=String(input.name||'upload').replace(/[^a-zA-Z0-9._-]/g,'-');
      const match=String(input.dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);
      if(!match)throw Object.assign(new Error('A valid image upload is required.'),{statusCode:400});
      const mimeType=match[1];if(!mimeType.startsWith('image/'))throw Object.assign(new Error('Only image uploads are supported in this editor.'),{statusCode:400});
      const ext=mimeType.split('/')[1].replace('jpeg','jpg').replace(/[^a-z0-9]/g,'')||'img';
      const filename=`${Date.now()}-${path.parse(name).name}.${ext}`;
      await writeFile(path.join(uploadDir,filename),Buffer.from(match[2],'base64'));
      const media={id:`media-${Date.now()}`,name:path.parse(name).name||'Uploaded image',mimeType,url:`/uploads/${filename}`,alt:String(input.alt||'').trim(),tag:String(input.tag||'Uploaded').trim()||'Uploaded'};
      store.media.unshift(media);return {store,value:media};
    });
  }
  #withCategoryIdentity(store,article){
    const category=store.categories.find(c=>c.id===article.categoryId)||store.categories.find(c=>c.name===article.category);
    return {...article,categoryId:category?.id||article.categoryId||'',category:category?.name||article.category||''};
  }
  async #mutate(fn){
    let output;
    const operation=this.queue.catch(()=>undefined).then(async()=>{
      const store=await readStore();
      const result=await fn(store);
      await writeStore(result.store);
      output=result.value;
    });
    this.queue=operation.then(()=>undefined,()=>undefined);
    await operation;
    return output;
  }
}
