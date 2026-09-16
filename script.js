// Volo AI — animation & interaction engine (vanilla JS, no dependencies)
(function () {
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        // preloader — hide fast
        var loader = document.getElementById('preloader');
        function hideLoader() {
            if (loader && !loader.classList.contains('hidden')) {
                loader.classList.add('hidden');
                setTimeout(function () { loader.style.display = 'none'; }, 400);
            }
        }
        setTimeout(hideLoader, 200);
        if (document.readyState !== 'loading') hideLoader();
        else document.addEventListener('DOMContentLoaded', hideLoader);
        window.addEventListener('load', hideLoader);

        // scroll progress + navbar + back-to-top
        var progress = document.getElementById('scroll-progress');
        var navbar = document.getElementById('navbar');
        var toTop = document.getElementById('back-to-top');
        function onScroll() {
            var y = window.scrollY || window.pageYOffset;
            var h = document.documentElement.scrollHeight - window.innerHeight;
            var pct = h > 0 ? (y / h) * 100 : 0;
            if (progress) progress.style.width = pct + '%';
            if (navbar) navbar.classList.toggle('scrolled', y > 12);
            if (toTop) toTop.classList.toggle('show', y > 600);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        if (toTop) toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });

        // mobile nav: keep visual, keyboard and ARIA state in sync.
        var navToggle = document.getElementById('nav-toggle');
        var navLinks = document.getElementById('nav-links');
        var mobileNav = window.matchMedia('(max-width: 1024px)');
        function setNavOpen(open) {
            if (!navToggle || !navLinks) return;
            open = open && mobileNav.matches;
            navLinks.classList.toggle('open', open);
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
            navLinks.inert = mobileNav.matches && !open;
            document.body.classList.toggle('nav-open', open);
        }
        if (navToggle && navLinks) {
            navToggle.setAttribute('aria-controls', navLinks.id);
            setNavOpen(false);
            navToggle.addEventListener('click', function () {
                setNavOpen(!navLinks.classList.contains('open'));
            });
            navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () { setNavOpen(false); });
            });
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && navLinks.classList.contains('open')) {
                    setNavOpen(false);
                    navToggle.focus();
                }
            });
            document.addEventListener('click', function (event) {
                if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) setNavOpen(false);
            });
            document.addEventListener('focusin', function (event) {
                if (navLinks.classList.contains('open') && !navLinks.contains(event.target) && event.target !== navToggle) setNavOpen(false);
            });
            function resetNav() { setNavOpen(false); }
            if (mobileNav.addEventListener) mobileNav.addEventListener('change', resetNav);
            else mobileNav.addListener(resetNav);
            window.addEventListener('pageshow', resetNav);
            window.addEventListener('resize', function () {
                setNavOpen(navLinks.classList.contains('open'));
            });
        }

        // smooth scroll for anchors
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var href = a.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                var id;
                try { id = decodeURIComponent(href.slice(1)); } catch (error) { return; }
                var target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    var top = target.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
                    setNavOpen(false);
                    if (target.id === 'main-content') target.focus({ preventScroll: true });
                }
            });
        });

        // typewriter rotator
        var rotator = document.querySelector('.rotator');
        if (rotator) {
            try {
                var words = JSON.parse(rotator.getAttribute('data-words') || '[]');
            } catch (e) { var words = []; }
            if (words.length) {
                var idx = 0;
                setInterval(function () {
                    idx = (idx + 1) % words.length;
                    rotator.firstChild.textContent = words[idx];
                }, 2200);
            }
        }

        // FAQ accordion
        document.querySelectorAll('.faq-question').forEach(function (btn, index) {
            var answer = btn.nextElementSibling;
            if (answer) {
                btn.id = btn.id || 'faq-question-' + index;
                answer.id = answer.id || 'faq-answer-' + index;
                btn.setAttribute('aria-controls', answer.id);
                answer.setAttribute('aria-labelledby', btn.id);
            }
            btn.addEventListener('click', function () {
                var item = btn.parentElement;
                var open = item.classList.contains('open');
                document.querySelectorAll('.faq-item.open').forEach(function (el) {
                    el.classList.remove('open'); el.querySelector('.faq-question').setAttribute('aria-expanded','false');
                });
                if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
            });
        });

        // reveal-on-scroll
        (function () {
            var els = document.querySelectorAll('.reveal-up, .reveal, .reveal-left, .reveal-scale');
            if (!els.length) return;
            els.forEach(function (el) { el.classList.add('will-reveal'); });
            if ('IntersectionObserver' in window && !reduceMotion) {
                var obs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
                }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
                els.forEach(function (el) { obs.observe(el); });
            } else { els.forEach(function (el) { el.classList.add('in'); }); }
            setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 1000);
        })();

        // animated counters
        (function () {
            var counters = document.querySelectorAll('[data-count]');
            if (!counters.length) return;
            function animate(el) {
                var target = parseFloat(el.getAttribute('data-count'));
                var suffix = el.getAttribute('data-suffix') || '';
                var dur = 1600, start = null;
                function step(ts) {
                    if (!start) start = ts;
                    var p = Math.min((ts - start) / dur, 1);
                    var v = Math.floor(target * (1 - Math.pow(1 - p, 3)));
                    el.textContent = v + suffix;
                    if (p < 1) requestAnimationFrame(step);
                    else el.textContent = target + suffix;
                }
                requestAnimationFrame(step);
            }
            if (reduceMotion || !('IntersectionObserver' in window)) {
                counters.forEach(function (el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
                return;
            }
            var cObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { animate(en.target); cObs.unobserve(en.target); } });
            }, { threshold: 0.4 });
            counters.forEach(function (c) { cObs.observe(c); });
        })();

        // The user-initiated call demo lives in voice-demo.js.

        // dynamic year
        var yr = document.getElementById('year');
        if (yr) yr.textContent = new Date().getFullYear();
    });
})();
