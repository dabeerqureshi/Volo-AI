// Industry demo videos: config + privacy-friendly YouTube lightbox.
// Nothing is requested from YouTube until a visitor presses play — no autoplay, no tracking on load.
(function () {
    'use strict';

    // ── EDIT ME ───────────────────────────────────────────────────────────────
    // Paste each demo's YouTube ID (the part after "?v=") into videoId once the
    // video is live, and set uploadDate to the day it was published (YYYY-MM-DD).
    // While videoId is empty the card keeps its "demo coming soon" state.
    // A host page may define window.VOLO_DEMOS before this script loads to
    // override the defaults below without editing this file.
    var demos = window.VOLO_DEMOS || {
        salons: {
            videoId: '', duration: '1:24', uploadDate: '',
            title: 'AI receptionist for hair & beauty salons'
        },
        driving: {
            videoId: '', duration: '1:18', uploadDate: '',
            title: 'AI receptionist for driving schools'
        },
        groomers: {
            videoId: '', duration: '1:12', uploadDate: '',
            title: 'AI receptionist for pet groomers'
        },
        physio: {
            videoId: '', duration: '1:31', uploadDate: '',
            title: 'AI receptionist for physiotherapy & sports massage'
        },
        aesthetics: {
            videoId: '', duration: '1:27', uploadDate: '',
            title: 'AI receptionist for aesthetics & beauty clinics'
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    var cards = document.querySelectorAll('.demo-card[data-demo]');
    if (!cards.length) return;

    var lightbox = document.getElementById('lightbox');
    var frame = document.getElementById('lightbox-frame');
    var titleEl = document.getElementById('lightbox-title');
    var openLink = document.getElementById('lightbox-open');
    var closeBtn = document.getElementById('lightbox-close');
    var lastFocus = null;
    var current = null;
    var videoSchema = [];

    function isVideoId(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id); }
    function thumbnail(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; }
    function watchUrl(id) { return 'https://www.youtube.com/watch?v=' + id; }
    function embedUrl(id) { return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'; }

    function openDemo(key, trigger) {
        var cfg = demos[key];
        if (!lightbox || !frame || !cfg || !isVideoId(cfg.videoId) || current === key) return;
        current = key;
        // Track the element that opened the dialog: Safari does not focus buttons on click.
        lastFocus = trigger || document.activeElement;
        if (titleEl) titleEl.textContent = cfg.title;
        if (openLink) { openLink.href = watchUrl(cfg.videoId); openLink.hidden = false; }
        frame.textContent = '';
        var iframe = document.createElement('iframe');
        iframe.src = embedUrl(cfg.videoId);
        iframe.title = cfg.title + ' — Volo AI call demo';
        iframe.loading = 'lazy';
        iframe.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');
        frame.appendChild(iframe);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        if (closeBtn) closeBtn.focus();
    }

    function closeDemo() {
        if (!lightbox || !lightbox.classList.contains('open')) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (frame) frame.textContent = '';
        current = null;
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    // Upgrade the static cards: real thumbnail, play button and watch link.
    cards.forEach(function (card) {
        var key = card.getAttribute('data-demo');
        var cfg = demos[key];
        if (!cfg || !isVideoId(cfg.videoId)) return;
        card.classList.remove('no-video');
        card.classList.add('has-video');

        var thumbBox = card.querySelector('.demo-thumb');
        var badge = card.querySelector('[data-badge]');
        var emoji = card.querySelector('.demo-emoji');
        var play = card.querySelector('[data-play]');
        var cta = card.querySelector('[data-cta]');

        if (thumbBox) {
            var img = document.createElement('img');
            img.src = thumbnail(cfg.videoId);
            img.alt = cfg.title + ' — Volo AI call demo';
            img.loading = 'lazy';
            img.width = 480;
            img.height = 360;
            img.addEventListener('error', function () { img.remove(); });
            thumbBox.insertBefore(img, thumbBox.firstChild);
            thumbBox.addEventListener('click', function (event) {
                if (play && play.contains(event.target)) return;
                openDemo(key, play || thumbBox);
            });
        }
        if (badge) badge.textContent = 'Demo · ' + cfg.duration;
        if (emoji) emoji.hidden = true;
        if (play) play.addEventListener('click', function () { openDemo(key, play); });
        if (cta) {
            cta.textContent = 'Watch demo';
            cta.href = watchUrl(cfg.videoId);
            cta.target = '_blank';
            cta.rel = 'noopener';
            cta.addEventListener('click', function (event) {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                openDemo(key, cta);
            });
        }

        var description = card.querySelector('.demo-body p');
        if (cfg.uploadDate) {
            videoSchema.push({
                '@type': 'VideoObject',
                name: cfg.title,
                description: description ? description.textContent.trim() : cfg.title,
                thumbnailUrl: [thumbnail(cfg.videoId)],
                uploadDate: cfg.uploadDate,
                duration: 'PT' + durationSeconds(cfg.duration) + 'S',
                embedUrl: embedUrl(cfg.videoId),
                contentUrl: watchUrl(cfg.videoId)
            });
        }
    });

    function durationSeconds(value) {
        var total = 0;
        String(value || '').split(':').forEach(function (part) {
            total = total * 60 + (parseInt(part, 10) || 0);
        });
        return total || 60;
    }
    if (lightbox) {
        if (closeBtn) closeBtn.addEventListener('click', closeDemo);
        lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeDemo(); });
        document.addEventListener('keydown', function (event) {
            if (!lightbox.classList.contains('open')) return;
            if (event.key === 'Escape') { closeDemo(); return; }
            if (event.key !== 'Tab') return;
            var focusable = lightbox.querySelectorAll('a[href]:not([hidden]), button:not([hidden])');
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
    }

    // Add VideoObject data for every demo that has both a video ID and an upload date.
    if (videoSchema.length) {
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': videoSchema });
        document.head.appendChild(script);
    }
})();
