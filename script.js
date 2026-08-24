/* ==========================================================================
   Adithyan M — portfolio behaviour
   Scroll progress, section reveals, active nav state, contact form.
   ========================================================================== */

/*
 * Where the contact form sends.
 *
 * Left empty, the form opens the visitor's email client with everything
 * pre-filled — works on a static host with no signup and no backend.
 *
 * To collect submissions instead, paste a form endpoint here, e.g.
 *   Formspree:   'https://formspree.io/f/xxxxxxxx'
 *   Web3Forms:   'https://api.web3forms.com/submit'   (also set ACCESS_KEY below)
 * Anything that accepts a JSON POST and answers 2xx will work.
 */
var FORM_ENDPOINT = '';
var FORM_ACCESS_KEY = ''; // only needed by Web3Forms-style services

var CONTACT_EMAIL = 'adithyanm45@gmail.com';

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initReveals();
    initActiveNav();
    initContactForm();
    initFooterYear();
});

/* --------------------------------------------------------------------------
   Scroll progress bar
   -------------------------------------------------------------------------- */

function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;

    var ticking = false;

    function update() {
        var doc = document.documentElement;
        var scrollable = doc.scrollHeight - doc.clientHeight;
        var pct = scrollable > 0 ? doc.scrollTop / scrollable : 0;
        bar.style.transform = 'scaleX(' + pct + ')';
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    }, { passive: true });

    update();
}

/* --------------------------------------------------------------------------
   Reveal on scroll
   -------------------------------------------------------------------------- */

function initReveals() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    // No observer support, or the visitor asked for less motion: show it all.
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(targets, function (el) {
            el.classList.add('is-visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(targets, function (el) {
        observer.observe(el);
    });
}

/* --------------------------------------------------------------------------
   Active nav link
   -------------------------------------------------------------------------- */

function initActiveNav() {
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var linkFor = {};
    var sections = [];

    Array.prototype.forEach.call(links, function (link) {
        var id = link.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (!section) return;
        linkFor[id] = link;
        sections.push(section);
    });

    if (!sections.length) return;

    function setCurrent(id) {
        Array.prototype.forEach.call(links, function (link) {
            link.removeAttribute('aria-current');
        });
        if (linkFor[id]) linkFor[id].setAttribute('aria-current', 'page');
    }

    // Track every section's visibility and highlight the one filling most of
    // the viewport, so short sections between tall ones still register.
    var ratios = {};

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });

        var bestId = null;
        var bestRatio = 0;

        Object.keys(ratios).forEach(function (id) {
            if (ratios[id] > bestRatio) {
                bestRatio = ratios[id];
                bestId = id;
            }
        });

        if (bestId) setCurrent(bestId);
    }, {
        threshold: [0, 0.15, 0.35, 0.6, 0.85],
        rootMargin: '-64px 0px 0px 0px'
    });

    sections.forEach(function (section) {
        observer.observe(section);
    });
}

/* --------------------------------------------------------------------------
   Contact form
   -------------------------------------------------------------------------- */

function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('cf-status');
    var submit = document.getElementById('cf-submit');

    var fields = [
        { input: form.elements.name, error: 'cf-name-error', label: 'name' },
        { input: form.elements.email, error: 'cf-email-error', label: 'email' },
        { input: form.elements.message, error: 'cf-message-error', label: 'message' }
    ];

    // Clear a field's error as soon as the visitor starts fixing it.
    fields.forEach(function (field) {
        field.input.addEventListener('input', function () {
            if (field.input.getAttribute('aria-invalid') === 'true') {
                setFieldError(field, '');
            }
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot: a filled "company" means a bot. Pretend it worked.
        if (form.elements.company && form.elements.company.value) {
            setStatus(status, 'Thanks — your message has been sent.', 'ok');
            form.reset();
            return;
        }

        var firstInvalid = null;

        fields.forEach(function (field) {
            var message = validate(field);
            setFieldError(field, message);
            if (message && !firstInvalid) firstInvalid = field.input;
        });

        if (firstInvalid) {
            setStatus(status, 'Please fix the highlighted fields.', 'error');
            firstInvalid.focus();
            return;
        }

        var payload = {
            name: form.elements.name.value.trim(),
            email: form.elements.email.value.trim(),
            subject: form.elements.subject.value.trim() || 'Portfolio enquiry',
            message: form.elements.message.value.trim()
        };

        if (FORM_ENDPOINT) {
            sendToEndpoint(payload, form, status, submit);
        } else {
            sendViaMailto(payload, status);
        }
    });
}

function validate(field) {
    var value = field.input.value.trim();

    if (!value) {
        return 'Please enter your ' + field.label + '.';
    }

    if (field.label === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return 'Please enter a valid email address.';
    }

    if (field.label === 'message' && value.length < 10) {
        return 'Please write at least 10 characters.';
    }

    return '';
}

function setFieldError(field, message) {
    var errorEl = document.getElementById(field.error);

    if (message) {
        field.input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.hidden = false;
        }
    } else {
        field.input.removeAttribute('aria-invalid');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }
    }
}

function setStatus(el, message, state) {
    if (!el) return;
    el.textContent = message;
    if (state) {
        el.setAttribute('data-state', state);
    } else {
        el.removeAttribute('data-state');
    }
}

function sendViaMailto(payload, status) {
    var body =
        payload.message +
        '\n\n—\n' + payload.name +
        '\n' + payload.email;

    var href =
        'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(payload.subject) +
        '&body=' + encodeURIComponent(body);

    setStatus(status, 'Opening your email app with the message ready to send…', 'ok');
    window.location.href = href;
}

function sendToEndpoint(payload, form, status, submit) {
    if (FORM_ACCESS_KEY) payload.access_key = FORM_ACCESS_KEY;

    submit.disabled = true;
    setStatus(status, 'Sending…', null);

    fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(function (response) {
            if (!response.ok) throw new Error('Request failed with ' + response.status);
            setStatus(status, 'Thanks — your message has been sent.', 'ok');
            form.reset();
        })
        .catch(function () {
            setStatus(
                status,
                'Something went wrong. Please email ' + CONTACT_EMAIL + ' directly.',
                'error'
            );
        })
        .finally(function () {
            submit.disabled = false;
        });
}

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */

function initFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}
