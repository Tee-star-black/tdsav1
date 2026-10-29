(function(){
  'use strict';

  const section=document.querySelector('#googleSignInSection');
  const button=document.querySelector('#googleSignInButton');
  const feedback=document.querySelector('#googleSignInMessage');
  const loginGate=document.querySelector('#loginGate');
  const api=window.TDSACmsApi;
  if(!section||!button||!loginGate||!api)return;

  let scriptPromise=null;
  let initialising=false;
  let setupVersion=0;

  function ensureGoogleScript(){
    if(window.google?.accounts?.id)return Promise.resolve();
    if(scriptPromise)return scriptPromise;
    scriptPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://accounts.google.com/gsi/client';
      script.async=true;
      script.onload=()=>window.google?.accounts?.id?resolve():reject(new Error('Google sign-in unavailable.'));
      script.onerror=()=>reject(new Error('Google sign-in unavailable.'));
      document.head.appendChild(script);
    });
    return scriptPromise;
  }

  async function setupGoogleSignIn(){
    if(initialising||loginGate.hidden)return;
    initialising=true;
    const version=++setupVersion;
    try{
      const config=await api.googleConfig();
      if(!config.enabled){section.hidden=true;return;}
      section.hidden=false;
      feedback.textContent='Use your approved TeleDoctorSA Google Workspace account.';
      await ensureGoogleScript();
      if(loginGate.hidden||version!==setupVersion)return;
      button.replaceChildren();
      window.google.accounts.id.initialize({
        client_id:config.clientId,
        nonce:config.csrfToken,
        hd:config.workspaceDomain,
        ux_mode:'popup',
        auto_select:false,
        callback:async response=>{
          if(!response?.credential)return;
          feedback.textContent='Verifying your Google Workspace account…';
          try{
            await api.loginGoogle(response.credential,config.csrfToken);
            window.location.reload();
          }catch(error){
            feedback.textContent=error?.message||'Google sign-in failed. Use your staff password to sign in.';
            void setupGoogleSignIn();
          }
        }
      });
      window.google.accounts.id.renderButton(button,{
        type:'standard',
        theme:'outline',
        size:'large',
        shape:'rectangular',
        text:'signin_with',
        width:Math.min(310,Math.max(205,document.querySelector('.login-card')?.clientWidth-44||280))
      });
    }catch(error){
      section.hidden=true;
      console.warn('Google Workspace sign-in could not be initialised:',error?.message||error);
    }finally{
      initialising=false;
    }
  }

  // Password login remains available when Google is not configured.
  // Refresh the nonce when the login screen is shown again after logout.
  const observer=new MutationObserver(()=>{
    if(!loginGate.hidden)void setupGoogleSignIn();
  });
  observer.observe(loginGate,{attributes:true,attributeFilter:['hidden']});
  if(!loginGate.hidden)void setupGoogleSignIn();
})();
