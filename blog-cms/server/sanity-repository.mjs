import {createClient} from '@sanity/client';
import {normalizeArticle,slugify,validateEditorialArticle} from './validation.mjs';

function textToPortableText(text=''){
  const stamp=Date.now();
  return String(text).split(/\n\n+/).map((paragraph,index)=>({
    _key:`p${index}-${stamp}`,
    _type:'block',
    style:'normal',
    markDefs:[],
    children:[{_key:`s${index}-${stamp}`,_type:'span',marks:[],text:paragraph.trim()}]
  })).filter(block=>block.children[0].text);
}

function portableTextToText(blocks=[]){
  return (Array.isArray(blocks)?blocks:[]).filter(block=>block?._type==='block').map(block=>(block.children||[]).map(span=>span.text||'').join('')).join('\n\n');
}

const PROJECTION=`_id,title,"slug":slug.current,excerpt,body,editorialStatus,scheduledAt,featured,clinicalReviewRequired,clinicalReviewStatus,publishedAt,updatedAt,"category":category->title,"author":author->name,"coverImage":{"assetId":coverImage.asset._ref,"url":coverImage.asset->url,"alt":coverImage.alt},seoTitle,seoDescription`;

export class SanityRepository{
  constructor(){
    const projectId=process.env.SANITY_PROJECT_ID;
    const dataset=process.env.SANITY_DATASET||'production';
    const token=process.env.SANITY_WRITE_TOKEN||process.env.SANITY_READ_TOKEN;
    if(!projectId)throw new Error('SANITY_PROJECT_ID is required when CMS_BACKEND=sanity.');
    if(!token)throw new Error('SANITY_WRITE_TOKEN is required when CMS_BACKEND=sanity.');
    this.backendName='sanity';
    this.client=createClient({projectId,dataset,apiVersion:process.env.SANITY_API_VERSION||'2026-09-01',token,useCdn:false,perspective:'published'});
  }
  async health(){await this.client.fetch('count(*[0...1])');return {ok:true,backend:this.backendName};}
  async listArticles(){const docs=await this.client.fetch(`*[_type=="article"]|order(_updatedAt desc){${PROJECTION}}`);return docs.map(doc=>this.#normalizeDoc(doc));}
  async getArticle(id){const doc=await this.client.fetch(`*[_type=="article"&&_id==$id][0]{${PROJECTION}}`,{id});return doc?this.#normalizeDoc(doc):null;}
  async listPublicArticles(){const docs=await this.client.fetch(`*[_type=="article"&&editorialStatus=="Published"&&defined(publishedAt)]|order(publishedAt desc){${PROJECTION}}`);return docs.map(doc=>this.#normalizeDoc(doc));}
  async getPublicArticleBySlug(slug){const doc=await this.client.fetch(`*[_type=="article"&&slug.current==$slug&&editorialStatus=="Published"&&defined(publishedAt)][0]{${PROJECTION}}`,{slug});return doc?this.#normalizeDoc(doc):null;}
  async saveArticle(input,id=''){
    const now=new Date().toISOString();
    const normalized=normalizeArticle({...input,id:id||input.id||''});
    const check=validateEditorialArticle(normalized,{forPublication:normalized.status==='Published'});
    if(!check.ok)throw Object.assign(new Error(check.errors.join(' ')),{statusCode:400,details:check.errors});
    const category=await this.#ensureCategory(check.article.category);
    const author=await this.#ensureAuthor(check.article.author);
    const documentId=id||check.article.id||`article.${check.article.slug}`;
    const existing=await this.getArticle(documentId);
    let publishedAt=check.article.publishedAt||existing?.publishedAt||'';
    if(check.article.status==='Published'&&!publishedAt)publishedAt=now;
    if(check.article.status!=='Published')publishedAt='';
    const doc={
      _id:documentId,_type:'article',title:check.article.title,slug:{_type:'slug',current:check.article.slug},excerpt:check.article.excerpt,
      editorialStatus:check.article.status,scheduledAt:check.article.status==='Scheduled'?check.article.scheduledAt||undefined:undefined,
      author:{_type:'reference',_ref:author._id},category:{_type:'reference',_ref:category._id},featured:check.article.featured,
      clinicalReviewRequired:check.article.clinicalReviewRequired,clinicalReviewStatus:check.article.clinicalReviewStatus,
      body:textToPortableText(check.article.bodyText),seoTitle:check.article.seoTitle,seoDescription:check.article.seoDescription,
      publishedAt:publishedAt||undefined,updatedAt:now,
    };
    if(check.article.coverImage.assetId)doc.coverImage={_type:'image',asset:{_type:'reference',_ref:check.article.coverImage.assetId},alt:check.article.coverImage.alt};
    else if(existing?.coverImage?.assetId)doc.coverImage={_type:'image',asset:{_type:'reference',_ref:existing.coverImage.assetId},alt:check.article.coverImage.alt||existing.coverImage.alt};
    await this.client.createOrReplace(doc);
    return this.getArticle(documentId);
  }
  async deleteArticle(id){await this.client.delete(id);return {ok:true};}
  async listCategories(){return this.client.fetch(`*[_type=="category"]|order(title asc){"id":_id,"name":title,"slug":slug.current}`);}
  async createCategory(name){const clean=String(name||'').trim();if(clean.length<2)throw Object.assign(new Error('Category name is too short.'),{statusCode:400});const slug=slugify(clean);const doc={_id:`category.${slug}`,_type:'category',title:clean,slug:{_type:'slug',current:slug}};await this.client.createIfNotExists(doc);return {id:doc._id,name:clean,slug};}
  async deleteCategory(id){const refs=await this.client.fetch('count(*[_type=="article"&&references($id)])',{id});if(refs)throw Object.assign(new Error('Move articles out of this category before deleting it.'),{statusCode:409});await this.client.delete(id);return {ok:true};}
  async listMedia(){
    return this.client.fetch(`*[_type=="mediaAsset"]|order(_createdAt desc)[0...100]{"id":image.asset._ref,"recordId":_id,"name":name,"mimeType":image.asset->mimeType,"url":image.asset->url,"alt":alt,"tag":coalesce(tag,"Uploaded")}`);
  }
  async uploadMedia(input={}){
    const match=String(input.dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);if(!match)throw Object.assign(new Error('A valid image upload is required.'),{statusCode:400});
    if(!match[1].startsWith('image/'))throw Object.assign(new Error('Only image uploads are supported.'),{statusCode:400});
    const alt=String(input.alt||'').trim();if(alt.length<3)throw Object.assign(new Error('Alternative text is required for editorial images.'),{statusCode:400});
    const asset=await this.client.assets.upload('image',Buffer.from(match[2],'base64'),{filename:String(input.name||'upload-image')});
    const name=String(input.name||asset.originalFilename||'Uploaded image').replace(/\.[^.]+$/,'');
    const tag=String(input.tag||'Uploaded').trim()||'Uploaded';
    const record=await this.client.create({_type:'mediaAsset',name,image:{_type:'image',asset:{_type:'reference',_ref:asset._id}},alt,tag});
    return {id:asset._id,recordId:record._id,name,mimeType:asset.mimeType,url:asset.url,alt,tag};
  }
  #normalizeDoc(doc){return normalizeArticle({id:doc._id,title:doc.title,slug:doc.slug,excerpt:doc.excerpt,bodyText:portableTextToText(doc.body),status:doc.editorialStatus||(doc.publishedAt?'Published':'Draft'),scheduledAt:doc.scheduledAt,category:doc.category,author:doc.author,featured:doc.featured,clinicalReviewRequired:doc.clinicalReviewRequired,clinicalReviewStatus:doc.clinicalReviewStatus,coverImage:doc.coverImage,publishedAt:doc.publishedAt,updatedAt:doc.updatedAt,seoTitle:doc.seoTitle,seoDescription:doc.seoDescription});}
  async #ensureCategory(name){const slug=slugify(name);const _id=`category.${slug}`;await this.client.createIfNotExists({_id,_type:'category',title:name,slug:{_type:'slug',current:slug}});return {_id};}
  async #ensureAuthor(name){const slug=slugify(name);const _id=`author.${slug}`;await this.client.createIfNotExists({_id,_type:'author',name,slug:{_type:'slug',current:slug},role:'TeleDoctorSA Editorial'});return {_id};}
}
