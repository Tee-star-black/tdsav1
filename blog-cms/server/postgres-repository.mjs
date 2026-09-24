import {randomUUID} from 'node:crypto';
import {getPgPool} from './postgres.mjs';
import {createMediaStore} from './media-store.mjs';
import {normalizeArticle,slugify,validateEditorialArticle} from './validation.mjs';

function iso(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toISOString();}
function mapArticle(row){
  if(!row)return null;
  return normalizeArticle({
    id:row.id,revision:row.revision,title:row.title,slug:row.slug,excerpt:row.excerpt,bodyText:row.body_text,
    status:row.editorial_status,category:row.category_name||'',author:row.author_name,featured:row.featured,
    clinicalReviewRequired:row.clinical_review_required,clinicalReviewStatus:row.clinical_review_status,
    coverImage:{assetId:row.cover_media_id||'',url:row.cover_url||'',alt:row.cover_alt||''},
    scheduledAt:iso(row.scheduled_at),publishedAt:iso(row.published_at),updatedAt:iso(row.updated_at),
    seoTitle:row.seo_title,seoDescription:row.seo_description
  });
}
const ARTICLE_SELECT=`SELECT a.*,c.name AS category_name
FROM cms_articles a LEFT JOIN cms_categories c ON c.id=a.category_id`;

export class PostgresRepository{
  constructor({pool,mediaStore}={}){
    this.pool=pool||getPgPool();
    this.mediaStore=mediaStore||createMediaStore();
    this.backendName='postgres';
  }

  async health(){
    const [categoryCount,articleCount,mediaCount]=await Promise.all([
      this.pool.query('SELECT COUNT(*)::int AS count FROM cms_categories'),
      this.pool.query('SELECT COUNT(*)::int AS count FROM cms_articles'),
      this.pool.query('SELECT COUNT(*)::int AS count FROM cms_media')
    ]);
    return {ok:true,backend:this.backendName,categoryCount:categoryCount.rows[0].count,articleCount:articleCount.rows[0].count,mediaCount:mediaCount.rows[0].count,mediaBackend:this.mediaStore.name};
  }

  async listArticles(){const r=await this.pool.query(`${ARTICLE_SELECT} ORDER BY a.updated_at DESC`);return r.rows.map(mapArticle);}
  async getArticle(id){const r=await this.pool.query(`${ARTICLE_SELECT} WHERE a.id=$1 LIMIT 1`,[id]);return mapArticle(r.rows[0]);}
  async getPublicArticleBySlug(slug){const r=await this.pool.query(`${ARTICLE_SELECT} WHERE a.slug=$1 AND a.editorial_status='Published' AND a.published_at IS NOT NULL LIMIT 1`,[slug]);return mapArticle(r.rows[0]);}
  async listPublicArticles(){const r=await this.pool.query(`${ARTICLE_SELECT} WHERE a.editorial_status='Published' AND a.published_at IS NOT NULL ORDER BY a.published_at DESC,a.updated_at DESC`);return r.rows.map(mapArticle);}

  async saveArticle(input,id=''){
    const article=normalizeArticle({...input,id:id||input.id||''});
    const check=validateEditorialArticle(article,{forPublication:article.status==='Published'});
    if(!check.ok)throw Object.assign(new Error(check.errors.join(' ')),{statusCode:400,details:check.errors});
    const client=await this.pool.connect();
    try{
      await client.query('BEGIN');
      let existing=null;
      if(id){
        const current=await client.query(`${ARTICLE_SELECT} WHERE a.id=$1 FOR UPDATE`,[id]);
        existing=mapArticle(current.rows[0]);
        if(!existing)throw Object.assign(new Error('Article not found.'),{statusCode:404});
        if(String(input.revision||'')!==String(existing.revision||''))throw Object.assign(new Error('This article changed since you opened it. Reopen the latest version before saving.'),{statusCode:409});
      }

      const slugOwner=await client.query('SELECT id FROM cms_articles WHERE slug=$1 AND id<>$2 LIMIT 1',[check.article.slug,id||'']);
      if(slugOwner.rowCount)throw Object.assign(new Error('That URL slug is already in use.'),{statusCode:409});

      let categoryId=null;
      if(check.article.category){
        const category=await client.query('SELECT id FROM cms_categories WHERE name=$1 LIMIT 1',[check.article.category]);
        if(!category.rowCount)throw Object.assign(new Error('Choose an existing category.'),{statusCode:400});
        categoryId=category.rows[0].id;
      }

      let coverMediaId=check.article.coverImage.assetId||null;
      let coverUrl=check.article.coverImage.url||'';
      let coverAlt=check.article.coverImage.alt||'';
      if(coverMediaId){
        const media=await client.query('SELECT id,url,alt FROM cms_media WHERE id=$1 LIMIT 1',[coverMediaId]);
        if(media.rowCount){coverUrl=media.rows[0].url;coverAlt=coverAlt||media.rows[0].alt;}
        else if(!coverUrl)throw Object.assign(new Error('Choose a cover image from the media library.'),{statusCode:400});
      }

      const now=new Date().toISOString();
      const articleId=id||`article-${randomUUID()}`;
      const revision=randomUUID();
      const publishedAt=check.article.status==='Published'?(existing?.publishedAt||check.article.publishedAt||now):null;
      const scheduledAt=check.article.status==='Scheduled'?check.article.scheduledAt:null;
      const values=[
        articleId,revision,check.article.title,check.article.slug,check.article.excerpt,check.article.bodyText,check.article.status,categoryId,
        check.article.author,check.article.featured,check.article.clinicalReviewRequired,check.article.clinicalReviewStatus,coverMediaId,coverUrl,coverAlt,
        scheduledAt,publishedAt,now,check.article.seoTitle,check.article.seoDescription
      ];

      if(existing){
        await client.query(`INSERT INTO cms_article_revisions(id,article_id,revision,snapshot_json,created_by) VALUES($1,$2,$3,$4::jsonb,$5)`,
          [randomUUID(),existing.id,existing.revision,JSON.stringify(existing),String(input.actorUserId||'')||null]);
        await client.query(`UPDATE cms_articles SET revision=$2,title=$3,slug=$4,excerpt=$5,body_text=$6,editorial_status=$7,category_id=$8,author_name=$9,
          featured=$10,clinical_review_required=$11,clinical_review_status=$12,cover_media_id=$13,cover_url=$14,cover_alt=$15,scheduled_at=$16,published_at=$17,
          updated_at=$18,seo_title=$19,seo_description=$20 WHERE id=$1`,values);
      }else{
        await client.query(`INSERT INTO cms_articles(id,revision,title,slug,excerpt,body_text,editorial_status,category_id,author_name,featured,
          clinical_review_required,clinical_review_status,cover_media_id,cover_url,cover_alt,scheduled_at,published_at,updated_at,seo_title,seo_description)
          VALUES(${values.map((_,i)=>'$'+(i+1)).join(',')})`,values);
      }
      await client.query('COMMIT');
      return await this.getArticle(articleId);
    }catch(error){
      await client.query('ROLLBACK').catch(()=>{});
      if(error?.code==='23505')throw Object.assign(new Error('That URL slug is already in use.'),{statusCode:409});
      throw error;
    }finally{client.release();}
  }

  async deleteArticle(id){const r=await this.pool.query('DELETE FROM cms_articles WHERE id=$1',[id]);if(!r.rowCount)throw Object.assign(new Error('Article not found.'),{statusCode:404});return {ok:true};}

  async listCategories(){const r=await this.pool.query('SELECT id,name,slug FROM cms_categories ORDER BY name ASC');return r.rows;}
  async createCategory(name){
    const clean=String(name||'').trim();if(clean.length<2)throw Object.assign(new Error('Category name is too short.'),{statusCode:400});
    const slug=slugify(clean),id=`cat-${slug}-${randomUUID().slice(0,8)}`;
    try{const r=await this.pool.query('INSERT INTO cms_categories(id,name,slug) VALUES($1,$2,$3) RETURNING id,name,slug',[id,clean,slug]);return r.rows[0];}
    catch(error){if(error?.code==='23505')throw Object.assign(new Error('That category already exists.'),{statusCode:409});throw error;}
  }
  async deleteCategory(id){
    const used=await this.pool.query('SELECT 1 FROM cms_articles WHERE category_id=$1 LIMIT 1',[id]);
    if(used.rowCount)throw Object.assign(new Error('Move articles out of this category before deleting it.'),{statusCode:409});
    const r=await this.pool.query('DELETE FROM cms_categories WHERE id=$1',[id]);if(!r.rowCount)throw Object.assign(new Error('Category not found.'),{statusCode:404});return {ok:true};
  }

  async listMedia(){const r=await this.pool.query('SELECT id,name,mime_type AS "mimeType",url,alt,tag,storage_key AS "storageKey" FROM cms_media ORDER BY created_at DESC LIMIT 500');return r.rows;}
  async uploadMedia(input={}){
    const stored=await this.mediaStore.upload(input);
    const id=`media-${randomUUID()}`;
    const r=await this.pool.query('INSERT INTO cms_media(id,name,mime_type,url,alt,tag,storage_key) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,mime_type AS "mimeType",url,alt,tag,storage_key AS "storageKey"',
      [id,stored.name,stored.mimeType,stored.url,stored.alt,stored.tag,stored.storageKey||'']);
    return r.rows[0];
  }

  async recordAudit({actorUserId='',action,entityType,entityId='',metadata={}}={}){
    if(!action||!entityType)return;
    await this.pool.query('INSERT INTO cms_audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES($1,$2,$3,$4,$5,$6::jsonb)',
      [randomUUID(),actorUserId||null,action,entityType,entityId||null,JSON.stringify(metadata||{})]);
  }
}
