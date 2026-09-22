import {EDITORIAL_CATEGORIES} from '../config/editorial-categories.mjs';

export async function syncEditorialCategories(repo){
  const existing=await repo.listCategories();
  const known=new Set(existing.map(category=>category.slug));
  const created=[];

  for(const definition of EDITORIAL_CATEGORIES){
    if(known.has(definition.slug))continue;
    const category=await repo.createCategory(definition.name);
    created.push(category);
    known.add(definition.slug);
  }

  return {
    configured:EDITORIAL_CATEGORIES.length,
    created,
    categories:await repo.listCategories()
  };
}
