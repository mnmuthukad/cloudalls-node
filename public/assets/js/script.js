/* public_html/assets/js/script.js */

// =========================================================================
// 1. GLOBAL UTILITY FUNCTIONS (Must sit outside DOMContentLoaded if global)
// =========================================================================
window.downloadSVG = function(containerId, filename) { 
    const container = document.getElementById(containerId); 
    if (!container) { console.error("Container not found"); return; }
    
    const svgNode = container.querySelector('svg'); 
    if (!svgNode) { console.error("No SVG found in container"); return; }
    
    const serializer = new XMLSerializer(); 
    let svgString = serializer.serializeToString(svgNode);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"}); 
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a"); 
    downloadLink.href = url; 
    downloadLink.download = filename + ".svg";
    
    document.body.appendChild(downloadLink); 
    downloadLink.click();
    document.body.removeChild(downloadLink); 
    URL.revokeObjectURL(url);
};

// =========================================================================
// 2. MAIN CORE APPLICATION INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {

    // ---------------------------------------------------------------------
    // GLOBAL ARCHITECTURE: NAVBAR SCROLL EFFECT
    // ---------------------------------------------------------------------
    const nav = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    if (nav || backToTop) {
        let scrollTicking = false;
        const updateScrollState = () => {
            const scrollY = window.scrollY;
            if (nav) nav.classList.toggle('scrolled', scrollY > 50);
            if (backToTop) backToTop.classList.toggle('show', scrollY > 400);
            scrollTicking = false;
        };
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                scrollTicking = true;
                window.requestAnimationFrame(updateScrollState);
            }
        }, { passive: true });
        updateScrollState();
    }

    // ---------------------------------------------------------------------
    // GLOBAL ARCHITECTURE: SMOOTH SCROLLING
    // ---------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Allow default behavior for Bootstrap tabs, empty hashes, and custom FAQ links
            if(targetId === '#' || this.hasAttribute('data-bs-toggle') || this.classList.contains('js-scroll-link')) return; 
            
            const targetElement = document.querySelector(targetId);
            if(targetElement){
                e.preventDefault(); 
                targetElement.scrollIntoView({ behavior: 'smooth' }); 
            }
        });
    });

    // ---------------------------------------------------------------------
    // GLOBAL ARCHITECTURE: BACK TO TOP BUTTON
    // ---------------------------------------------------------------------
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------------------
    // GLOBAL ARCHITECTURE: COOKIE BANNER ANIMATION
    // ---------------------------------------------------------------------
    const banner = document.getElementById("cookie-banner");
    if (banner) {
        const acceptBtn = document.getElementById("btn-accept"); 
        const declineBtn = document.getElementById("btn-decline");
        
        if (!localStorage.getItem("cloudalls_cookie_consent")) {
            banner.style.display = "block"; 
            setTimeout(() => { banner.classList.add("show-banner"); }, 1000);
        }
        
        const closeBanner = () => {
            banner.classList.remove("show-banner"); 
            setTimeout(() => { banner.style.display = "none"; }, 500); 
        };
        
        if (acceptBtn) { 
            acceptBtn.addEventListener("click", function() { 
                localStorage.setItem("cloudalls_cookie_consent", "accepted"); 
                closeBanner(); 
            });
        }
        if (declineBtn) { 
            declineBtn.addEventListener("click", function() { 
                localStorage.setItem("cloudalls_cookie_consent", "declined"); 
                closeBanner(); 
            });
        }
    }

    

    // ---------------------------------------------------------------------
    // GLOBAL ARCHITECTURE: PWA INSTALLATION INTERACTION
    // ---------------------------------------------------------------------
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const hideInstallButton = () => {
            installBtn.classList.remove('d-flex');
            installBtn.classList.add('d-none');
            installBtn.setAttribute('aria-hidden', 'true');
        };
        const showInstallButton = () => {
            installBtn.classList.remove('d-none');
            installBtn.classList.add('d-flex');
            installBtn.removeAttribute('aria-hidden');
        };

        // Chromium is allowed to show its native install UI. Calling
        // preventDefault() here would intentionally suppress that UI and emit
        // the DevTools "Banner not shown" warning.
        if (isStandalone) {
            hideInstallButton();
        } else if (isIOS) {
            // iOS Safari has no beforeinstallprompt event, so provide the
            // platform-specific instructions only where they are needed.
            showInstallButton();
            installBtn.addEventListener('click', () => {
                alert("To install the CloudAlls Ecosystem on iOS:\n\n1. Tap the 'Share' icon at the bottom of Safari.\n2. Scroll down and tap 'Add to Home Screen'.");
            });
        } else {
            hideInstallButton();
        }

        window.addEventListener('appinstalled', hideInstallButton);
    }

    // =========================================================================
    // 3. PAGE SPECIFIC COMPONENT HANDLERS (Guarded execution)
    // =========================================================================

    // FEATURE: COUNTER ANIMATION (Stats / About / Home Component)
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length > 0) {
        const speed = 200;
        const animateCounter = (counter) => {
            const target = Number(counter.getAttribute('data-target'));
            if (!Number.isFinite(target)) { return; } // guard against missing/invalid data-target
            const increment = target / speed;
            let count = 0;
            const updateCount = () => {
                count = Math.min(target, count + increment);
                // textContent avoids the synchronous layout calculation caused
                // by reading innerText on every animation tick.
                counter.textContent = String(Math.ceil(count));
                if (count < target) window.requestAnimationFrame(updateCount);
            };
            window.requestAnimationFrame(updateCount);
        };

        if (typeof IntersectionObserver !== 'undefined') {
            // Lower threshold (was 0.5): on short/mobile viewports these cards can
            // sit just off-screen and never reach 50% visibility, leaving the
            // counters permanently stuck at 0.
            const startCounters = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            };
            const counterObserver = new IntersectionObserver(startCounters, { threshold: 0.2 });
            counters.forEach(counter => counterObserver.observe(counter));
        } else {
            // Fallback: browsers without IntersectionObserver support previously
            // never animated these at all, so the numbers just showed "0".
            counters.forEach(animateCounter);
        }
    }

    // FEATURE: PREMIUM FORM CUSTOM DROPDOWN (Contact / Partnership Specific)
    const nativeSelect = document.querySelector('select[name="service"]');
    if (nativeSelect) {
        nativeSelect.style.display = 'none';
        const wrapper = document.createElement('div'); 
        wrapper.className = 'custom-select-wrapper'; 
        nativeSelect.parentNode.insertBefore(wrapper, nativeSelect); 
        wrapper.appendChild(nativeSelect);
        
        const selectedOpt = nativeSelect.options[nativeSelect.selectedIndex];
        const initialText = selectedOpt.disabled ? "Select Category" : selectedOpt.text;
        const initialColor = selectedOpt.disabled ? "#64748b" : "#0f172a";
        
        const trigger = document.createElement('div'); 
        trigger.className = 'custom-select-trigger form-control py-3 bg-light border-0';
        trigger.innerHTML = `<span style="color: ${initialColor};">${initialText}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>`; 
        wrapper.appendChild(trigger);
        
        const optionsContainer = document.createElement('div'); 
        optionsContainer.className = 'custom-select-options'; 
        wrapper.appendChild(optionsContainer);
        
        Array.from(nativeSelect.options).forEach((option) => {
            if (option.disabled) return; 
            const optionEl = document.createElement('div'); 
            optionEl.className = 'custom-select-option'; 
            optionEl.textContent = option.text; 
            optionEl.dataset.value = option.value;
            
            if (option.selected) { optionEl.classList.add('selected'); } 
            optionEl.addEventListener('click', function(e) {
                e.stopPropagation(); 
                nativeSelect.value = this.dataset.value; 
                const span = trigger.querySelector('span'); 
                span.textContent = this.textContent; 
                span.style.color = '#0f172a'; 
                wrapper.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected')); 
                this.classList.add('selected');
                trigger.classList.remove('active'); 
                optionsContainer.classList.remove('open');
            }); 
            optionsContainer.appendChild(optionEl);
        }); 
        
        trigger.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('active'); 
            optionsContainer.classList.toggle('open'); 
        }); 
        document.addEventListener('click', function(e) {
            if (!wrapper.contains(e.target)) {
                trigger.classList.remove('active'); 
                optionsContainer.classList.remove('open');
            }
        });
    }

    // FEATURE: RECAPTCHA INTERCEPT ROUTINES (Contact & Partnership Forms)
    if (typeof grecaptcha !== 'undefined' && window.RECAPTCHA_SITE_KEY) {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault(); 
                grecaptcha.ready(function() {
                    grecaptcha.execute(window.RECAPTCHA_SITE_KEY, {action: 'submit_inquiry'}).then(function(token) {
                        const tokenInput = document.getElementById('g-recaptcha-response'); 
                        if(tokenInput) tokenInput.value = token; 
                        contactForm.submit();
                    });
                });
            });
        }

        const partnerForm = document.getElementById('partnerForm');
        if (partnerForm) {
            partnerForm.addEventListener('submit', function(e) {
                e.preventDefault(); 
                grecaptcha.ready(function() {
                    grecaptcha.execute(window.RECAPTCHA_SITE_KEY, {action: 'apply_partnership'}).then(function(token) {
                        const tokenInput = document.getElementById('g-recaptcha-response'); 
                        if(tokenInput) tokenInput.value = token; 
                        partnerForm.submit();
                    });
                });
            });
        }
    }
    
}); // END OF CONSOLIDATED DOMContentLoaded RUNTIME

// Load hero slides 2-4 only after the page has finished its critical work,
// so their ~600KB combined weight never competes with fonts/CSS/JS for
// bandwidth on first paint. Slide 1 is set inline in the HTML (it's the
// visible LCP image) and is unaffected by this.
window.addEventListener('load', function () {
    // AOS calculates offsets for every animated node. Run it after the first
    // paint so those geometry reads do not compete with initial layout work.
    const initAOS = () => {
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50, disable: 'mobile' });
        }
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initAOS, { timeout: 1200 });
    } else {
        requestAnimationFrame(initAOS);
    }

    const deferredSlides = document.querySelectorAll('.hero-slide[data-bg]');
    const applyBg = () => {
        deferredSlides.forEach(function (el) {
            el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')";
            el.removeAttribute('data-bg');
        });
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(applyBg, { timeout: 2000 });
    } else {
        setTimeout(applyBg, 200);
    }
});