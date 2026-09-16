import {LocalRepository} from './local-repository.mjs';
import {SanityRepository} from './sanity-repository.mjs';

export function createRepository(){
  const mode=(process.env.CMS_BACKEND||'local').toLowerCase();
  if(mode==='sanity')return new SanityRepository();
  return new LocalRepository();
}
