document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const trackTitle = document.getElementById('track-title');
    const trackStatus = document.getElementById('track-status');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const trackItems = document.querySelectorAll('.track-item');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    let audioContext;
    let analyser;
    let source;
    let currentTrackIndex = -1;

    // Initialize Audio Context on first interaction
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            drawVisualizer();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function loadTrack(index) {
        if (index < 0 || index >= trackItems.length) return;
        
        currentTrackIndex = index;
        const item = trackItems[index];
        const src = item.getAttribute('data-src');
        
        audio.src = src;
        trackTitle.textContent = item.textContent;
        trackStatus.textContent = 'Playing...';
        
        trackItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        audio.play();
        playBtn.textContent = 'PAUSE';
    }

    playBtn.addEventListener('click', () => {
        initAudioContext();
        if (currentTrackIndex === -1) {
            loadTrack(0);
        } else if (audio.paused) {
            audio.play();
            playBtn.textContent = 'PAUSE';
        } else {
            audio.pause();
            playBtn.textContent = 'PLAY';
        }
    });

    prevBtn.addEventListener('click', () => {
        let index = currentTrackIndex - 1;
        if (index < 0) index = trackItems.length - 1;
        loadTrack(index);
    });

    nextBtn.addEventListener('click', () => {
        let index = currentTrackIndex + 1;
        if (index >= trackItems.length) index = 0;
        loadTrack(index);
    });

    trackItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            initAudioContext();
            loadTrack(index);
        });
    });

    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = percent + '%';
    });

    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    audio.addEventListener('ended', () => {
        nextBtn.click();
    });

    // Visualizer Logic
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Adjust canvas resolution
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            
            // Gritty Rock Colors: Red and Gold
            const r = 139; // #8B
            const g = (i / bufferLength) * 173; // Graduating towards Gold #CFAD6A
            const b = (i / bufferLength) * 106;
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
});
