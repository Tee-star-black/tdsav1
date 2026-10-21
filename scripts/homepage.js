// Ensure mega menu links always redirect on mobile
        document.addEventListener('DOMContentLoaded', function() {
            function isMobile() {
                return window.innerWidth <= 1024;
            }
            document.querySelectorAll('.mega-menu-item').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    var href = link.getAttribute('href');
                    if (isMobile() && href && href !== '#' && !link.hasAttribute('onclick')) {
                        window.location.href = href;
                        e.preventDefault();
                    }
                });
            });
        });
        // Initialize Icons
        if (window.lucide) window.lucide.createIcons();

        // Initialize Scroll Animations with premium settings
        if (window.AOS) window.AOS.init({
            duration: 1000,
            once: true,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            offset: 100,
            delay: 50,
            anchorPlacement: 'top-bottom'
        });

        // Add stagger effect to cards
        document.querySelectorAll('.card').forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });

        // Modal functionality
        const modal = document.getElementById('contactModal');
        const legalNoticeModal = document.getElementById('legalNoticeModal');
        const legalNoticeBtn = document.getElementById('legalNoticeBtn');
        const modalTitle = modal ? modal.querySelector('h2') : null;
        const modalIntro = document.getElementById('contactModalIntro');
        const contactForm = document.getElementById('contactForm');
        const formStatus = document.getElementById('formStatus');
        const serviceField = document.getElementById('service');
        const preferredContactField = document.getElementById('preferredContact');
        const messageField = document.getElementById('message');
        const leadSourceField = document.getElementById('leadSource');
        const leadIntentField = document.getElementById('leadIntent');
        const submitButton = contactForm ? contactForm.querySelector('.submit-btn') : null;
        const defaultModalTitle = modalTitle ? modalTitle.textContent : 'Start Your Care Journey';
        const defaultModalIntro = modalIntro ? modalIntro.textContent : '';

        // Service modals
        const virtualModal = document.getElementById('virtualModal');
        const technologyModal = document.getElementById('technologyModal');
        const recordsModal = document.getElementById('recordsModal');
        const serviceLinks = document.querySelectorAll('.read-more');
        const allModals = document.querySelectorAll('.modal');
        const allCloseButtons = document.querySelectorAll('.modal-close');

        function setFormStatus(type, message) {
            if (!formStatus) {
                return;
            }

            formStatus.className = 'form-status';
            formStatus.textContent = '';
            formStatus.innerHTML = '';

            if (!message) {
                return;
            }

            formStatus.textContent = message;
            formStatus.classList.add('is-visible');
            if (type) {
                formStatus.classList.add(`is-${type}`);
            }
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function preferredContactLabel(value) {
            if (value === 'whatsapp') return 'WhatsApp';
            if (value === 'email') return 'email';
            return 'phone call';
        }

        function showLeadSuccess(result, payload) {
            if (!formStatus) {
                return;
            }

            const reference = escapeHtml(result.leadId || '');
            const responseWindow = escapeHtml(result.responseWindow || 'within one business day');
            const nextStep = escapeHtml(result.nextStep || `TeleDoctorSA will follow up by ${preferredContactLabel(payload.preferredContact)}.`);
            const whatsappUrl = escapeHtml((result.support && result.support.whatsappUrl) || 'https://api.whatsapp.com/send/?phone=27780336394&text=Hello%20TeleDoctorSA,%20I%20just%20submitted%20an%20enquiry%20and%20would%20like%20to%20share%20more%20details.&type=phone_number&app_absent=0');
            const contactEmail = escapeHtml((result.support && result.support.email) || 'info@teledoctorsa.co.za');

            formStatus.className = 'form-status is-visible is-success';
            formStatus.innerHTML = `
                <strong>Enquiry received.</strong>
                <span>Reference ${reference !== '' ? reference : 'saved'}.</span>
                <div class="form-status-meta">
                    <span>Reply window: ${responseWindow}</span>
                    <span>Preferred contact: ${escapeHtml(preferredContactLabel(payload.preferredContact))}</span>
                </div>
                <div style="margin-top: 10px;">${nextStep}</div>
                <div class="form-status-actions">
                    <a class="form-status-link" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
                    <a class="form-status-link" href="mailto:${contactEmail}?subject=TeleDoctorSA%20Enquiry%20${reference}">Reply by email</a>
                </div>
            `;
        }

        function setSelectValue(field, value) {
            if (!field || !value) {
                return;
            }

            const optionExists = Array.from(field.options).some(option => option.value === value);
            if (optionExists) {
                field.value = value;
            }
        }

        function resetLeadModalContext(clearStatus = true) {
            if (modalTitle) {
                modalTitle.textContent = defaultModalTitle;
            }
            if (modalIntro) {
                modalIntro.textContent = defaultModalIntro;
            }
            if (leadSourceField) {
                leadSourceField.value = 'homepage-modal';
            }
            if (leadIntentField) {
                leadIntentField.value = '';
            }
            if (clearStatus) {
                setFormStatus('', '');
            }
        }

        function openLeadModal(options = {}) {
            if (!modal) {
                return;
            }

            if (contactForm) {
                contactForm.reset();
            }
            resetLeadModalContext();

            if (modalTitle && options.title) {
                modalTitle.textContent = options.title;
            }
            if (modalIntro && options.intro) {
                modalIntro.textContent = options.intro;
            }
            if (leadSourceField) {
                leadSourceField.value = options.source || 'homepage-modal';
            }
            if (leadIntentField) {
                leadIntentField.value = options.intent || '';
            }
            setSelectValue(serviceField, options.service);
            setSelectValue(preferredContactField, options.preferredContact);
            if (messageField && options.message) {
                messageField.value = options.message;
            }

            modal.classList.add('active');
        }


        // Open contact modal for "Contact us" buttons (navigation and elsewhere)
        document.querySelectorAll('.contact-trigger').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openLeadModal({
                    source: 'contact-trigger',
                    intent: 'general-contact'
                });
            });
        });

        document.querySelectorAll('[data-open-lead-modal]').forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                openLeadModal({
                    title: this.dataset.modalTitle || '',
                    intro: this.dataset.modalIntro || '',
                    service: this.dataset.service || '',
                    intent: this.dataset.intent || '',
                    source: this.dataset.source || 'homepage-modal',
                    preferredContact: this.dataset.preferredContact || '',
                    message: this.dataset.message || ''
                });
            });
        });

        // Open Legal Notice modal
        if (legalNoticeBtn) {
            legalNoticeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Legal Notice button clicked');
                if (legalNoticeModal) {
                    legalNoticeModal.classList.add('active');
                    console.log('Legal Notice modal opened');
                } else {
                    console.error('Legal Notice modal not found');
                }
            });
        } else {
            console.error('Legal Notice button not found');
        }

        // Open service modals - only for links with data-service attribute
        serviceLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const service = this.getAttribute('data-service');
                if (service) {
                    e.preventDefault();
                    if (service === 'virtual') {
                        virtualModal.classList.add('active');
                    } else if (service === 'technology') {
                        technologyModal.classList.add('active');
                    } else if (service === 'records') {
                        recordsModal.classList.add('active');
                    }
                }
            });
        });

        // Function to open service modals from dropdown
        function openServiceModal(service) {
            if (service === 'records') {
                recordsModal.classList.add('active');
            } else if (service === 'virtual') {
                virtualModal.classList.add('active');
            } else if (service === 'technology') {
                technologyModal.classList.add('active');
            }
        }

        // Close all modals
        allCloseButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                allModals.forEach(m => m.classList.remove('active'));
                resetLeadModalContext();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            allModals.forEach(m => {
                if (e.target === m) {
                    m.classList.remove('active');
                    if (m === modal) {
                        resetLeadModalContext();
                    }
                }
            });
        });

        function collectTrackingParams() {
            const params = new URLSearchParams(window.location.search);
            const tracked = {};
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(key => {
                const value = params.get(key);
                if (value) {
                    tracked[key] = value;
                }
            });
            return tracked;
        }

        async function submitLead(payload) {
            const response = await fetch('api/leads.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({
                ok: false,
                error: 'Invalid server response.'
            }));

            if (!response.ok || result.ok !== true) {
                throw new Error(result.error || 'We could not submit your enquiry right now.');
            }

            return result;
        }

        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                setFormStatus('', '');

                if (!contactForm.reportValidity()) {
                    return;
                }

                const originalButtonText = submitButton ? submitButton.textContent : '';
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Sending enquiry...';
                }

                const payload = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    preferredContact: document.getElementById('preferredContact').value,
                    service: document.getElementById('service').value,
                    timeframe: document.getElementById('timeframe').value,
                    message: document.getElementById('message').value.trim(),
                    consent: document.getElementById('consent').checked,
                    leadSource: leadSourceField ? leadSourceField.value : 'homepage-modal',
                    leadIntent: leadIntentField ? leadIntentField.value : '',
                    pageUrl: window.location.href,
                    pagePath: window.location.pathname,
                    referrer: document.referrer,
                    tracking: collectTrackingParams()
                };

                try {
                    const result = await submitLead(payload);
                    contactForm.reset();
                    resetLeadModalContext(false);
                    showLeadSuccess(result, payload);
                } catch (error) {
                    setFormStatus('error', error.message || 'We could not submit your enquiry right now.');
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                }
            });
        }

        // Smooth scroll for "View Services" link (mobile: also close nav)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (this.hasAttribute('data-open-lead-modal')) {
                    return;
                }
                if (href !== '#' && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const navHeight = window.innerWidth <= 900 ? 60 : 80; // Account for fixed nav
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                        });
                        // On mobile, close nav menu after click
                        const menu = document.getElementById('tdsNavLinks');
                        if (menu && menu.classList.contains('is-open')) {
                            document.getElementById('tdsMobileMenuClose')?.click();
                        }
                    }
                }
            });
        });

        // Parallax effect for floating shapes
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const shapes = document.querySelectorAll('.shape');

            shapes.forEach((shape, index) => {
                const speed = 0.3 + (index * 0.1);
                const yPos = -(scrolled * speed);
                shape.style.transform = `translateY(${yPos}px)`;
            });

            // Add parallax to hero background shapes
            const heroShape = document.querySelector('.hero::before');
            if (heroShape) {
                const heroOffset = scrolled * 0.2;
                document.querySelector('.hero').style.setProperty('--hero-offset', `${heroOffset}px`);
            }
        });

        // Add hover effect to navigation links with ripple
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('mouseenter', function(e) {
                this.style.transform = 'translateY(-2px)';
            });
            link.addEventListener('mouseleave', function(e) {
                this.style.transform = 'translateY(0)';
            });
        });

        // Subtle background animation on scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const nav = document.querySelector('nav');

            if (scrollTop > lastScrollTop) {
                // Scrolling down
                nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            } else {
                // Scrolling up
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);

        // Legal Modal Content and Functions
        const legalContent = {
            'legal-notice': {
                title: 'Legal Notice',
                content: `
                    <div style="line-height: 1.8;">
                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Company Information</h3>
                        <p style="margin-bottom: 16px;">
                            <strong>TeleDoctorSA</strong> is a registered digital healthcare provider operating under the brand of Dr. Mukudu & Partners,
                            a private medical practice registered in South Africa.
                        </p>
                        <p style="margin-bottom: 16px;">
<strong>Registration:</strong> Health Professions Council of South Africa (HPCSA)<br>
                            <strong>Address:</strong> 29 Landor Street, Tulisa Park, Johannesburg, 2197<br>
                            <strong>Email:</strong> info@teledoctorsa.co.za<br>
                            <strong>Phone:</strong> +27 78 033 6394
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Healthcare Services</h3>
                        <p style="margin-bottom: 16px;">
                            All medical services provided through TeleDoctorSA are subject to South African healthcare regulations,
                            including the National Health Act (Act No. 61 of 2003) and guidelines from the Health Professions Council of South Africa (HPCSA).
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Professional Liability</h3>
                        <p style="margin-bottom: 16px;">
                            All healthcare practitioners providing services through TeleDoctorSA are registered with the HPCSA and maintain
                            professional indemnity insurance. Medical advice provided is for informational purposes and does not replace
                            in-person consultations where clinically necessary.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Intellectual Property</h3>
                        <p style="margin-bottom: 16px;">
                            All content, logos, and trademarks on this website are the property of TeleDoctorSA and Dr. Mukudu & Partners.
                            Unauthorized use is prohibited.
                        </p>
                    </div>
                `
            },
            'privacy-policy': {
                title: 'Privacy Policy',
                content: `
                    <div style="line-height: 1.8;">
                        <p style="margin-bottom: 16px;"><em>Last updated: December 31, 2025</em></p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Introduction</h3>
                        <p style="margin-bottom: 16px;">
                            TeleDoctorSA is committed to protecting your privacy and personal information in accordance with the
                            <strong>Protection of Personal Information Act (POPIA), 2013 (Act No. 4 of 2013)</strong> and where applicable,
                            the General Data Protection Regulation (GDPR).
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Information We Collect</h3>
                        <p style="margin-bottom: 12px;">We collect the following types of information:</p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;"><strong>Personal Information:</strong> Name, surname, ID number, date of birth, contact details</li>
                            <li style="margin-bottom: 8px;"><strong>Medical Information:</strong> Medical history, symptoms, diagnoses, prescriptions, vital signs</li>
                            <li style="margin-bottom: 8px;"><strong>Financial Information:</strong> Medical aid details, billing information</li>
                            <li style="margin-bottom: 8px;"><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">How We Use Your Information</h3>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">To provide virtual medical consultations and healthcare services</li>
                            <li style="margin-bottom: 8px;">To maintain accurate medical records as required by law</li>
                            <li style="margin-bottom: 8px;">To process billing and medical aid claims</li>
                            <li style="margin-bottom: 8px;">To communicate appointment reminders and follow-up care</li>
                            <li style="margin-bottom: 8px;">To comply with legal and regulatory obligations</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Data Security</h3>
                        <p style="margin-bottom: 16px;">
                            We implement industry-standard security measures including:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">End-to-end encryption for video consultations</li>
                            <li style="margin-bottom: 8px;">Secure cloud storage with encryption at rest</li>
                            <li style="margin-bottom: 8px;">Access controls and audit trails</li>
                            <li style="margin-bottom: 8px;">Regular security assessments and updates</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Your Rights</h3>
                        <p style="margin-bottom: 12px;">Under POPIA, you have the right to:</p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Access your personal and medical information</li>
                            <li style="margin-bottom: 8px;">Request corrections to inaccurate information</li>
                            <li style="margin-bottom: 8px;">Object to processing of your data</li>
                            <li style="margin-bottom: 8px;">Request deletion of data (subject to legal retention requirements)</li>
                            <li style="margin-bottom: 8px;">Lodge a complaint with the Information Regulator</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Data Retention</h3>
                        <p style="margin-bottom: 16px;">
                            Medical records are retained for a minimum of 6 years in accordance with HPCSA guidelines and the National Health Act.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Contact Us</h3>
                        <p style="margin-bottom: 16px;">
                            For privacy-related inquiries, contact our Information Officer at privacy@teledoctorsa.co.za
                        </p>
                    </div>
                `
            },
            'terms-conditions': {
                title: 'Terms and Conditions',
                content: `
                    <div style="line-height: 1.8;">
                        <p style="margin-bottom: 16px;"><em>Effective Date: December 31, 2025</em></p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Acceptance of Terms</h3>
                        <p style="margin-bottom: 16px;">
                            By using TeleDoctorSA services, you agree to these Terms and Conditions. If you do not agree,
                            please do not use our services.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Service Description</h3>
                        <p style="margin-bottom: 16px;">
                            TeleDoctorSA provides virtual healthcare services including:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Virtual medical consultations via video or telephone</li>
                            <li style="margin-bottom: 8px;">Remote monitoring of chronic conditions</li>
                            <li style="margin-bottom: 8px;">Digital prescription services</li>
                            <li style="margin-bottom: 8px;">Electronic health record management</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Patient Responsibilities</h3>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Provide accurate and complete medical information</li>
                            <li style="margin-bottom: 8px;">Attend scheduled virtual appointments on time</li>
                            <li style="margin-bottom: 8px;">Follow medical advice and treatment plans</li>
                            <li style="margin-bottom: 8px;">Inform us of any adverse reactions or complications</li>
                            <li style="margin-bottom: 8px;">Maintain confidentiality of login credentials</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Limitations of Telemedicine</h3>
                        <p style="margin-bottom: 16px;">
                            Telemedicine has limitations. Virtual consultations may not be suitable for all medical conditions.
                            In emergencies, please call 10177 or visit the nearest emergency room. Our practitioners will advise
                            when an in-person consultation is necessary.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Payment Terms</h3>
                        <p style="margin-bottom: 16px;">
                            Payment is required at the time of booking unless covered by a valid medical aid. We accept major
                            South African medical aids and credit/debit cards. Consultation fees are non-refundable unless
                            cancelled 24 hours in advance.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Confidentiality</h3>
                        <p style="margin-bottom: 16px;">
                            All consultations are confidential and comply with HPCSA ethical guidelines. Information may only
                            be shared with your consent or as required by law.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Limitation of Liability</h3>
                        <p style="margin-bottom: 16px;">
                            While we strive for excellence, TeleDoctorSA and its practitioners are not liable for outcomes
                            resulting from patient non-compliance, technical failures beyond our control, or emergencies
                            where telemedicine was inappropriate.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Termination</h3>
                        <p style="margin-bottom: 16px;">
                            We reserve the right to terminate services for non-payment, abuse of services, or violation of these terms.
                        </p>
                    </div>
                `
            },
            'refund-policy': {
                title: 'Cancellation and Refund Policy',
                content: `
                    <div style="line-height: 1.8;">
                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Appointment Cancellations</h3>
                        <p style="margin-bottom: 16px;">
                            We understand that circumstances change. Our cancellation policy is as follows:
                        </p>

                        <div style="background: var(--orange-subtle); padding: 20px; border-left: 4px solid var(--primary-orange); margin-bottom: 20px; border-radius: 4px;">
                            <h4 style="color: var(--deep-navy); margin-bottom: 12px; font-size: 1.1rem;">Cancellation Timeline</h4>
                            <ul style="margin-left: 20px;">
                                <li style="margin-bottom: 8px;"><strong>24+ hours before appointment:</strong> Full refund or free rescheduling</li>
                                <li style="margin-bottom: 8px;"><strong>12-24 hours before:</strong> 50% refund or free rescheduling</li>
                                <li style="margin-bottom: 8px;"><strong>Less than 12 hours:</strong> No refund, but may reschedule with a fee</li>
                                <li style="margin-bottom: 8px;"><strong>No-show:</strong> Full consultation fee charged, no refund</li>
                            </ul>
                        </div>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">How to Cancel</h3>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Log into your patient portal and cancel the appointment</li>
                            <li style="margin-bottom: 8px;">Call our office at +27 78 033 6394</li>
                            <li style="margin-bottom: 8px;">Email us at appointments@teledoctorsa.co.za</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Emergency Cancellations</h3>
                        <p style="margin-bottom: 16px;">
                            In cases of medical emergencies, hospitalization, or other unforeseen circumstances, we handle
                            cancellations on a case-by-case basis. Please contact us as soon as possible.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Refund Processing</h3>
                        <p style="margin-bottom: 16px;">
                            Approved refunds are processed within 7-10 business days to the original payment method.
                            Medical aid claims cannot be refunded once submitted.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Practitioner-Initiated Cancellations</h3>
                        <p style="margin-bottom: 16px;">
                            If a practitioner needs to cancel your appointment, you will receive a full refund and priority
                            rescheduling at no additional cost.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Technical Issues</h3>
                        <p style="margin-bottom: 16px;">
                            If technical difficulties prevent your consultation from taking place, you will receive a full
                            refund or free rescheduling. We test our systems regularly to minimize disruptions.
                        </p>
                    </div>
                `
            },
            'fulfillment-policy': {
                title: 'Service Fulfillment Policy',
                content: `
                    <div style="line-height: 1.8;">
                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Virtual Consultation Process</h3>
                        <p style="margin-bottom: 16px;">
                            Our virtual consultations are delivered through a secure, HIPAA-compliant video platform.
                            Here's what to expect:
                        </p>

                        <div style="background: var(--light-gray); padding: 20px; border-left: 4px solid var(--deep-navy); margin-bottom: 20px; border-radius: 4px;">
                            <h4 style="color: var(--deep-navy); margin-bottom: 12px; font-size: 1.1rem;">Step-by-Step Process</h4>
                            <ol style="margin-left: 20px;">
                                <li style="margin-bottom: 8px;"><strong>Booking:</strong> Schedule your appointment online or via phone</li>
                                <li style="margin-bottom: 8px;"><strong>Confirmation:</strong> Receive email/SMS confirmation with consultation link</li>
                                <li style="margin-bottom: 8px;"><strong>Preparation:</strong> Complete pre-consultation questionnaire</li>
                                <li style="margin-bottom: 8px;"><strong>Consultation:</strong> Join video call at scheduled time (15-30 minutes)</li>
                                <li style="margin-bottom: 8px;"><strong>Follow-up:</strong> Receive prescription, sick note, or referral within 1 hour</li>
                            </ol>
                        </div>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Prescription Fulfillment</h3>
                        <p style="margin-bottom: 16px;">
                            Prescriptions are issued digitally and sent to:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Your email within 1 hour of consultation</li>
                            <li style="margin-bottom: 8px;">Your preferred pharmacy via secure electronic prescription</li>
                            <li style="margin-bottom: 8px;">Your patient portal for permanent record keeping</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Medical Certificates & Documentation</h3>
                        <p style="margin-bottom: 16px;">
                            Sick notes, medical certificates, and referral letters are provided electronically within 1 hour
                            of your consultation. Hard copies can be mailed upon request.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Remote Monitoring Services</h3>
                        <p style="margin-bottom: 16px;">
                            For chronic disease management, we provide:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Access to home monitoring devices (blood pressure, glucose meters)</li>
                            <li style="margin-bottom: 8px;">Automatic data transmission to your healthcare team</li>
                            <li style="margin-bottom: 8px;">Regular check-ins and medication adjustments as needed</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Technical Requirements</h3>
                        <p style="margin-bottom: 16px;">
                            To ensure a smooth consultation, you'll need:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Stable internet connection (minimum 1 Mbps)</li>
                            <li style="margin-bottom: 8px;">Device with camera and microphone (smartphone, tablet, or computer)</li>
                            <li style="margin-bottom: 8px;">Updated web browser (Chrome, Safari, Firefox, Edge)</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Service Availability</h3>
                        <p style="margin-bottom: 16px;">
                            Virtual consultations are available Monday to Friday, 8:00 AM - 6:00 PM. Weekend and after-hours
                            consultations may be available for urgent cases at premium rates.
                        </p>
                    </div>
                `
            },
            'governing-law': {
                title: 'Governing Law and Jurisdiction',
                content: `
                    <div style="line-height: 1.8;">
                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Governing Law</h3>
                        <p style="margin-bottom: 16px;">
                            These Terms and Conditions, and all services provided by TeleDoctorSA, are governed by the laws
                            of the <strong>Republic of South Africa</strong>, including but not limited to:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;"><strong>National Health Act</strong> (Act No. 61 of 2003)</li>
                            <li style="margin-bottom: 8px;"><strong>Protection of Personal Information Act (POPIA)</strong> (Act No. 4 of 2013)</li>
                            <li style="margin-bottom: 8px;"><strong>Medical Schemes Act</strong> (Act No. 131 of 1998)</li>
                            <li style="margin-bottom: 8px;"><strong>Consumer Protection Act</strong> (Act No. 68 of 2008)</li>
                            <li style="margin-bottom: 8px;"><strong>Electronic Communications and Transactions Act</strong> (Act No. 25 of 2002)</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Jurisdiction</h3>
                        <p style="margin-bottom: 16px;">
                            Any disputes arising from the use of TeleDoctorSA services shall be subject to the exclusive
                            jurisdiction of the South African courts. By using our services, you consent to the jurisdiction
                            of these courts.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Dispute Resolution</h3>
                        <p style="margin-bottom: 16px;">
                            We are committed to resolving disputes amicably. Our dispute resolution process is:
                        </p>
                        <ol style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;"><strong>Informal Resolution:</strong> Contact us directly to resolve the issue</li>
                            <li style="margin-bottom: 8px;"><strong>Mediation:</strong> If unresolved, we agree to mediation before legal action</li>
                            <li style="margin-bottom: 8px;"><strong>Arbitration:</strong> Binding arbitration as an alternative to court proceedings</li>
                            <li style="margin-bottom: 8px;"><strong>Legal Action:</strong> Court proceedings as a last resort</li>
                        </ol>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Regulatory Compliance</h3>
                        <p style="margin-bottom: 16px;">
                            TeleDoctorSA operates under the oversight of:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;"><strong>Health Professions Council of South Africa (HPCSA)</strong></li>
                            <li style="margin-bottom: 8px;"><strong>Information Regulator (for POPIA compliance)</strong></li>
                            <li style="margin-bottom: 8px;"><strong>Council for Medical Schemes (CMS)</strong></li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Complaints Procedure</h3>
                        <p style="margin-bottom: 16px;">
                            If you wish to lodge a formal complaint:
                        </p>
                        <ul style="margin-left: 24px; margin-bottom: 16px;">
                            <li style="margin-bottom: 8px;">Email: complaints@teledoctorsa.co.za</li>
                            <li style="margin-bottom: 8px;">Written complaint: 29 Landor Street, Tulisa Park, Johannesburg, 2197</li>
                            <li style="margin-bottom: 8px;">HPCSA complaint hotline: 012 338 9300</li>
                        </ul>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Severability</h3>
                        <p style="margin-bottom: 16px;">
                            If any provision of these terms is found to be unenforceable, the remaining provisions shall
                            continue in full force and effect.
                        </p>

                        <h3 style="color: var(--deep-navy); margin: 24px 0 16px; font-size: 1.3rem;">Amendments</h3>
                        <p style="margin-bottom: 16px;">
                            We reserve the right to amend these terms at any time. Changes will be communicated via email
                            and posted on our website. Continued use of our services constitutes acceptance of updated terms.
                        </p>

                        <div style="background: var(--orange-subtle); padding: 20px; border-left: 4px solid var(--primary-orange); margin-top: 24px; border-radius: 4px;">
                            <p style="margin: 0; font-weight: 600;">
                                For legal inquiries, contact our legal team at legal@teledoctorsa.co.za
                            </p>
                        </div>
                    </div>
                `
            }
        };

        function openLegal(type) {
            const modal = document.getElementById('legalModal');
            const title = document.getElementById('legalModalTitle');
            const body = document.getElementById('legalModalBody');

            if (legalContent[type]) {
                title.innerText = legalContent[type].title;
                body.innerHTML = legalContent[type].content;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
        }

        function closeLegalModal() {
            const modal = document.getElementById('legalModal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Close modal when clicking outside content or on overlay
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('legalModal');
            if (event.target === modal) {
                closeLegalModal();
            }
        });

