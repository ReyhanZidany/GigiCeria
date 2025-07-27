// Timer dengan Musik untuk Sikat Gigi - Versi Diperbaiki
document.addEventListener('DOMContentLoaded', function() {
    // Timer elements
    const timerDisplay = document.getElementById('timerDisplay');
    const timerStatus = document.getElementById('timerStatus');
    const startButton = document.getElementById('startTimer');
    const pauseButton = document.getElementById('pauseTimer');
    const resetButton = document.getElementById('resetTimer');
    const muteButton = document.getElementById('muteButton');
    const progressBar = document.getElementById('progressBar');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const startPracticeButton = document.getElementById('startPractice');
    
    // Audio elements
    const brushSong = document.getElementById('brushSong');
    const timerEndSound = document.getElementById('timerEndSound');
    
    // Timer variables
    let timeLeft = 120; // 2 minutes in seconds
    let timerInterval = null;
    let isRunning = false;
    let isPaused = false;
    let isMuted = false;
    
    // Web Audio API untuk fallback lagu
    let audioContext;
    let oscillator;
    let gainNode;
    
    // Initialize
    init();
    
    function init() {
        updateDisplay();
        setupEventListeners();
        setupAudio();
        checkAudioSupport();
    }
    
    function setupEventListeners() {
        startButton.addEventListener('click', startTimer);
        pauseButton.addEventListener('click', pauseTimer);
        resetButton.addEventListener('click', resetTimer);
        muteButton.addEventListener('click', toggleMute);
        volumeSlider.addEventListener('input', updateVolume);
        if (startPracticeButton) {
            startPracticeButton.addEventListener('click', startPracticeMode);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }
    
    function setupAudio() {
        if (brushSong) {
            brushSong.volume = 0.5;
            brushSong.loop = true;
        }
        
        if (timerEndSound) {
            timerEndSound.volume = 0.7;
        }
        
        // Setup Web Audio API context
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    function checkAudioSupport() {
        // Check if audio files are available
        if (brushSong) {
            brushSong.addEventListener('error', function() {
                console.log('❌ Audio file not found, using Web Audio API fallback');
                createFallbackMusic();
            });
            
            brushSong.addEventListener('canplaythrough', function() {
                console.log('✅ Audio file loaded successfully');
            });
        }
    }
    
    function createFallbackMusic() {
        // Create simple melody using Web Audio API as fallback
        if (!audioContext) return;
        
        const notes = [
            { freq: 261.63, duration: 0.5 }, // C4
            { freq: 293.66, duration: 0.5 }, // D4
            { freq: 329.63, duration: 0.5 }, // E4
            { freq: 349.23, duration: 0.5 }, // F4
            { freq: 392.00, duration: 0.5 }, // G4
            { freq: 440.00, duration: 0.5 }, // A4
            { freq: 493.88, duration: 0.5 }, // B4
            { freq: 523.25, duration: 0.5 }  // C5
        ];
        
        let currentNoteIndex = 0;
        
        function playNote() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            oscillator = audioContext.createOscillator();
            gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const note = notes[currentNoteIndex];
            oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + note.duration);
            
            currentNoteIndex = (currentNoteIndex + 1) % notes.length;
            
            if (isRunning && !isPaused) {
                setTimeout(playNote, note.duration * 1000);
            }
        }
        
        if (isRunning && !isPaused && !isMuted) {
            playNote();
        }
    }
    
    function startTimer() {
        if (isPaused) {
            resumeTimer();
            return;
        }
        
        isRunning = true;
        isPaused = false;
        
        // Update UI
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        timerStatus.textContent = '🎵 Sikat gigi sambil mendengarkan lagu!';
        timerStatus.className = 'timer-status active';
        
        // Start music - HANYA reset currentTime saat mulai baru
        if (!isMuted) {
            startMusic(true); // true = reset dari awal
        }
        
        // Start timer countdown
        timerInterval = setInterval(function() {
            timeLeft--;
            updateDisplay();
            updateProgress();
            
            // Timer finished
            if (timeLeft <= 0) {
                finishTimer();
            }
            
            // Progress messages
            if (timeLeft === 90) {
                timerStatus.textContent = '🦷 Sikat bagian depan gigi!';
            } else if (timeLeft === 60) {
                timerStatus.textContent = '🔄 Pindah ke bagian belakang gigi!';
            } else if (timeLeft === 30) {
                timerStatus.textContent = '⏰ 30 detik lagi! Sikat lidah juga!';
            } else if (timeLeft === 10) {
                timerStatus.textContent = '🏁 10 detik terakhir!';
            }
        }, 1000);
        
        console.log('✅ Timer started with music');
    }
    
    function pauseTimer() {
        isPaused = true;
        clearInterval(timerInterval);
        
        // Update UI
        startButton.style.display = 'inline-block';
        startButton.innerHTML = '<span class="btn-icon">▶️</span> Lanjutkan';
        pauseButton.style.display = 'none';
        timerStatus.textContent = '⏸️ Timer dijeda';
        timerStatus.className = 'timer-status paused';
        
        // Pause music - JANGAN reset currentTime
        pauseMusic();
        
        console.log('⏸️ Timer paused');
    }
    
    function resumeTimer() {
        isPaused = false;
        isRunning = true;
        
        // Update UI
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        startButton.innerHTML = '<span class="btn-icon">▶️</span> Mulai Timer';
        timerStatus.textContent = '🎵 Melanjutkan sikat gigi!';
        timerStatus.className = 'timer-status active';
        
        // Resume music - JANGAN reset currentTime
        if (!isMuted) {
            startMusic(false); // false = jangan reset, lanjut dari posisi terakhir
        }
        
        // Start timer countdown lagi
        timerInterval = setInterval(function() {
            timeLeft--;
            updateDisplay();
            updateProgress();
            
            // Timer finished
            if (timeLeft <= 0) {
                finishTimer();
            }
            
            // Progress messages
            if (timeLeft === 90) {
                timerStatus.textContent = '🦷 Sikat bagian depan gigi!';
            } else if (timeLeft === 60) {
                timerStatus.textContent = '🔄 Pindah ke bagian belakang gigi!';
            } else if (timeLeft === 30) {
                timerStatus.textContent = '⏰ 30 detik lagi! Sikat lidah juga!';
            } else if (timeLeft === 10) {
                timerStatus.textContent = '🏁 10 detik terakhir!';
            }
        }, 1000);
        
        console.log('▶️ Timer resumed');
    }
    
    function resetTimer() {
        // Stop timer
        isRunning = false;
        isPaused = false;
        clearInterval(timerInterval);
        timeLeft = 120;
        
        // Update UI
        startButton.style.display = 'inline-block';
        startButton.innerHTML = '<span class="btn-icon">▶️</span> Mulai Timer';
        pauseButton.style.display = 'none';
        timerStatus.textContent = 'Siap untuk memulai!';
        timerStatus.className = 'timer-status';
        
        updateDisplay();
        updateProgress();
        
        // Stop music dan reset ke awal
        stopMusic();
        
        console.log('🔄 Timer reset');
    }
    
    function finishTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        
        // Stop brush music
        stopMusic();
        
        // Play completion sound
        if (!isMuted && timerEndSound) {
            timerEndSound.play().catch(e => console.log('Could not play end sound'));
        }
        
        // Update UI
        startButton.style.display = 'inline-block';
        startButton.innerHTML = '<span class="btn-icon">▶️</span> Mulai Timer';
        pauseButton.style.display = 'none';
        timerStatus.textContent = '🎉 Selesai! Gigi sudah bersih!';
        timerStatus.className = 'timer-status completed';
        
        // Show celebration
        showCelebration();
        
        // Auto reset after 5 seconds
        setTimeout(() => {
            resetTimer();
        }, 5000);
        
        console.log('🎉 Timer completed!');
    }
    
    // PERBAIKAN UTAMA: Parameter resetFromStart untuk kontrol posisi musik
    function startMusic(resetFromStart = false) {
        if (brushSong && brushSong.readyState >= 2) {
            // Audio file available
            if (resetFromStart) {
                brushSong.currentTime = 0; // Reset hanya jika diminta
            }
            // Jika tidak reset, musik akan lanjut dari posisi terakhir
            brushSong.play().catch(e => {
                console.log('Could not play audio file, using fallback');
                createFallbackMusic();
            });
        } else {
            // Use Web Audio API fallback
            createFallbackMusic();
        }
    }
    
    function pauseMusic() {
        if (brushSong && !brushSong.paused) {
            brushSong.pause(); // Hanya pause, JANGAN ubah currentTime
        }
        
        if (oscillator) {
            try {
                oscillator.stop();
                oscillator = null;
            } catch (e) {
                // Oscillator already stopped
            }
        }
    }
    
    function stopMusic() {
        if (brushSong) {
            brushSong.pause();
            brushSong.currentTime = 0; // Reset ke awal hanya saat stop
        }
        
        if (oscillator) {
            try {
                oscillator.stop();
                oscillator = null;
            } catch (e) {
                // Oscillator already stopped
            }
        }
    }
    
    function toggleMute() {
        isMuted = !isMuted;
        
        if (isMuted) {
            muteButton.innerHTML = '<span class="btn-icon">🔇</span> Suara OFF';
            muteButton.classList.add('muted');
            // Pause musik tanpa mengubah posisi
            if (brushSong && !brushSong.paused) {
                brushSong.pause();
            }
        } else {
            muteButton.innerHTML = '<span class="btn-icon">🔊</span> Suara ON';
            muteButton.classList.remove('muted');
            // Lanjutkan musik dari posisi terakhir
            if (isRunning && !isPaused && brushSong) {
                brushSong.play().catch(e => console.log('Could not resume audio'));
            }
        }
        
        // Update audio muted property
        if (brushSong) brushSong.muted = isMuted;
        if (timerEndSound) timerEndSound.muted = isMuted;
    }
    
    function updateVolume() {
        const volume = volumeSlider.value / 100;
        volumeValue.textContent = `${volumeSlider.value}%`;
        
        // Update volume tanpa mengubah posisi musik
        if (brushSong) brushSong.volume = volume;
        if (timerEndSound) timerEndSound.volume = volume;
        
        if (gainNode) {
            gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
        }
    }
    
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function updateProgress() {
        const progress = ((120 - timeLeft) / 120) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    function showCelebration() {
        // Create celebration animation
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.innerHTML = '🎉🦷✨🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            z-index: 10000;
            animation: celebrate 2s ease-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }
    
    function startPracticeMode() {
        // Scroll to timer section
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) {
            timerSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
        
        // Start timer after scroll
        setTimeout(() => {
            if (!isRunning) {
                startTimer();
            }
        }, 1000);
    }
    
    function handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (isRunning) {
                    if (isPaused) resumeTimer();
                    else pauseTimer();
                } else {
                    startTimer();
                }
                break;
            case 'KeyR':
                e.preventDefault();
                resetTimer();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
        }
    }
    
    // Save daily progress to localStorage (dengan pengecekan keamanan)
    const morningCheckbox = document.getElementById('morning');
    const nightCheckbox = document.getElementById('night');
    
    if (morningCheckbox && nightCheckbox) {
        // Load saved progress
        const today = new Date().toDateString();
        
        try {
            const savedProgress = localStorage.getItem(`brushProgress_${today}`);
            
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                morningCheckbox.checked = progress.morning;
                nightCheckbox.checked = progress.night;
            }
        } catch (e) {
            console.log('Could not load saved progress');
        }
        
        // Save progress when changed
        [morningCheckbox, nightCheckbox].forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                try {
                    const progress = {
                        morning: morningCheckbox.checked,
                        night: nightCheckbox.checked
                    };
                    localStorage.setItem(`brushProgress_${today}`, JSON.stringify(progress));
                    
                    if (progress.morning && progress.night) {
                        showDailyComplete();
                    }
                } catch (e) {
                    console.log('Could not save progress');
                }
            });
        });
    }
    
    function showDailyComplete() {
        const message = document.createElement('div');
        message.className = 'daily-complete-message';
        message.innerHTML = '🌟 Bagus! Kamu sudah sikat gigi 2 kali hari ini!';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4a90e2, #53d9b8);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }
});

// Add CSS animations
const celebrationCSS = `
@keyframes celebrate {
    0% { 
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
    }
    50% { 
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    }
    100% { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 0;
    }
}

@keyframes slideIn {
    from { 
        transform: translateX(100%);
        opacity: 0;
    }
    to { 
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from { 
        transform: translateX(0);
        opacity: 1;
    }
    to { 
        transform: translateX(100%);
        opacity: 0;
    }
}

.timer-status {
    font-size: 1.1rem;
    margin: 15px 0;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.timer-status.active {
    background: linear-gradient(135deg, #4a90e2, #53d9b8);
    color: white;
    animation: pulse 2s infinite;
}

.timer-status.paused {
    background: #ffc107;
    color: #333;
}

.timer-status.completed {
    background: #28a745;
    color: white;
    animation: bounce 1s ease-out;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.volume-control {
    margin: 15px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
}

.volume-control input[type="range"] {
    width: 150px;
    accent-color: #4a90e2;
}

.btn.muted {
    background: #dc3545;
}

.btn.muted:hover {
    background: #c82333;
}

.btn-icon {
    margin-right: 5px;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = celebrationCSS;
document.head.appendChild(style);