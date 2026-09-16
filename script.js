// Volo AI — animation & interaction engine (vanilla JS, no dependencies)
(function () {
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // DEMO VIDEOS CONFIG — paste YouTube / Vimeo / Google Drive URLs here
    var DEMO_VIDEOS = { 'live-call': '', 'setup-5min': '', 'dashboard': '' };

    function toEmbedUrl(url) {
        url = (url || '').trim();
        var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
        if (yt) return 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?rel=0&autoplay=1&playsinline=1';
        if (url.indexOf('drive.google.com') !== -1) { var m = url.match(/[-\w]{25,}/); if (m) return 'https://drive.google.com/file/d/' + m[0] + '/preview'; }
        if (url.indexOf('vimeo.com') !== -1) { var v = url.match(/vimeo\.com\/(\d+)/); if (v) return 'https://player.vimeo.com/video/' + v[1] + '?autoplay=1'; }
        return url;
    }

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

        // mobile nav
        var navToggle = document.getElementById('nav-toggle');
        var navLinks = document.getElementById('nav-links');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function () {
                var open = navLinks.classList.toggle('open');
                navToggle.classList.toggle('open', open);
                navToggle.setAttribute('aria-expanded', String(open));
            });
            // close mobile nav when a link is clicked
            navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () {
                    navLinks.classList.remove('open');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // smooth scroll for anchors
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var href = a.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var top = target.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
                    if (navLinks) { navLinks.classList.remove('open'); navToggle.classList.remove('open'); }
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
        document.querySelectorAll('.faq-question').forEach(function (btn) {
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
            var cObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { animate(en.target); cObs.unobserve(en.target); } });
            }, { threshold: 0.4 });
            counters.forEach(function (c) { cObs.observe(c); });
        })();

        // phone call simulator
        (function () {
            var statusText = document.getElementById('status-text');
            var ringTicks = document.getElementById('ring-ticks');
            var waveEq = document.getElementById('wave-eq');
            var transcript = document.getElementById('transcript');
            var toast = document.getElementById('sim-toast');
            var phoneSim = document.querySelector('.phone-sim');
            if (!statusText || !transcript) return;

            // Voice synthesis helpers
            var voiceEnabled = true;
            var selectedVoice = null;
            function initVoice() {
                if (!('speechSynthesis' in window)) { voiceEnabled = false; return; }
                var v = speechSynthesis.getVoices();
                selectedVoice = v.find(function (x) { return x.lang.indexOf('en-GB') === 0 || x.lang.indexOf('en-IE') === 0; })
                    || v.find(function (x) { return x.lang.indexOf('en') === 0; }) || null;
            }
            if ('speechSynthesis' in window) { initVoice(); if (speechSynthesis.onvoiceschanged) speechSynthesis.onvoiceschanged = initVoice; }

            function speak(text, rate) {
                if (!voiceEnabled) return;
                window.speechSynthesis.cancel();
                var u = new SpeechSynthesisUtterance(text);
                u.rate = rate || 0.95; u.pitch = 1.0; u.volume = 0.9;
                if (selectedVoice) u.voice = selectedVoice;
                window.speechSynthesis.speak(u);
            }

            function playRingtone() {
                if (!voiceEnabled) return;
                try {
                    var ctx = new (window.AudioContext || window.webkitAudioContext)();
                    for (var i = 0; i < 3; i++) {
                        setTimeout(function () {
                            var o = ctx.createOscillator(); var g = ctx.createGain();
                            o.type = 'sine';
                            o.frequency.setValueAtTime(440, ctx.currentTime);
                            o.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
                            g.gain.setValueAtTime(0.3, ctx.currentTime);
                            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                            o.connect(g); g.connect(ctx.destination);
                            o.start(); o.stop(ctx.currentTime + 0.5);
                        }, i * 1200);
                    }
                } catch (e) {}
            }

            function playPickupSound() {
                if (!voiceEnabled) return;
                try {
                    var ctx = new (window.AudioContext || window.webkitAudioContext)();
                    var o = ctx.createOscillator(); var g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(660, ctx.currentTime);
                    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                    g.gain.setValueAtTime(0.25, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                    o.connect(g); g.connect(ctx.destination);
                    o.start(); o.stop(ctx.currentTime + 0.3);
                } catch (e) {}
            }

            var steps = [
                { t: 0, status: 'Ringing… waiting for your team (5s)', ticks: 0, wave: false, sound: 'ring' },
                { t: 1500, status: 'Ringing… 4 seconds left', ticks: 1, wave: false, sound: 'ring' },
                { t: 3000, status: 'Ringing… 2 seconds left', ticks: 2, wave: false, sound: 'ring' },
                { t: 4500, status: 'Ringing… 1 second left', ticks: 3, wave: false, sound: 'ring' },
                { t: 5000, status: 'No answer — Volo picks up', ticks: 4, wave: false, sound: 'pickup' },
                { t: 5500, status: 'Volo is answering…', ticks: 5, wave: true, speak: 'Good afternoon! Thank you for calling. How can I help you today?', speakRate: 0.9 },
            ];
            var dialogue = [
                { at: 6000, bubble: 'system', text: '— Volo AI answered —' },
                { at: 7000, bubble: 'ai', text: 'Good afternoon! Thank you for calling. How can I help you today?', speak: true, speakRate: 0.9 },
                { at: 9500, bubble: 'customer', text: 'Hi, I\'m calling about a quote please.' },
                { at: 11500, bubble: 'ai', text: 'Of course! Let me grab a few details and pass it to the team.', speak: true, speakRate: 0.95 },
                { at: 14000, bubble: 'ai', text: 'Great — can I take your name and phone number?', speak: true, speakRate: 0.95 },
                { at: 16500, bubble: 'customer', text: 'Sure, it\'s Sam on 07912 345 678.' },
                { at: 18500, bubble: 'ai', text: 'Thanks Sam — I\'ve saved the enquiry and your team will call you back today.' },
                { at: 21000, bubble: 'customer', text: 'No that is all, thank you!' },
                { at: 22500, bubble: 'ai', text: 'You are welcome! Have a great day. Goodbye!', speak: true, speakRate: 0.9 },
                { at: 24500, bubble: 'system', text: '— Call ended · Transcript saved —' },
            ];
            steps.forEach(function (s) {
                setTimeout(function () {
                    statusText.textContent = s.status;
                    if (ringTicks) { var dots = ringTicks.querySelectorAll('i'); for (var i = 0; i < dots.length; i++) { dots[i].classList.toggle('filled', i < s.ticks); } }
                    if (s.wave && waveEq) { waveEq.classList.add('talking'); }
                    if (s.sound === 'ring') playRingtone();
                    if (s.sound === 'pickup') playPickupSound();
                    if (s.speak) speak(s.speak, s.speakRate || 0.95);
                }, s.t);
            });
            dialogue.forEach(function (d) {
                setTimeout(function () {
                    var div = document.createElement('div');
                    div.className = 'bubble ' + d.bubble;
                    div.textContent = d.text;
                    transcript.appendChild(div);
                    setTimeout(function () { div.classList.add('in'); }, 50);
                    transcript.scrollTop = transcript.scrollHeight;
                    if (d.speak && d.text.indexOf('—') !== 0) speak(d.text, d.speakRate || 0.95);
                }, d.at);
            });
            setTimeout(function () {
                if (toast) toast.classList.add('show');
                if (phoneSim) phoneSim.classList.add('loaded');
                window.speechSynthesis.cancel();
                if (waveEq) waveEq.classList.remove('talking');
            }, 26000);
        })();

        // demo video lightbox
        (function () {
            var lightbox = document.getElementById('lightbox');
            if (!lightbox) return;
            var frame = document.getElementById('lightbox-frame');
            var title = document.getElementById('lightbox-title');
            var openLink = document.getElementById('lightbox-open');
            var lastFocused = null;
            function openLightbox(url, t) {
                if (!url) return;
                var embed = toEmbedUrl(url);
                frame.innerHTML = '<iframe src="' + embed + '" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>';
                if (title) title.textContent = t || 'Demo video';
                if (openLink) { if (/youtu\.?be?/.test(url)) { openLink.href = url; openLink.style.display = 'inline'; } else { openLink.style.display = 'none'; } }
                lightbox.classList.add('open');
                lightbox.setAttribute('aria-hidden', 'false');
                lastFocused = document.activeElement;
                var c = document.getElementById('lightbox-close');
                if (c) c.focus();
                document.body.style.overflow = 'hidden';
            }
            function closeLightbox() {
                lightbox.classList.remove('open');
                lightbox.setAttribute('aria-hidden', 'true');
                if (lastFocused && lastFocused.focus) lastFocused.focus();
                document.body.style.overflow = '';
                if (openLink) openLink.style.display = 'none';
                setTimeout(function () { if (frame) frame.innerHTML = ''; }, 280);
            }
            document.querySelectorAll('.demo-card').forEach(function (card) {
                var key = card.getAttribute('data-video-key') || '';
                var url = DEMO_VIDEOS[key] || card.getAttribute('data-video') || '';
                var titleEl = card.querySelector('h3');
                var t = titleEl ? titleEl.textContent : 'Demo video';
                if (!url) { card.classList.add('no-video'); card.addEventListener('click', function () { var contact = document.querySelector('.cta-section'); if (contact) { var pos = contact.getBoundingClientRect().top + window.scrollY - 78; window.scrollTo({ top: pos, behavior: reduceMotion ? 'auto' : 'smooth' }); } }); return; }
                card.addEventListener('click', function () { openLightbox(url, t); });
                card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(url, t); } });
            });
            if (lightbox) {
                document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
                document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
            }
        })();

        // pricing toggle
        (function () {
            var btns = document.querySelectorAll('.switch-btn[data-cycle]');
            var thumb = document.querySelector('.switch-track .switch-thumb');
            if (!btns.length || !thumb) return;
            btns.forEach(function (b) {
                b.addEventListener('click', function () {
                    if (b.classList.contains('active')) return;
                    var prev = document.querySelector('.switch-btn.active');
                    if (prev) prev.classList.remove('active');
                    b.classList.add('active');
                    if (b.dataset.cycle === 'annual') { thumb.style.transform = 'translateX(calc(60px + 14px))'; }
                    else { thumb.style.transform = 'translateX(0)'; }
                });
            });
        })();

        // dynamic year
        var yr = document.getElementById('year');
        if (yr) yr.textContent = new Date().getFullYear();
    });
})();
