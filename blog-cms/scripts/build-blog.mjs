import {mkdir,readFile,writeFile} from 'node:fs/promises'
import path from 'node:path'
import nunjucks from 'nunjucks'
import {validateArticles} from './validate-content.mjs'

const root=path.resolve(process.cwd())
const contentFile=process.env.BLOG_CONTENT_FILE||path.join(root,'content','articles.json')
const outputDir=process.env.BLOG_OUTPUT_DIR||path.resolve(root,'..','blog')
const templatesDir=path.join(root,'templates')

const raw=JSON.parse(await readFile(contentFile,'utf8'))
const input=Array.isArray(raw)?raw:raw.articles||[]
const checked=validateArticles(input)
const failures=checked.filter(result=>!result.ok)
if(failures.length){console.error('Blog build blocked by content validation.');console.error(JSON.stringify(failures,null,2));process.exit(1)}
const articles=checked.map(result=>result.data).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt))

nunjucks.configure(templatesDir,{autoescape:true,noCache:true})
await mkdir(outputDir,{recursive:true})

for(const article of articles){
 const dir=path.join(outputDir,article.slug)
 await mkdir(dir,{recursive:true})
 const html=nunjucks.render('article.njk',{article,site:{name:'TeleDoctorSA',baseUrl:'https://teledoctorsa.co.za'}})
 await writeFile(path.join(dir,'index.html'),html,'utf8')
}

const indexHtml=nunjucks.render('index.njk',{articles,site:{name:'TeleDoctorSA',baseUrl:'https://teledoctorsa.co.za'}})
await writeFile(path.join(outputDir,'index.html'),indexHtml,'utf8')
await writeFile(path.join(outputDir,'search-index.json'),JSON.stringify(articles.map(({title,slug,excerpt,category,author,publishedAt})=>({title,slug,excerpt,category:category.title,author:author.name,publishedAt})),null,2),'utf8')
console.log(`Built ${articles.length} blog article(s) into ${outputDir}`)
