// Never bootstrap an unauthenticated administrator in a deployed CMS.
export function canUseLocalDevelopmentAdmin({environment,hasUsers,accessToken}={}){
  return environment!=='production'&&hasUsers===false&&!accessToken;
}
