import {EDITORIAL_CATEGORIES} from '../config/editorial-categories.mjs';

const seen=new Set();
for(const category of EDITORIAL_CATEGORIES){
  if(!category.name?.trim())throw new Error('Every editorial category needs a name.');
  if(!category.slug?.trim())throw new Error(`Category "${category.name}" needs a slug.`);
  if(seen.has(category.slug))throw new Error(`Duplicate editorial category slug: ${category.slug}`);
  seen.add(category.slug);
}

console.log(`Editorial category catalogue ready: ${EDITORIAL_CATEGORIES.length} categories defined in code.`);
console.log('Sanity category records are created automatically when an article uses a code-defined category.');
for(const category of [...EDITORIAL_CATEGORIES].sort((a,b)=>a.name.localeCompare(b.name))){
  console.log(`- ${category.name} [${category.slug}]`);
}
