import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';

const EMPTY={version:1,users:[],sessions:[]};

function cleanEmail(value){return String(value||'').trim().toLowerCase();}
function publicUser(user){return user?{id:user.id,email:user.email,name:user.name,role:user.role,active:user.active!==false,createdAt:user.createdAt,updatedAt:user.updatedAt}:null;}
function hashPassword(password,salt){return scryptSync(String(password),salt,64).toString('hex');}
function hashToken(token){return createHash('sha256').update(String(token)).digest('hex');}
function safeEqualHex(a,b){
  try{
    const left=Buffer.from(String(a),'hex'),right=Buffer.from(String(b),'hex');
    return left.length===right.length&&left.length>0&&timingSafeEqual(left,right);
  }catch{return false;}
}
function cookieValue(header,name){
  const source=String(header||'');
  for(const pair of source.split(';')){
    const index=pair.indexOf('=');
    if(index<0)continue;
    if(pair.slice(0,index).trim()===name)return decodeURIComponent(pair.slice(index+1).trim());
  }
  return '';
}

export class AuthStore{
  constructor({filePath,sessionHours=12,cookieSecure=false}={}){
    this.filePath=path.resolve(filePath||path.join(process.cwd(),'data','auth.local.json'));
    this.sessionHours=Math.max(1,Number(sessionHours)||12);
    this.cookieSecure=Boolean(cookieSecure);
    this.cookieName='tdsa_cms_session';
    this.writeQueue=Promise.resolve();
  }

  async #read(){
    try{
      const parsed=JSON.parse(await readFile(this.filePath,'utf8'));
      return {
        version:1,
        users:Array.isArray(parsed.users)?parsed.users:[],
        sessions:Array.isArray(parsed.sessions)?parsed.sessions:[]
      };
    }catch(error){
      if(error?.code==='ENOENT')return structuredClone(EMPTY);
      throw error;
    }
  }

  async #write(data){
    this.writeQueue=this.writeQueue.then(async()=>{
      await mkdir(path.dirname(this.filePath),{recursive:true});
      const temp=`${this.filePath}.tmp-${process.pid}-${Date.now()}`;
      await writeFile(temp,JSON.stringify(data,null,2),'utf8');
      await rename(temp,this.filePath);
    });
    return this.writeQueue;
  }

  async hasUsers(){
    const data=await this.#read();
    return data.users.some(user=>user.active!==false);
  }

  async listUsers(){
    const data=await this.#read();
    return data.users.map(publicUser).sort((a,b)=>a.name.localeCompare(b.name));
  }

  async updateUserRole(id,role,currentUserId=''){
    const allowed=new Set(['admin','editor','reviewer']);
    if(!allowed.has(role))throw Object.assign(new Error('Invalid staff role.'),{statusCode:400});
    const data=await this.#read();
    const user=data.users.find(item=>item.id===id);
    if(!user||user.active===false)throw Object.assign(new Error('Staff account not found.'),{statusCode:404});
    if(user.role===role)return publicUser(user);
    if(id===currentUserId)throw Object.assign(new Error('You cannot change your own administrator role.'),{statusCode:409});
    if(user.role==='admin'&&role!=='admin'&&data.users.filter(item=>item.active!==false&&item.role==='admin').length<=1)
      throw Object.assign(new Error('At least one active administrator must remain.'),{statusCode:409});
    user.role=role;user.updatedAt=new Date().toISOString();
    data.sessions=data.sessions.filter(session=>session.userId!==id);
    await this.#write(data);
    return publicUser(user);
  }

  async createUser({email,name,role='editor',password}={}){
    const clean=cleanEmail(email);
    const display=String(name||'').trim();
    const allowedRoles=new Set(['admin','editor','reviewer']);
    if(!/^\S+@\S+\.\S+$/.test(clean))throw Object.assign(new Error('Enter a valid email address.'),{statusCode:400});
    if(display.length<2)throw Object.assign(new Error('Enter the staff member name.'),{statusCode:400});
    if(!allowedRoles.has(role))throw Object.assign(new Error('Choose a valid staff role.'),{statusCode:400});
    const chosen=String(password||randomBytes(12).toString('base64url'));
    if(chosen.length<10)throw Object.assign(new Error('Password must be at least 10 characters.'),{statusCode:400});

    const data=await this.#read();
    if(data.users.some(user=>user.email===clean))throw Object.assign(new Error('A user with that email already exists.'),{statusCode:409});
    const now=new Date().toISOString(),salt=randomBytes(16).toString('hex');
    const user={id:randomUUID(),email:clean,name:display,role,passwordSalt:salt,passwordHash:hashPassword(chosen,salt),active:true,createdAt:now,updatedAt:now};
    data.users.push(user);
    await this.#write(data);
    return {user:publicUser(user),temporaryPassword:password?null:chosen};
  }

  async deleteUser(id,currentUserId=''){
    const data=await this.#read();
    const target=data.users.find(user=>user.id===id);
    if(!target)throw Object.assign(new Error('User not found.'),{statusCode:404});
    if(target.id===currentUserId)throw Object.assign(new Error('You cannot delete your own account while signed in.'),{statusCode:409});
    const activeAdmins=data.users.filter(user=>user.active!==false&&user.role==='admin');
    if(target.role==='admin'&&activeAdmins.length<=1)throw Object.assign(new Error('At least one administrator must remain.'),{statusCode:409});
    data.users=data.users.filter(user=>user.id!==id);
    data.sessions=data.sessions.filter(session=>session.userId!==id);
    await this.#write(data);
    return {ok:true};
  }

  async resetPassword(id){
    const data=await this.#read();
    const user=data.users.find(item=>item.id===id&&item.active!==false);
    if(!user)throw Object.assign(new Error('User not found.'),{statusCode:404});
    const temporaryPassword=randomBytes(12).toString('base64url');
    const salt=randomBytes(16).toString('hex');
    user.passwordSalt=salt;
    user.passwordHash=hashPassword(temporaryPassword,salt);
    user.updatedAt=new Date().toISOString();
    data.sessions=data.sessions.filter(session=>session.userId!==id);
    await this.#write(data);
    return {user:publicUser(user),temporaryPassword};
  }

  async findGoogleUser(email,googleSub){
    const clean=cleanEmail(email),sub=String(googleSub||'');
    if(!clean||!sub)return null;
    const data=await this.#read();
    const user=data.users.find(item=>item.email===clean&&item.active!==false);
    if(!user)return null;
    if(user.googleSub&&user.googleSub!==sub){
      throw Object.assign(new Error('This CMS account is linked to a different Google identity.'),{statusCode:403});
    }
    if(data.users.some(item=>item.id!==user.id&&item.googleSub===sub)){
      throw Object.assign(new Error('This Google identity is already linked to another CMS account.'),{statusCode:403});
    }
    if(!user.googleSub){
      user.googleSub=sub;
      user.updatedAt=new Date().toISOString();
      await this.#write(data);
    }
    return publicUser(user);
  }
  async authenticate(email,password){
    const data=await this.#read();
    const user=data.users.find(item=>item.email===cleanEmail(email)&&item.active!==false);
    if(!user)return null;
    const candidate=hashPassword(password,user.passwordSalt);
    return safeEqualHex(candidate,user.passwordHash)?publicUser(user):null;
  }

  async createSession(userId){
    const data=await this.#read();
    const user=data.users.find(item=>item.id===userId&&item.active!==false);
    if(!user)throw Object.assign(new Error('User account is unavailable.'),{statusCode:401});
    const token=randomBytes(32).toString('base64url');
    const now=Date.now(),expires=now+this.sessionHours*60*60*1000;
    data.sessions=data.sessions.filter(session=>Date.parse(session.expiresAt)>now&&session.userId!==userId);
    data.sessions.push({id:randomUUID(),userId,tokenHash:hashToken(token),createdAt:new Date(now).toISOString(),expiresAt:new Date(expires).toISOString()});
    await this.#write(data);
    return {token,user:publicUser(user),expiresAt:new Date(expires).toISOString()};
  }

  async sessionUserFromRequest(req){
    const token=cookieValue(req?.headers?.cookie,this.cookieName);
    if(!token)return null;
    const tokenHash=hashToken(token),data=await this.#read(),now=Date.now();
    const session=data.sessions.find(item=>item.tokenHash===tokenHash&&Date.parse(item.expiresAt)>now);
    if(!session)return null;
    const user=data.users.find(item=>item.id===session.userId&&item.active!==false);
    return publicUser(user);
  }

  async destroySessionFromRequest(req){
    const token=cookieValue(req?.headers?.cookie,this.cookieName);
    if(!token)return;
    const tokenHash=hashToken(token),data=await this.#read();
    const next=data.sessions.filter(item=>item.tokenHash!==tokenHash&&Date.parse(item.expiresAt)>Date.now());
    if(next.length!==data.sessions.length){data.sessions=next;await this.#write(data);}
  }

  async changePassword(userId,currentPassword,newPassword){
    const chosen=String(newPassword||'');
    if(chosen.length<10)throw Object.assign(new Error('New password must be at least 10 characters.'),{statusCode:400});
    const data=await this.#read();
    const user=data.users.find(item=>item.id===userId&&item.active!==false);
    if(!user)throw Object.assign(new Error('User account is unavailable.'),{statusCode:404});
    if(!safeEqualHex(hashPassword(currentPassword,user.passwordSalt),user.passwordHash))throw Object.assign(new Error('Current password is incorrect.'),{statusCode:401});
    const salt=randomBytes(16).toString('hex');
    user.passwordSalt=salt;user.passwordHash=hashPassword(chosen,salt);user.updatedAt=new Date().toISOString();
    data.sessions=data.sessions.filter(session=>session.userId!==userId);
    await this.#write(data);
    return {ok:true};
  }

  sessionCookie(token,maxAgeSeconds){
    const parts=[`${this.cookieName}=${encodeURIComponent(token)}`,'Path=/','HttpOnly','SameSite=Lax',`Max-Age=${Math.max(0,Math.floor(maxAgeSeconds))}`];
    if(this.cookieSecure)parts.push('Secure');
    return parts.join('; ');
  }

  clearCookie(){return this.sessionCookie('',0);}
}
