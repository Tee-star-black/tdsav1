// Homepage slider and interaction logic
document.addEventListener('DOMContentLoaded', function() {
    // Core highlights slider
    const coreSlider = document.querySelector('.core-highlights-slider');
    const coreSlides = Array.from(document.querySelectorAll('.core-slide'));
    const coreDots = Array.from(document.querySelectorAll('.core-slide-dot'));
    const corePrevBtn = document.querySelector('[data-core-slider-prev]');
    const coreNextBtn = document.querySelector('[data-core-slider-next]');
    let coreIndex = 0;
    let coreTimer = null;
    const coreSlideDuration = 4800;

    function showCoreSlide(nextIndex) {
        if (!coreSlides.length) return;
        coreIndex = (nextIndex + coreSlides.length) % coreSlides.length;
        coreSlides.forEach((slide, i) => {
            const isActive = i === coreIndex;
            slide.classList.toggle('active', isActive);
            slide.hidden = !isActive;
            slide.setAttribute('aria-hidden', String(!isActive));
        });
        coreDots.forEach((dot, i) => {
            const isActive = i === coreIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function startCoreSlider() {
        if (coreSlides.length < 2 || document.hidden) return;
        stopCoreSlider();
        coreTimer = setInterval(function() {
            showCoreSlide(coreIndex + 1);
        }, coreSlideDuration);
    }

    function stopCoreSlider() {
        if (coreTimer) {
            clearInterval(coreTimer);
            coreTimer = null;
        }
    }

    function restartCoreSlider() {
        if (coreSlides.length < 2) return;
        startCoreSlider();
    }

    function moveCoreSlide(step) {
        showCoreSlide(coreIndex + step);
        restartCoreSlider();
    }

    if (coreSlides.length) {
        showCoreSlide(0);
        startCoreSlider();

        if (corePrevBtn) {
            corePrevBtn.disabled = coreSlides.length < 2;
            corePrevBtn.addEventListener('click', function() {
                moveCoreSlide(-1);
            });
        }

        if (coreNextBtn) {
            coreNextBtn.disabled = coreSlides.length < 2;
            coreNextBtn.addEventListener('click', function() {
                moveCoreSlide(1);
            });
        }

        coreDots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showCoreSlide(index);
                restartCoreSlider();
            });
        });

        if (coreSlider && coreSlides.length > 1) {
            // Keep the carousel moving while the pointer is merely resting over it.
            // Pause only for keyboard focus so controls remain accessible.
            coreSlider.addEventListener('focusin', stopCoreSlider);
            coreSlider.addEventListener('focusout', function(event) {
                if (!coreSlider.contains(event.relatedTarget)) {
                    startCoreSlider();
                }
            });
            coreSlider.addEventListener('keydown', function(event) {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    moveCoreSlide(-1);
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    moveCoreSlide(1);
                }
            });
        }

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopCoreSlider();
            } else {
                startCoreSlider();
            }
        });
    }

    // Lucide icons
    if (window.lucide) window.lucide.createIcons();
});
