import {LocalRepository} from './local-repository.mjs';
import {SanityRepository} from './sanity-repository.mjs';

export function createRepository(){
  const mode=String(process.env.CMS_BACKEND||'').trim().toLowerCase();

  if(!mode){
    throw new Error('CMS_BACKEND is required. Use CMS_BACKEND=sanity for the connected prototype or CMS_BACKEND=local only for isolated local tests.');
  }

  if(mode==='sanity')return new SanityRepository();
  if(mode==='local')return new LocalRepository();

  throw new Error(`Unsupported CMS_BACKEND "${mode}". Expected "sanity" or "local".`);
}
