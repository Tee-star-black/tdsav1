(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var config = {
    'index.html': {
      image: 'images/rebuild/02-connected-care-ecosystem.jpg',
      eyebrow: 'Connected Care',
      title: 'One healthcare ecosystem. Connected around the patient.',
      copy: 'TeleDoctorSA brings virtual consultations, monitoring, digital records and clinician workflows into one connected care experience.'
    },
    'about-us.html': {
      image: 'images/rebuild/01-clinical-team-at-work.jpg',
      eyebrow: 'TeleDoctorSA',
      title: 'Healthcare built around real clinical teams.',
      copy: 'Digital tools should support the people delivering care, not get in their way.'
    },
    'our-services.html': {
      image: 'images/rebuild/03-doctor-video-consultation.jpg',
      eyebrow: 'Virtual Care',
      title: 'Professional care, without the distance.',
      copy: 'Secure virtual consultation workflows connect patients with clinicians wherever care needs to happen.'
    },
    'app.html': {
      image: 'images/rebuild/07-mobile-health-app.jpg',
      eyebrow: 'TeleDoctorSA App',
      title: 'Your healthcare, carried with you.',
      copy: 'A mobile layer for connected readings, care access and health information.'
    },
    'ehr.html': {
      image: 'images/rebuild/06-healthcare-dashboard.jpg',
      eyebrow: 'Electronic Health Records',
      title: 'Clinical information that is easier to understand and act on.',
      copy: 'A digital record experience designed around continuity, access and secure clinical workflows.'
    },
    'ecg247.html': {
      image: 'images/rebuild/04-wearable-ecg-monitor.jpg',
      eyebrow: 'ECG247',
      title: 'Heart monitoring beyond the consultation room.',
      copy: 'Wearable ECG technology supports longer-duration monitoring while clinicians remain connected to the care pathway.'
    },
    'doctors.html': {
      image: 'images/rebuild/09-clinician-platform-review.jpg',
      eyebrow: 'For Doctors',
      title: 'A clearer view of the patient journey.',
      copy: 'Clinical information, monitoring and digital workflows brought together for the clinician.'
    },
    'nurses.html': {
      image: 'images/rebuild/08-nurses-at-clinical-workstation.jpg',
      eyebrow: 'For Nurses',
      title: 'Digital workflows designed for care on the ground.',
      copy: 'Practical clinical tools for patient support, monitoring and coordinated care.'
    },
    'patients.html': {
      image: 'images/rebuild/05-remote-patient-monitoring.jpg',
      eyebrow: 'For Patients',
      title: 'Stay connected to care between appointments.',
      copy: 'Remote monitoring and digital access help make healthcare more continuous and easier to navigate.'
    },
    'telemedia-suite.html': {
      image: 'images/rebuild/02-connected-care-ecosystem.jpg',
      eyebrow: 'TeleMedia Suite',
      title: 'Connected infrastructure for digital healthcare.',
      copy: 'A joined-up platform view across patients, clinicians, monitoring and medical information.'
    }
  };

  var data = config[page];
  if (!data || document.querySelector('.tds-rescued-visual')) return;

  var style = document.createElement('style');
  style.textContent = `
    .tds-rescued-visual {
      position: relative;
      z-index: 1;
      width: min(1180px, calc(100% - 40px));
      margin: 56px auto 72px;
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
      background: #fff;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 24px 70px rgba(15, 23, 42, .08);
    }
    .tds-rescued-visual-media {
      min-height: 430px;
      background: #0f172a;
      overflow: hidden;
    }
    .tds-rescued-visual-media img {
      width: 100%;
      height: 100%;
      min-height: 430px;
      object-fit: cover;
      display: block;
    }
    .tds-rescued-visual-copy {
      padding: clamp(34px, 5vw, 68px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #fff;
    }
    .tds-rescued-visual-kicker {
      font: 700 .75rem/1.2 'Plus Jakarta Sans', sans-serif;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: #f28a4b;
      margin-bottom: 16px;
    }
    .tds-rescued-visual h2 {
      margin: 0 0 18px;
      color: #0f172a;
      font: 800 clamp(2rem, 3.3vw, 3.6rem)/1.04 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -.045em;
    }
    .tds-rescued-visual p {
      margin: 0;
      color: #64748b;
      font: 400 1rem/1.8 'Plus Jakarta Sans', sans-serif;
    }
    @media (max-width: 820px) {
      .tds-rescued-visual {
        width: min(100% - 28px, 680px);
        grid-template-columns: 1fr;
        margin: 32px auto 52px;
      }
      .tds-rescued-visual-media,
      .tds-rescued-visual-media img { min-height: 280px; }
      .tds-rescued-visual-copy { padding: 32px 24px 38px; text-align: center; }
    }
  `;
  document.head.appendChild(style);

  var section = document.createElement('section');
  section.className = 'tds-rescued-visual';
  section.setAttribute('aria-label', data.eyebrow + ' visual');
  section.innerHTML =
    '<div class="tds-rescued-visual-media">' +
      '<img src="' + data.image + '" alt="' + data.eyebrow + ' - TeleDoctorSA">' +
    '</div>' +
    '<div class="tds-rescued-visual-copy">' +
      '<span class="tds-rescued-visual-kicker">' + data.eyebrow + '</span>' +
      '<h2>' + data.title + '</h2>' +
      '<p>' + data.copy + '</p>' +
    '</div>';

  var nav = document.querySelector('nav');
  var hero = document.querySelector('.hero-section, .hero, .hero-container, header');
  var insertionPoint = hero && hero !== nav ? hero : null;

  if (insertionPoint && insertionPoint.parentNode) {
    insertionPoint.parentNode.insertBefore(section, insertionPoint.nextSibling);
  } else {
    var main = document.querySelector('main');
    if (main) main.insertBefore(section, main.firstChild);
    else if (nav && nav.parentNode) nav.parentNode.insertBefore(section, nav.nextSibling);
    else document.body.insertBefore(section, document.body.firstChild);
  }
})();
