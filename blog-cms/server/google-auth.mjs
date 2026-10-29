import {randomBytes,timingSafeEqual} from 'node:crypto';
import {OAuth2Client} from 'google-auth-library';

const INVALID_CREDENTIAL='Google sign-in could not be verified.';
const INVALID_STATE='Google sign-in expired. Reload the page and try again.';
const MAX_TOKEN_SIZE=16000;

function rejected(message,statusCode=401){
  return Object.assign(new Error(message),{statusCode});
}
function cookieValue(header,name){
  for(const pair of String(header||'').split(';')){
    const split=pair.indexOf('=');
    if(split>=0&&pair.slice(0,split).trim()===name){
      try{return decodeURIComponent(pair.slice(split+1).trim());}catch{return '';}
    }
  }
  return '';
}
function equalString(a,b){
  if(typeof a!=='string'||typeof b!=='string'||!a||!b||a.length>512||b.length>512)return false;
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length&&timingSafeEqual(x,y);
}

/**
 * Google Workspace sign-in is opt-in. It NEVER creates a CMS staff account.
 * A staff member must be registered by a CMS admin and must prove ownership
 * of a Google Workspace account in the explicitly configured hosted domain.
 */
export function createGoogleStaffLogin({
  clientId=process.env.CMS_GOOGLE_CLIENT_ID,
  workspaceDomain=process.env.CMS_GOOGLE_WORKSPACE_DOMAIN,
  secure=String(process.env.CMS_COOKIE_SECURE||'').toLowerCase()==='true',
  verifier=null
}={}){
  const id=String(clientId||'').trim();
  const domain=String(workspaceDomain||'').trim().toLowerCase();
  const validId=/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(id);
  const validDomain=/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain);
  const enabled=validId&&validDomain;
  const cookieName=secure?'__Host-tdsa_cms_google_state':'tdsa_cms_google_state';
  const googleClient=enabled?(verifier||new OAuth2Client(id)):null;
  const stateCookie=(value,age)=>[
    cookieName+'='+encodeURIComponent(value),
    'Path=/','HttpOnly','SameSite=Strict',
    'Max-Age='+age,...(secure?['Secure']:[])
  ].join('; ');

  return {
    enabled,
    workspaceDomain:enabled?domain:'',
    config(){
      if(!enabled)return {enabled:false};
      const csrfToken=randomBytes(32).toString('base64url');
      return {
        enabled:true,
        clientId:id,
        csrfToken,
        cookie:stateCookie(csrfToken,300)
      };
    },
    clearStateCookie(){return stateCookie('',0);},
    async verify({credential,csrfToken}={},req={}){
      if(!enabled)throw rejected('Google sign-in is not enabled.',404);
      if(!equalString(cookieValue(req?.headers?.cookie,cookieName),csrfToken))
        throw rejected(INVALID_STATE,403);
      if(typeof credential!=='string'||credential.length<32||credential.length>MAX_TOKEN_SIZE)
        throw rejected(INVALID_CREDENTIAL);

      let claims;
      try{
        const ticket=await googleClient.verifyIdToken({idToken:credential,audience:id});
        claims=ticket?.getPayload();
      }catch{
        throw rejected(INVALID_CREDENTIAL);
      }
      const email=String(claims?.email||'').trim().toLowerCase();
      if(!claims||!claims.sub||
        !['accounts.google.com','https://accounts.google.com'].includes(claims.iss)||
        claims.aud!==id||claims.email_verified!==true||
        String(claims.hd||'').toLowerCase()!==domain||
        !email.endsWith('@'+domain)||
        !equalString(claims.nonce,csrfToken)){
        throw rejected('This Google Workspace identity is not authorised.',403);
      }
      // Email is used for initial allowlisted account lookup only.
      // The immutable Google subject is bound to that CMS user on first login.
      return {email,googleSub:String(claims.sub)};
    }
  };
}
