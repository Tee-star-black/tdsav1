import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {getPgPool} from './postgres.mjs';

function cleanEmail(value){return String(value||'').trim().toLowerCase();}
function publicUser(row){return row?{id:row.id,email:row.email,name:row.name,role:row.role,active:row.active!==false,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()}:null;}
function hashPassword(password,salt){return scryptSync(String(password),salt,64).toString('hex');}
function hashToken(token){return createHash('sha256').update(String(token)).digest('hex');}
function safeEqualHex(a,b){try{const x=Buffer.from(String(a),'hex'),y=Buffer.from(String(b),'hex');return x.length===y.length&&x.length>0&&timingSafeEqual(x,y);}catch{return false;}}
function cookieValue(header,name){for(const pair of String(header||'').split(';')){const i=pair.indexOf('=');if(i>=0&&pair.slice(0,i).trim()===name)return decodeURIComponent(pair.slice(i+1).trim());}return '';}

export class PostgresAuthStore{
  constructor({pool,sessionHours=12,cookieSecure=false}={}){
    this.pool=pool||getPgPool();this.sessionHours=Math.max(1,Number(sessionHours)||12);this.cookieSecure=Boolean(cookieSecure);this.cookieName='tdsa_cms_session';this.backendName='postgres';
  }
  async hasUsers(){const r=await this.pool.query('SELECT EXISTS(SELECT 1 FROM cms_users WHERE active=TRUE) AS exists');return Boolean(r.rows[0]?.exists);}
  async listUsers(){const r=await this.pool.query('SELECT id,email,name,role,active,created_at,updated_at FROM cms_users ORDER BY name ASC');return r.rows.map(publicUser);}
  async createUser({email,name,role='editor',password}={}){
    const clean=cleanEmail(email),display=String(name||'').trim(),allowed=new Set(['admin','editor','reviewer']);
    if(!/^\S+@\S+\.\S+$/.test(clean))throw Object.assign(new Error('Enter a valid email address.'),{statusCode:400});
    if(display.length<2)throw Object.assign(new Error('Enter the staff member name.'),{statusCode:400});
    if(!allowed.has(role))throw Object.assign(new Error('Choose a valid staff role.'),{statusCode:400});
    const chosen=String(password||randomBytes(12).toString('base64url'));if(chosen.length<10)throw Object.assign(new Error('Password must be at least 10 characters.'),{statusCode:400});
    const id=randomUUID(),salt=randomBytes(16).toString('hex'),hash=hashPassword(chosen,salt);
    try{
      const r=await this.pool.query('INSERT INTO cms_users(id,email,name,role,password_salt,password_hash) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,email,name,role,active,created_at,updated_at',[id,clean,display,role,salt,hash]);
      return {user:publicUser(r.rows[0]),temporaryPassword:password?null:chosen};
    }catch(error){if(error?.code==='23505')throw Object.assign(new Error('A user with that email already exists.'),{statusCode:409});throw error;}
  }
  async deleteUser(id,currentUserId=''){
    if(id===currentUserId)throw Object.assign(new Error('You cannot delete your own account while signed in.'),{statusCode:409});
    const client=await this.pool.connect();
    try{
      await client.query('BEGIN');
      const target=(await client.query('SELECT id,role FROM cms_users WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(!target)throw Object.assign(new Error('User not found.'),{statusCode:404});
      if(target.role==='admin'){const r=await client.query("SELECT COUNT(*)::int AS count FROM cms_users WHERE active=TRUE AND role='admin'");if(r.rows[0].count<=1)throw Object.assign(new Error('At least one administrator must remain.'),{statusCode:409});}
      await client.query('DELETE FROM cms_users WHERE id=$1',[id]);
      await client.query('COMMIT');return {ok:true};
    }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
  }
  async resetPassword(id){
    const user=(await this.pool.query('SELECT * FROM cms_users WHERE id=$1 AND active=TRUE LIMIT 1',[id])).rows[0];
    if(!user)throw Object.assign(new Error('User not found.'),{statusCode:404});
    const temporaryPassword=randomBytes(12).toString('base64url'),salt=randomBytes(16).toString('hex');
    const updated=(await this.pool.query('UPDATE cms_users SET password_salt=$2,password_hash=$3,updated_at=NOW() WHERE id=$1 RETURNING *',[id,salt,hashPassword(temporaryPassword,salt)])).rows[0];
    await this.pool.query('DELETE FROM cms_sessions WHERE user_id=$1',[id]);
    return {user:publicUser(updated),temporaryPassword};
  }
  async authenticate(email,password){
    const r=await this.pool.query('SELECT * FROM cms_users WHERE email=$1 AND active=TRUE LIMIT 1',[cleanEmail(email)]),row=r.rows[0];
    if(!row||!safeEqualHex(hashPassword(password,row.password_salt),row.password_hash))return null;return publicUser(row);
  }
  async createSession(userId){
    const user=(await this.pool.query('SELECT * FROM cms_users WHERE id=$1 AND active=TRUE LIMIT 1',[userId])).rows[0];
    if(!user)throw Object.assign(new Error('User account is unavailable.'),{statusCode:401});
    const token=randomBytes(32).toString('base64url'),now=Date.now(),expires=new Date(now+this.sessionHours*3600000);
    await this.pool.query('DELETE FROM cms_sessions WHERE expires_at<=NOW() OR user_id=$1',[userId]);
    await this.pool.query('INSERT INTO cms_sessions(id,user_id,token_hash,created_at,expires_at) VALUES($1,$2,$3,$4,$5)',[randomUUID(),userId,hashToken(token),new Date(now),expires]);
    return {token,user:publicUser(user),expiresAt:expires.toISOString()};
  }
  async sessionUserFromRequest(req){
    const token=cookieValue(req?.headers?.cookie,this.cookieName);if(!token)return null;
    const r=await this.pool.query(`SELECT u.* FROM cms_sessions s JOIN cms_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND u.active=TRUE LIMIT 1`,[hashToken(token)]);
    return publicUser(r.rows[0]);
  }
  async destroySessionFromRequest(req){const token=cookieValue(req?.headers?.cookie,this.cookieName);if(token)await this.pool.query('DELETE FROM cms_sessions WHERE token_hash=$1',[hashToken(token)]);}
  async changePassword(userId,currentPassword,newPassword){
    const chosen=String(newPassword||'');if(chosen.length<10)throw Object.assign(new Error('New password must be at least 10 characters.'),{statusCode:400});
    const row=(await this.pool.query('SELECT * FROM cms_users WHERE id=$1 AND active=TRUE LIMIT 1',[userId])).rows[0];
    if(!row)throw Object.assign(new Error('User account is unavailable.'),{statusCode:404});
    if(!safeEqualHex(hashPassword(currentPassword,row.password_salt),row.password_hash))throw Object.assign(new Error('Current password is incorrect.'),{statusCode:401});
    const salt=randomBytes(16).toString('hex');
    await this.pool.query('UPDATE cms_users SET password_salt=$2,password_hash=$3,updated_at=NOW() WHERE id=$1',[userId,salt,hashPassword(chosen,salt)]);
    await this.pool.query('DELETE FROM cms_sessions WHERE user_id=$1',[userId]);return {ok:true};
  }
  sessionCookie(token,maxAgeSeconds){const p=[`${this.cookieName}=${encodeURIComponent(token)}`,'Path=/','HttpOnly','SameSite=Lax',`Max-Age=${Math.max(0,Math.floor(maxAgeSeconds))}`];if(this.cookieSecure)p.push('Secure');return p.join('; ');}
  clearCookie(){return this.sessionCookie('',0);}
}
