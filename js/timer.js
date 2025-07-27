// Timer functionality for brushing teeth tutorial
document.addEventListener('DOMContentLoaded', function() {
    const timerDisplay = document.getElementById('timerDisplay');
    const startButton = document.getElementById('startTimer');
    const resetButton = document.getElementById('resetTimer');
    const progressBar = document.getElementById('progressBar');
    
    let timerInterval;
    let timeLeft = 120; // 2 minutes in seconds
    let isRunning = false;
    
    // Format time to MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Update progress bar
    function updateProgress() {
        const progress = ((120 - timeLeft) / 120) * 100;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    // Play notification sound (using Web Audio API)
    function playNotification() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio notification not available');
        }
    }
    
    // Show completion message
    function showCompletionMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: celebrate 0.6s ease;
        `;
        
        message.innerHTML = `
            <h2 style="margin: 0 0 15px 0; font-size: 2rem;">🎉 Selamat!</h2>
            <p style="margin: 0; font-size: 1.2rem;">Kamu sudah menyikat gigi selama 2 menit penuh!</p>
            <p style="margin: 10px 0 0 0; font-size: 1rem; opacity: 0.9;">Gigi kamu sekarang bersih dan sehat! ✨</p>
        `;
        
        // Add celebration animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebrate {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        // Add confetti effect
        createConfetti();
        
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(message);
                document.head.removeChild(style);
            }, 300);
        }, 4000);
    }
    
    // Create confetti animation
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    z-index: 9999;
                    pointer-events: none;
                    animation: confetti-fall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (document.body.contains(confetti)) {
                        document.body.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
        
        // Add confetti animation keyframes
        if (!document.querySelector('#confetti-animation')) {
            const style = document.createElement('style');
            style.id = 'confetti-animation';
            style.textContent = `
                @keyframes confetti-fall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Timer countdown function
    function countdown() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startButton.textContent = 'Mulai Timer';
            startButton.disabled = false;
            
            playNotification();
            showCompletionMessage();
            
            // Track achievement
            const completedSessions = window.storage.get('completedBrushSessions') || 0;
            window.storage.set('completedBrushSessions', completedSessions + 1);
            
            if (completedSessions + 1 === 1) {
                setTimeout(() => {
                    window.achievements.show('Sikat Gigi Pertama', 'Kamu berhasil menyikat gigi 2 menit penuh! 🪥');
                }, 5000);
            } else if (completedSessions + 1 === 5) {
                setTimeout(() => {
                    window.achievements.show('Ahli Sikat Gigi', 'Kamu sudah 5x menyikat gigi dengan timer! 🏆');
                }, 5000);
            }
            
            return;
        }
        
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }
        updateProgress();
        timeLeft--;
    }
    
    // Start/Pause timer
    if (startButton) {
        startButton.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                this.textContent = 'Timer Berjalan...';
                this.disabled = true;
                timerInterval = setInterval(countdown, 1000);
                
                // Show encouragement messages
                showEncouragementMessage();
            }
        });
    }
    
    // Reset timer
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 120;
            startButton.textContent = 'Mulai Timer';
            startButton.disabled = false;
            
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(timeLeft);
            }
            updateProgress();
        });
    }
    
    // Show encouragement messages during brushing
    function showEncouragementMessage() {
        const messages = [
            { time: 30, text: "Bagus! Terus sikat dengan lembut! 🪥", icon: "👍" },
            { time: 60, text: "Setengah jalan! Jangan lupa sikat lidah! 👅", icon: "⭐" },
            { time: 90, text: "Hampir selesai! Tetap semangat! 💪", icon: "🎯" },
            { time: 110, text: "10 detik lagi! Kamu hebat! 🌟", icon: "🎉" }
        ];
        
        messages.forEach(msg => {
            setTimeout(() => {
                if (isRunning) {
                    showMiniNotification(msg.text, msg.icon);
                }
            }, (120 - msg.time) * 1000);
        });
    }
    
    // Show mini notification during timer
    function showMiniNotification(text, icon) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(74, 144, 226, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            font-size: 1rem;
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.4s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            max-width: 250px;
        `;
        
        notification.innerHTML = `<span style="font-size: 1.2rem; margin-right: 8px;">${icon}</span>${text}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }
    
    // Initialize timer display
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(timeLeft);
    }
    updateProgress();
    
    // Prevent page unload during active timer
    window.addEventListener('beforeunload', function(e) {
        if (isRunning) {
            e.preventDefault();
            e.returnValue = 'Timer masih berjalan. Yakin ingin meninggalkan halaman?';
            return e.returnValue;
        }
    });
    
    console.log('🕐 Timer loaded successfully!');
});