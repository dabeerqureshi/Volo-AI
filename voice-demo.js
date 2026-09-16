// User-initiated illustrative call demo. No microphone or backend connection.
(function () {
    'use strict';
    var play = document.getElementById('demo-play');
    var stop = document.getElementById('demo-stop');
    var audio = document.getElementById('demo-audio');
    var note = document.getElementById('demo-note');
    var status = document.getElementById('status-text');
    var transcript = document.getElementById('transcript');
    var wave = document.getElementById('wave-eq');
    if (!play || !stop || !audio || !note || !status || !transcript) return;
    var synth = window.speechSynthesis;
    var supported = !!(synth && window.SpeechSynthesisUtterance);
    var voice = null;
    var running = false;
    var generation = 0;
    var timers = [];
    var utterance = null;
    var finishSpeech = null;
    var failed = false;
    var dialogue = [
        ['ai', 'Good afternoon! Thank you for calling. How can I help you today?'],
        ['customer', "Hi, I'm calling about a quote please."],
        ['ai', 'Of course! Can I take your name and phone number for the team?'],
        ['customer', "Sure, it's Sam. My number is 07700 900123."],
        ['ai', "Thanks Sam. I've noted your enquiry and the team will call you back."],
        ['customer', 'That is all, thank you!'],
        ['ai', 'You are welcome! Have a great day. Goodbye!']
    ];
    function later(fn, delay) {
        var token = generation;
        var id = window.setTimeout(function () {
            timers = timers.filter(function (timer) { return timer !== id; });
            if (running && token === generation) fn();
        }, delay);
        timers.push(id);
        return id;
    }
    function selectVoice() {
        if (!supported) return;
        try {
            var voices = synth.getVoices();
            voice = voices.find(function (v) { return /^en[-_]GB/i.test(v.lang); })
                || voices.find(function (v) { return /^en/i.test(v.lang); }) || null;
        } catch (error) { voice = null; }
    }
    function showNote() {
        note.textContent = !supported ? 'Voice playback is unavailable in this browser. Play the transcript instead.'
            : failed ? 'Voice playback could not finish. Continuing with the transcript; you can replay to retry.'
            : 'Illustrative browser-generated voice, not a live AI call. No microphone access or recording.';
    }
    function cancelSpeech() {
        if (utterance) { utterance.onend = null; utterance.onerror = null; }
        utterance = null;
        finishSpeech = null;
        if (supported) { try { synth.cancel(); } catch (error) { /* Transcript remains usable. */ } }
        if (wave) wave.classList.remove('talking');
    }
    function end(message) {
        running = false;
        generation++;
        timers.forEach(function (timer) { window.clearTimeout(timer); });
        timers = [];
        cancelSpeech();
        play.disabled = false;
        play.textContent = 'Replay demo';
        stop.disabled = true;
        status.textContent = message;
    }
    function speak(text, done) {
        if (!supported || !audio.checked || failed) {
            later(done, Math.max(1500, text.split(' ').length * 230));
            return;
        }
        var token = generation;
        var settled = false;
        var watchdog;
        function finish(error) {
            if (settled || !running || token !== generation) return;
            settled = true;
            window.clearTimeout(watchdog);
            if (error) {
                failed = true;
                transcript.setAttribute('aria-live', 'polite');
                showNote();
            }
            cancelSpeech();
            later(done, 450);
        }
        finishSpeech = function () { finish(false); };
        try {
            selectVoice();
            utterance = new window.SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.95;
            if (voice) utterance.voice = voice;
            utterance.onend = function () { finish(false); };
            utterance.onerror = function () { finish(true); };
            watchdog = later(function () { finish(true); }, 20000);
            if (wave) wave.classList.add('talking');
            synth.speak(utterance);
        } catch (error) { finish(true); }
    }
    function next(index) {
        if (!running) return;
        if (index === dialogue.length) { end('Sample call ended — no real enquiry was submitted.'); return; }
        var line = dialogue[index];
        var bubble = document.createElement('div');
        bubble.className = 'bubble ' + line[0] + ' in';
        bubble.textContent = (line[0] === 'ai' ? 'Volo: ' : 'Caller: ') + line[1];
        transcript.appendChild(bubble);
        transcript.scrollTop = transcript.scrollHeight;
        status.textContent = line[0] === 'ai' ? 'Volo is answering…' : 'Sample caller response';
        if (line[0] === 'ai') speak(line[1], function () { next(index + 1); });
        else later(function () { next(index + 1); }, Math.max(1800, line[1].split(' ').length * 230));
    }
    play.disabled = false;
    audio.disabled = !supported;
    if (!supported) audio.checked = false;
    showNote();
    selectVoice();
    if (supported && synth.addEventListener) synth.addEventListener('voiceschanged', selectVoice);
    play.addEventListener('click', function () {
        if (running) return;
        generation++;
        running = true;
        failed = false;
        showNote();
        transcript.setAttribute('aria-live', audio.checked && supported ? 'off' : 'polite');
        transcript.textContent = '';
        play.disabled = true;
        stop.disabled = false;
        document.querySelectorAll('#ring-ticks i').forEach(function (dot) { dot.classList.add('filled'); });
        // Request speech directly in the user gesture, not from an autoplay timer.
        next(0);
    });
    stop.addEventListener('click', function () { end('Demo stopped. Replay whenever you are ready.'); play.focus(); });
    audio.addEventListener('change', function () {
        transcript.setAttribute('aria-live', audio.checked ? 'off' : 'polite');
        if (!audio.checked && finishSpeech) finishSpeech();
    });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && running) end('Demo stopped while this tab was hidden. Replay to continue.');
    });
    window.addEventListener('pagehide', function () { if (running) end('Demo stopped.'); });
})();
