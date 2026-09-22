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

const PROJECTION=`_id,title,"slug":slug.current,excerpt,body,editorialStatus,scheduledAt,featured,clinicalReviewRequired,clinicalReviewStatus,publishedAt,updatedAt,"categoryId":category._ref,"category":category->title,"author":author->name,"coverImage":{"assetId":coverImage.asset._ref,"url":coverImage.asset->url,"alt":coverImage.alt},seoTitle,seoDescription`;

function conflict(message){
  return Object.assign(new Error(message),{statusCode:409});
}

export class SanityRepository{
  constructor(){
    const projectId=process.env.SANITY_PROJECT_ID||'glz6ptd8';
    const dataset=process.env.SANITY_DATASET||'staging';
    const readToken=process.env.SANITY_READ_TOKEN||'';
    const writeToken=process.env.SANITY_WRITE_TOKEN||'';
    this.projectId=projectId;
    this.dataset=dataset;
    this.writeEnabled=Boolean(writeToken);
    if(!projectId)throw new Error('SANITY_PROJECT_ID is required when CMS_BACKEND=sanity.');
    this.backendName='sanity';
    this.client=createClient({
      projectId,
      dataset,
      apiVersion:process.env.SANITY_API_VERSION||'2026-09-01',
      token:writeToken||readToken||undefined,
      useCdn:false,
      perspective:'published'
    });
  }

  async health(){
    const [categoryCount,articleCount,mediaCount]=await Promise.all([
      this.client.fetch('count(*[_type=="category"])'),
      this.client.fetch('count(*[_type=="article"])'),
      this.client.fetch('count(*[_type=="mediaAsset"])')
    ]);
    return {ok:true,backend:this.backendName,projectId:this.projectId,dataset:this.dataset,categoryCount,articleCount,mediaCount,writable:this.writeEnabled};
  }

  async listArticles(){
    const docs=await this.client.fetch(`*[_type=="article"]|order(_updatedAt desc){${PROJECTION}}`);
    return docs.map(doc=>this.#normalizeDoc(doc));
  }

  async getArticle(id){
    const doc=await this.client.fetch(`*[_type=="article"&&_id==$id][0]{${PROJECTION}}`,{id});
    return doc?this.#normalizeDoc(doc):null;
  }

  async listPublicArticles(){
    const docs=await this.client.fetch(`*[_type=="article"&&editorialStatus=="Published"&&defined(publishedAt)]|order(publishedAt desc){${PROJECTION}}`);
    return docs.map(doc=>this.#normalizeDoc(doc));
  }

  async getPublicArticleBySlug(slug){
    const doc=await this.client.fetch(`*[_type=="article"&&slug.current==$slug&&editorialStatus=="Published"&&defined(publishedAt)][0]{${PROJECTION}}`,{slug});
    return doc?this.#normalizeDoc(doc):null;
  }

  async saveArticle(input,id=''){
    this.#requireWriteAccess();
    const now=new Date().toISOString();
    const normalized=normalizeArticle({...input,id:id||input.id||''});
    const check=validateEditorialArticle(normalized,{forPublication:normalized.status==='Published'});
    if(!check.ok)throw Object.assign(new Error(check.errors.join(' ')),{statusCode:400,details:check.errors});

    const requestedId=id||check.article.id||'';
    const isCreate=!requestedId;
    const documentId=requestedId||`article-${check.article.slug}`;
    const slugOwner=await this.client.fetch(
      '*[_type=="article"&&slug.current==$slug][0]{_id,title}',
      {slug:check.article.slug}
    );

    if(slugOwner&&(isCreate||slugOwner._id!==documentId)){
      throw conflict('That URL slug is already in use.');
    }

    const [category,author,existing]=await Promise.all([
      this.#requireCategory(check.article.categoryId,check.article.category),
      this.#ensureAuthor(check.article.author),
      isCreate?Promise.resolve(null):this.getArticle(documentId)
    ]);

    let publishedAt=check.article.publishedAt||existing?.publishedAt||'';
    if(check.article.status==='Published'&&!publishedAt)publishedAt=now;
    if(check.article.status!=='Published')publishedAt='';

    const doc={
      _id:documentId,
      _type:'article',
      title:check.article.title,
      slug:{_type:'slug',current:check.article.slug},
      excerpt:check.article.excerpt,
      editorialStatus:check.article.status,
      scheduledAt:check.article.status==='Scheduled'?check.article.scheduledAt||undefined:undefined,
      author:{_type:'reference',_ref:author._id},
      category:{_type:'reference',_ref:category._id},
      featured:check.article.featured,
      clinicalReviewRequired:check.article.clinicalReviewRequired,
      clinicalReviewStatus:check.article.clinicalReviewStatus,
      body:textToPortableText(check.article.bodyText),
      seoTitle:check.article.seoTitle,
      seoDescription:check.article.seoDescription,
      publishedAt:publishedAt||undefined,
      updatedAt:now,
    };

    if(check.article.coverImage.assetId){
      doc.coverImage={_type:'image',asset:{_type:'reference',_ref:check.article.coverImage.assetId},alt:check.article.coverImage.alt};
    }else if(existing?.coverImage?.assetId){
      doc.coverImage={_type:'image',asset:{_type:'reference',_ref:existing.coverImage.assetId},alt:check.article.coverImage.alt||existing.coverImage.alt};
    }

    try{
      if(isCreate)await this.client.create(doc);
      else await this.client.createOrReplace(doc);
    }catch(error){
      if(error?.statusCode===409)throw conflict('That article already exists. Refresh the Studio before trying again.');
      throw error;
    }

    return this.getArticle(documentId);
  }

  async deleteArticle(id){
    this.#requireWriteAccess();
    await this.client.delete(id);
    return {ok:true};
  }

  async listCategories(){
    const docs=await this.client.fetch(`*[_type=="category"]|order(title asc){"id":_id,"name":title,"slug":slug.current}`);
    const seen=new Set();
    return docs.filter(category=>{
      const key=category.slug||slugify(category.name);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }

  async createCategory(name){
    this.#requireWriteAccess();
    const clean=String(name||'').trim();
    if(clean.length<2)throw Object.assign(new Error('Category name is too short.'),{statusCode:400});
    const slug=slugify(clean);
    const existing=await this.#findCategoryBySlug(slug);
    if(existing)return {id:existing._id,name:existing.title,slug:existing.slug?.current||slug};

    const doc={_id:`category-${slug}`,_type:'category',title:clean,slug:{_type:'slug',current:slug}};
    await this.client.createIfNotExists(doc);
    return {id:doc._id,name:clean,slug};
  }

  async deleteCategory(id){
    this.#requireWriteAccess();
    const refs=await this.client.fetch('count(*[_type=="article"&&references($id)])',{id});
    if(refs)throw Object.assign(new Error('Move articles out of this category before deleting it.'),{statusCode:409});
    await this.client.delete(id);
    return {ok:true};
  }

  async listMedia(){
    return this.client.fetch(`*[_type=="mediaAsset"]|order(_createdAt desc)[0...100]{"id":image.asset._ref,"recordId":_id,"name":name,"mimeType":image.asset->mimeType,"url":image.asset->url,"alt":alt,"tag":coalesce(tag,"Uploaded")}`);
  }

  async uploadMedia(input={}){
    this.#requireWriteAccess();
    const match=String(input.dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);
    if(!match)throw Object.assign(new Error('A valid image upload is required.'),{statusCode:400});
    if(!match[1].startsWith('image/'))throw Object.assign(new Error('Only image uploads are supported.'),{statusCode:400});
    const alt=String(input.alt||'').trim();
    if(alt.length<3)throw Object.assign(new Error('Alternative text is required for editorial images.'),{statusCode:400});

    const asset=await this.client.assets.upload('image',Buffer.from(match[2],'base64'),{filename:String(input.name||'upload-image')});
    const name=String(input.name||asset.originalFilename||'Uploaded image').replace(/\.[^.]+$/,'');
    const tag=String(input.tag||'Uploaded').trim()||'Uploaded';
    const record=await this.client.create({_type:'mediaAsset',name,image:{_type:'image',asset:{_type:'reference',_ref:asset._id}},alt,tag});
    return {id:asset._id,recordId:record._id,name,mimeType:asset.mimeType,url:asset.url,alt,tag};
  }

  #normalizeDoc(doc){
    return normalizeArticle({
      id:doc._id,
      title:doc.title,
      slug:doc.slug,
      excerpt:doc.excerpt,
      bodyText:portableTextToText(doc.body),
      status:doc.editorialStatus||(doc.publishedAt?'Published':'Draft'),
      scheduledAt:doc.scheduledAt,
      categoryId:doc.categoryId,
      category:doc.category,
      author:doc.author,
      featured:doc.featured,
      clinicalReviewRequired:doc.clinicalReviewRequired,
      clinicalReviewStatus:doc.clinicalReviewStatus,
      coverImage:doc.coverImage,
      publishedAt:doc.publishedAt,
      updatedAt:doc.updatedAt,
      seoTitle:doc.seoTitle,
      seoDescription:doc.seoDescription
    });
  }

  async #findCategoryBySlug(slug){
    return this.client.fetch(
      '*[_type=="category"&&slug.current==$slug][0]{_id,title,slug}',
      {slug}
    );
  }

  async #requireCategory(categoryId,name){
    let existing=null;

    if(categoryId){
      existing=await this.client.fetch(
        '*[_type=="category"&&_id==$id][0]{_id,title,"slug":slug.current}',
        {id:categoryId}
      );
    }

    if(!existing&&name){
      existing=await this.#findCategoryBySlug(slugify(name));
    }

    if(!existing){
      throw Object.assign(
        new Error('Choose a saved category before saving this article.'),
        {statusCode:400,details:['The selected category does not exist in the active Sanity dataset.']}
      );
    }

    return {_id:existing._id,title:existing.title};
  }

  async #ensureAuthor(name){
    const existing=await this.client.fetch('*[_type=="author"&&name==$name][0]{_id}',{name});
    if(existing)return {_id:existing._id};

    const slug=slugify(name);
    const _id=`author-${slug}`;
    await this.client.createIfNotExists({_id,_type:'author',name,role:'TeleDoctorSA Editorial'});
    return {_id};
  }

  #requireWriteAccess(){
    if(this.writeEnabled)return;
    throw Object.assign(
      new Error('Sanity write access is not configured. Set SANITY_WRITE_TOKEN for CMS mutations.'),
      {statusCode:503}
    );
  }
}
