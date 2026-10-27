// A Sanity article can reference an image asset that was never registered in
// the Sanity media library. Ensure every imported cover becomes a GCS media
// record so the finished CMS can stop depending on Sanity's CDN.
export async function ensureArticleCoverInStorage(article,{mediaMap,existingMedia,target,fetchImage=fetch}){
  const cover=article?.coverImage||{};
  const mapped=cover.assetId?mediaMap.get(cover.assetId):null;
  if(mapped)return mapped;
  if(!cover.url)return null;

  const name=`cover-${article.slug}`;
  const alt=cover.alt||article.title||'Article cover image';
  let existing=existingMedia.find(item=>item.name===name&&item.alt===alt);

  if(!existing){
    const response=await fetchImage(cover.url);
    if(!response.ok)throw new Error(`Could not download article cover for ${article.slug}: HTTP ${response.status}`);
    const mimeType=String(response.headers.get('content-type')||'image/jpeg').split(';')[0].trim().toLowerCase();
    if(!mimeType.startsWith('image/'))throw new Error(`Article cover ${article.slug} did not return an image content type.`);
    const dataUrl=`data:${mimeType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
    existing=await target.uploadMedia({name,alt,tag:'Article cover',dataUrl});
    existingMedia.push(existing);
  }

  if(cover.assetId)mediaMap.set(cover.assetId,existing);
  return existing;
}
