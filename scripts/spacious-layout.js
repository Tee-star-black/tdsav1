(function(){
  'use strict';
  if (document.getElementById('tds-spacious-layout')) return;
  var style=document.createElement('style');
  style.id='tds-spacious-layout';
  style.textContent=`
    :root{--tds-shell:min(1480px,calc(100vw - 96px));--tds-gap:clamp(24px,2.2vw,36px)}
    body{overflow-x:hidden!important}
    section{padding-left:max(24px,5vw)!important;padding-right:max(24px,5vw)!important}

    .core-highlights-slider{padding:clamp(110px,9vw,150px) 0 clamp(72px,6vw,110px)!important;min-height:auto!important;overflow:visible!important}
    .core-slider-shell{width:var(--tds-shell)!important;max-width:none!important;margin:0 auto!important;gap:clamp(34px,3vw,52px)!important}
    .core-slider-intro{max-width:980px!important;margin:0 auto!important}
    .core-slider-intro h1{font-size:clamp(3rem,5.2vw,5.4rem)!important;line-height:1.02!important;margin-bottom:22px!important}
    .core-slider-intro p{font-size:clamp(1rem,1.2vw,1.16rem)!important;line-height:1.75!important;max-width:760px!important}
    .core-slider-actions{gap:14px!important;margin-top:30px!important}
    .core-slider-actions a{min-height:58px!important;padding:0 22px!important}
    .core-proof-strip{margin-top:22px!important;gap:12px!important}

    .core-slide{width:100%!important;max-width:none!important;grid-template-columns:minmax(0,1.05fr) minmax(460px,.95fr)!important;gap:clamp(42px,4vw,68px)!important;padding:clamp(38px,4vw,64px)!important;align-items:center!important;min-height:560px!important}
    .core-slide-copy{padding:0!important;max-width:720px!important}
    .core-slide-copy h2{font-size:clamp(2.4rem,3.8vw,4.25rem)!important;line-height:1.02!important;margin-bottom:22px!important}
    .core-slide-copy p{font-size:clamp(1rem,1.15vw,1.16rem)!important;line-height:1.8!important;margin-bottom:24px!important}
    .core-slide-tags{gap:10px 12px!important;margin:24px 0 28px!important}
    .core-slide-visual,.core-slide .core-slide-visual.tds-core-image-visual{min-height:480px!important;height:100%!important}
    .tds-core-slide-image{min-height:480px!important;object-fit:cover!important;object-position:center!important}
    .core-slider-controls{max-width:none!important;width:100%!important;margin-top:8px!important}

    .services-grid,.tds-four-grid{width:100%!important;max-width:1480px!important;margin-left:auto!important;margin-right:auto!important;gap:var(--tds-gap)!important}
    .services-grid .card,.tds-four-grid>*{min-width:0!important}
    .services-grid .card-img,.tds-four-grid .card-img{height:220px!important}
    .services-grid .card-content,.tds-four-grid .card-content{padding:28px 24px 26px!important}

    .info-grid,.telemedicine-explainer-grid,.trust-assurance-grid,.location-grid,.tech-showcase-content,.site-footer-shell{max-width:1480px!important;width:var(--tds-shell)!important;margin-left:auto!important;margin-right:auto!important}
    .info-grid,.telemedicine-explainer-grid,.trust-assurance-grid,.location-grid,.tech-showcase-content{gap:clamp(40px,4vw,72px)!important}

    @media (min-width:1440px){
      .services-grid,.tds-four-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
    }
    @media (min-width:1024px) and (max-width:1439px){
      :root{--tds-shell:calc(100vw - 64px)}
      .services-grid,.tds-four-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .core-slide{grid-template-columns:minmax(0,1fr) minmax(380px,.9fr)!important;gap:36px!important;padding:42px!important}
    }
    @media (max-width:1023px){
      :root{--tds-shell:calc(100vw - 40px)}
      section{padding-left:20px!important;padding-right:20px!important}
      .core-highlights-slider{padding-top:96px!important;padding-bottom:64px!important}
      .core-slider-shell{width:var(--tds-shell)!important}
      .core-slide{grid-template-columns:1fr!important;gap:28px!important;padding:32px!important;min-height:0!important}
      .core-slide-copy{max-width:none!important;text-align:left!important}
      .core-slide-visual,.core-slide .core-slide-visual.tds-core-image-visual,.tds-core-slide-image{min-height:360px!important}
      .services-grid,.tds-four-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .info-grid,.telemedicine-explainer-grid,.trust-assurance-grid,.location-grid,.tech-showcase-content,.site-footer-shell{width:var(--tds-shell)!important}
    }
    @media (max-width:640px){
      :root{--tds-shell:calc(100vw - 28px)}
      section{padding-left:14px!important;padding-right:14px!important}
      .core-highlights-slider{padding-top:78px!important;padding-bottom:48px!important}
      .core-slider-intro h1{font-size:clamp(2.45rem,12vw,3.6rem)!important}
      .core-slider-actions{display:grid!important;grid-template-columns:1fr!important;width:100%!important}
      .core-slider-actions a{width:100%!important;min-height:54px!important}
      .core-proof-strip{display:grid!important;grid-template-columns:1fr!important}
      .core-slide{padding:22px!important;gap:22px!important}
      .core-slide-copy h2{font-size:clamp(2rem,10vw,2.8rem)!important}
      .core-slide-visual,.core-slide .core-slide-visual.tds-core-image-visual,.tds-core-slide-image{min-height:270px!important}
      .services-grid,.tds-four-grid{grid-template-columns:1fr!important;gap:22px!important}
      .services-grid .card-img,.tds-four-grid .card-img{height:210px!important}
      .info-grid,.telemedicine-explainer-grid,.trust-assurance-grid,.location-grid,.tech-showcase-content,.site-footer-shell{width:var(--tds-shell)!important}
    }
  `;
  document.head.appendChild(style);
})();