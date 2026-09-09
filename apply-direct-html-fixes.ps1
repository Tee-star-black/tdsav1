$ErrorActionPreference = 'Stop'

$targets = @(
  'index.html','about-us.html','doctors.html','nurses.html','patients.html',
  'ehr.html','ecg247.html','app.html','contact-us.html','audience-products.html'
)

$shared = @'
<!-- TDS_DIRECT_SOURCE_FIX_START -->
<style id="tds-direct-source-fix">
:root {
  --tds-shell: 1180px;
  --tds-gutter: clamp(16px, 3vw, 28px);
  --tds-section-y: clamp(30px, 3.6vw, 46px);
  --tds-gap: clamp(14px, 1.6vw, 20px);
}
html, body {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: clip !important;
}
*, *::before, *::after { box-sizing: border-box !important; }
img, video, iframe, svg { max-width: 100%; }
body > main, body > header, body > footer, body > section, main > section {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
section:not(.hero):not(.core-highlights-slider) {
  min-height: 0 !important;
  height: auto !important;
  padding-top: var(--tds-section-y) !important;
  padding-bottom: var(--tds-section-y) !important;
}
.container, .content-container, .page-container, .section-container, .section-inner,
.services-header, .services-grid, .info-grid, .trust-assurance-grid,
.telemedicine-explainer-grid, .location-grid, .tech-showcase-content,
.objectives-content, .mission-vision-grid, .values-grid, .stats-grid,
.footer-grid, .site-footer-shell, .site-footer-grid {
  width: min(var(--tds-shell), calc(100% - (var(--tds-gutter) * 2))) !important;
  max-width: var(--tds-shell) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
section > .section-inner { padding-left: 0 !important; padding-right: 0 !important; }

.services-grid, .values-grid, .product-grid, .audience-grid, .feature-grid,
.features-grid, .signal-grid, .list-stack, .proof-strip {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: var(--tds-gap) !important;
  align-items: stretch !important;
}
.journey-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: var(--tds-gap) !important;
  align-items: stretch !important;
}
.mission-vision-grid, .info-grid, .trust-assurance-grid, .telemedicine-explainer-grid,
.location-grid, .contact-cards, .hero-layout {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--tds-gap) !important;
  align-items: stretch !important;
}
.stats-grid { display: grid !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: var(--tds-gap) !important; }
.services-grid > *, .values-grid > *, .mission-vision-grid > *, .stats-grid > *,
.info-grid > *, .trust-assurance-grid > *, .telemedicine-explainer-grid > *,
.location-grid > *, .contact-cards > *, .product-grid > *, .audience-grid > *,
.feature-grid > *, .features-grid > *, .signal-grid > *, .list-stack > *, .journey-grid > * {
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
}

.card, .service-card, .feature-card, .info-focus-card, .trust-proof-card,
.contact-card, .product-card, .audience-card, .stat-card, .shop-role-btn,
.mv-card, .value-card, .info-card, .signal-card, .nav-card, .hero-card {
  min-height: 0 !important;
  height: auto !important;
}
.card-img, .service-card > img:first-child, .feature-card > img:first-child,
.product-card > img:first-child, .audience-card > img:first-child {
  height: clamp(125px, 10vw, 155px) !important;
  min-height: 0 !important;
  object-fit: cover !important;
}
.card-content, .service-card-content, .feature-card-content,
.product-card-content, .audience-card-content, .mv-card, .value-card,
.contact-card, .info-card, .signal-card, .nav-card {
  padding: clamp(14px, 1.5vw, 20px) !important;
}
.section-card, .cta-card { margin-top: 28px !important; }
.section-heading, .services-header, .section-header { margin-bottom: 22px !important; }
.hero-card { padding: clamp(20px, 2.4vw, 28px) !important; }
.media-frame img, .media-frame video { aspect-ratio: 16 / 9 !important; }
.button, .btn, .btn-main, .cta-btn, .learn-more-btn, [class*='-btn'] { min-height: 38px !important; }

footer, footer.site-footer, .site-footer {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: clamp(34px, 3.5vw, 44px) 0 22px !important;
  border-radius: 0 !important;
  overflow: hidden !important;
}
.footer-grid, .site-footer-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: clamp(18px, 2vw, 26px) !important;
  margin-bottom: 20px !important;
  align-items: start !important;
}
.footer-column, .site-footer-brand, .site-footer-column { min-width: 0 !important; max-width: 100% !important; }
.footer-bottom, .site-footer-bottom {
  width: min(var(--tds-shell), calc(100% - (var(--tds-gutter) * 2))) !important;
  max-width: var(--tds-shell) !important;
  margin: 16px auto 0 !important;
  padding-top: 14px !important;
}
.footer-column h4, .site-footer-column h4 { margin-bottom: 8px !important; }
.footer-column p, .footer-column a, .site-footer p, .site-footer a, .site-footer span { overflow-wrap: anywhere !important; }

nav:not(.tds-mobile-nav) {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 58px !important;
  margin: 0 !important;
  padding: 7px clamp(16px, 4vw, 54px) !important;
}
nav:not(.tds-mobile-nav) .logo img { max-height: 38px !important; width: auto !important; }
nav:not(.tds-mobile-nav) .nav-links { gap: clamp(12px, 1.4vw, 20px) !important; }

.page { width: min(var(--tds-shell), calc(100% - 28px)) !important; padding: 14px 0 42px !important; }
.topbar { padding: 10px 12px !important; gap: 14px !important; }
.brand-logo { width: 44px !important; height: 44px !important; padding: 6px !important; }
.hero-layout { gap: 20px !important; }
.proof-strip { gap: 10px !important; }

@media (max-width: 1024px) {
  .services-grid, .values-grid, .product-grid, .audience-grid, .feature-grid,
  .features-grid, .signal-grid, .list-stack, .stats-grid, .journey-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .footer-grid, .site-footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .hero-layout { grid-template-columns: 1fr !important; }
}
@media (max-width: 767px) {
  :root { --tds-gutter: 12px; --tds-section-y: 28px; }
  body { padding-top: 0 !important; }
  .services-grid, .values-grid, .mission-vision-grid, .stats-grid, .info-grid,
  .trust-assurance-grid, .telemedicine-explainer-grid, .location-grid,
  .contact-cards, .product-grid, .audience-grid, .feature-grid, .features-grid,
  .signal-grid, .list-stack, .journey-grid, .proof-strip,
  .footer-grid, .site-footer-grid {
    grid-template-columns: 1fr !important;
  }
  .card-img { height: 138px !important; }
  .page { width: calc(100% - 20px) !important; }
  footer, .site-footer { padding-top: 30px !important; padding-bottom: 20px !important; }
}
</style>
<!-- TDS_DIRECT_SOURCE_FIX_END -->
'@

$about = @'
<!-- TDS_ABOUT_HERO_FIX_START -->
<style id="tds-about-hero-fix">
.hero {
  position: relative !important;
  width: 100% !important;
  height: clamp(560px, 72svh, 700px) !important;
  min-height: 560px !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
.hero-slideshow { position: relative !important; width: 100% !important; height: 100% !important; }
.hero-slide {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  padding: clamp(82px, 8vw, 104px) max(var(--tds-gutter), calc((100vw - var(--tds-shell)) / 2 + var(--tds-gutter))) 48px !important;
  display: flex !important;
  align-items: center !important;
}
.hero-content { width: min(720px, 100%) !important; max-width: 720px !important; }
.hero h1 { margin-bottom: 14px !important; }
.hero p { margin-bottom: 20px !important; max-width: 620px !important; }
.hero-dots { bottom: 18px !important; }
@media (max-width: 1024px) {
  .hero { height: 620px !important; min-height: 620px !important; }
  .hero-slide { padding: 84px 28px 44px !important; }
}
@media (max-width: 767px) {
  .hero { height: 540px !important; min-height: 540px !important; }
  .hero-slide { padding: 76px 20px 40px !important; }
  .hero h1 { font-size: clamp(2rem, 10vw, 2.7rem) !important; }
  .hero p { font-size: .98rem !important; }
}
@media (max-width: 480px) {
  .hero { height: 520px !important; min-height: 520px !important; }
  .hero-slide { padding: 72px 16px 38px !important; }
}
</style>
<!-- TDS_ABOUT_HERO_FIX_END -->
'@

foreach ($file in $targets) {
  if (-not (Test-Path $file)) { continue }
  $text = Get-Content -Path $file -Raw

  $text = $text -replace '\s*<script src="scripts/spacious-layout\.js"></script>\s*', "`r`n"
  $text = $text -replace '\s*<script src="scripts/site-wide-optimization\.js"></script>\s*', "`r`n"
  $text = $text -replace '\s*<script src="scripts/final-global-fixes\.js"></script>\s*', "`r`n"

  $text = [regex]::Replace($text, '(?s)<!-- TDS_DIRECT_SOURCE_FIX_START -->.*?<!-- TDS_DIRECT_SOURCE_FIX_END -->', '')
  $text = [regex]::Replace($text, '(?s)<!-- TDS_DIRECT_PRODUCTION_LAYOUT_START -->.*?<!-- TDS_DIRECT_PRODUCTION_LAYOUT_END -->', '')
  $text = [regex]::Replace($text, '(?s)<!-- TDS_ABOUT_HERO_FIX_START -->.*?<!-- TDS_ABOUT_HERO_FIX_END -->', '')

  $insert = $shared
  if ($file -eq 'about-us.html') { $insert += "`r`n$about" }

  if ($text -match '</head>') {
    $text = $text -replace '</head>', ($insert + "`r`n</head>")
    Set-Content -Path $file -Value $text -Encoding utf8
    Write-Host "Updated $file"
  }
}

Write-Host "`nDirect HTML fixes applied. Review the pages, then commit the HTML files."
