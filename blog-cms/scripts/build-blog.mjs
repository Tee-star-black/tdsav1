import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import nunjucks from 'nunjucks';
import {validateArticles} from './validate-content.mjs';

const root=path.resolve(process.cwd());
const siteRoot=path.resolve(root,'..');
const contentFile=process.env.BLOG_CONTENT_FILE||path.join(root,'content','articles.json');
const outputDir=process.env.BLOG_OUTPUT_DIR||path.join(siteRoot,'blog');
const templatesDir=path.join(root,'templates');
const styleSource=path.join(root,'assets','blog.css');
const styleTargetDir=path.join(siteRoot,'styles');
const sitemapPath=path.join(siteRoot,'sitemap.xml');
const site={name:'TeleDoctorSA',baseUrl:'https://teledoctorsa.co.za'};

const raw=JSON.parse(await readFile(contentFile,'utf8'));
const input=Array.isArray(raw)?raw:raw.articles||[];
const checked=validateArticles(input);
const failures=checked.filter(result=>!result.ok);
if(failures.length){console.error('Blog build blocked by content validation.');console.error(JSON.stringify(failures,null,2));process.exit(1);}
const articles=checked.map(result=>{
  const article={...result.data,bodyParagraphs:result.data.bodyText.split(/\n\n+/).filter(Boolean)};
  article.schemaJson=JSON.stringify({
    '@context':'https://schema.org','@type':'Article',headline:article.title,description:article.seoDescription||article.excerpt,
    datePublished:article.publishedAt,dateModified:article.updatedAt||article.publishedAt,
    author:{'@type':'Person',name:article.author},publisher:{'@type':'Organization',name:'TeleDoctorSA',url:site.baseUrl},
    mainEntityOfPage:`${site.baseUrl}/blog/${article.slug}/`,image:article.coverImage.url
  }).replace(/</g,'\\u003c');
  return article;
}).sort((a,b)=>new Date(b.publishedAt||b.updatedAt)-new Date(a.publishedAt||a.updatedAt));

nunjucks.configure(templatesDir,{autoescape:true,noCache:true});
await mkdir(outputDir,{recursive:true});
await mkdir(styleTargetDir,{recursive:true});
await copyFile(styleSource,path.join(styleTargetDir,'blog.css'));

for(const article of articles){
  const dir=path.join(outputDir,article.slug);
  await mkdir(dir,{recursive:true});
  const html=nunjucks.render('article.njk',{article,site});
  await writeFile(path.join(dir,'index.html'),html,'utf8');
}

const indexHtml=nunjucks.render('index.njk',{articles,site,featured:articles.find(a=>a.featured)||articles[0]||null});
await writeFile(path.join(outputDir,'index.html'),indexHtml,'utf8');
const feed=articles.map(({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage})=>({title,slug,excerpt,category,author,publishedAt,updatedAt,featured,coverImage}));
await writeFile(path.join(outputDir,'search-index.json'),JSON.stringify(feed,null,2),'utf8');
await writeFile(path.join(outputDir,'feed.json'),JSON.stringify({generatedAt:new Date().toISOString(),articles:feed},null,2),'utf8');

const originalSitemap=await readFile(sitemapPath,'utf8');
const start='    <!-- BLOG_CMS_START -->';
const end='    <!-- BLOG_CMS_END -->';
const cleaned=originalSitemap.replace(new RegExp(`\\n?${start}[\\s\\S]*?${end}\\n?`,'m'),'\n');
const entries=[{loc:`${site.baseUrl}/blog/`,lastmod:new Date().toISOString().slice(0,10),changefreq:'weekly',priority:'0.8'},...articles.map(article=>({loc:`${site.baseUrl}/blog/${article.slug}/`,lastmod:String(article.updatedAt||article.publishedAt).slice(0,10),changefreq:'monthly',priority:'0.7'}))];
const xml=`${start}\n${entries.map(entry=>`    <url>\n        <loc>${entry.loc}</loc>\n        <lastmod>${entry.lastmod}</lastmod>\n        <changefreq>${entry.changefreq}</changefreq>\n        <priority>${entry.priority}</priority>\n    </url>`).join('\n\n')}\n${end}`;
await writeFile(sitemapPath,cleaned.replace(/\s*<\/urlset>\s*$/,`\n\n${xml}\n\n</urlset>\n`),'utf8');

console.log(`Built ${articles.length} blog article(s), feed, stylesheet and sitemap entries.`);
