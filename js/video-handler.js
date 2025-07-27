// Video Handler for YouTube integration
document.addEventListener('DOMContentLoaded', function() {
    
    // Track video interactions
    let videoStats = {
        watchedVideos: [],
        totalWatchTime: 0,
        startTime: null,
        currentVideo: null
    };
    
    // Load existing stats
    const savedStats = window.storage.get('videoStats');
    if (savedStats) {
        videoStats = { ...videoStats, ...savedStats };
    }
    
    // Practice section functionality
    const startPracticeBtn = document.getElementById('startPractice');
    const morningCheck = document.getElementById('morning');
    const nightCheck = document.getElementById('night');
    
    if (startPracticeBtn) {
        startPracticeBtn.addEventListener('click', function() {
            startPracticeSession();
        });
    }
    
    // Load daily checklist state
    loadDailyChecklist();
    
    // Save checklist state when changed
    if (morningCheck) {
        morningCheck.addEventListener('change', saveDailyChecklist);
    }
    if (nightCheck) {
        nightCheck.addEventListener('change', saveDailyChecklist);
    }
    
    function startPracticeSession() {
        // Start practice mode
        const practiceModal = createPracticeModal();
        document.body.appendChild(practiceModal);
        
        // Track practice session
        const practiceCount = window.storage.get('practiceSessionsCount') || 0;
        window.storage.set('practiceSessionsCount', practiceCount + 1);
        
        // Show achievement for first practice
        if (practiceCount === 0) {
            setTimeout(() => {
                window.achievements.show('Praktisi Pemula', 'Kamu memulai sesi praktek pertama! 🎯');
            }, 2000);
        }
    }
    
    function createPracticeModal() {
        const modal = document.createElement('div');
        modal.className = 'practice-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                margin: 20px;
            ">
                <h2 style="color: #4a90e2; margin-bottom: 20px;">🎮 Mode Praktek</h2>
                <p style="margin-bottom: 25px; line-height: 1.6;">
                    Sekarang waktunya praktek! Ambil sikat gigi dan pasta gigi, 
                    lalu ikuti video tutorial sambil menggunakan timer 2 menit.
                </p>
                <div style="margin-bottom: 25px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🪥</div>
                    <p style="font-weight: 600; color: #28a745;">Siap untuk memulai?</p>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="startTimerAndPractice()" style="
                        padding: 15px 25px;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Mulai Sekarang</button>
                    <button onclick="closePracticeModal()" style="
                        padding: 15px 25px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Nanti Saja</button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    // Global functions for modal
    window.startTimerAndPractice = function() {
        closePracticeModal();
        
        // Scroll to timer section
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) {
            timerSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Auto-start timer after scroll
        setTimeout(() => {
            const startTimerBtn = document.getElementById('startTimer');
            if (startTimerBtn && !startTimerBtn.disabled) {
                startTimerBtn.click();
            }
        }, 1000);
        
        // Show practice instructions
        showPracticeInstructions();
    };
    
    window.closePracticeModal = function() {
        const modal = document.querySelector('.practice-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    };
    
    function showPracticeInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #4a90e2, #667eea);
            color: white;
            padding: 20px;
            border-radius: 15px;
            max-width: 300px;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        instructions.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">📋 Instruksi Praktek</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
                <li>Basahi sikat gigi</li>
                <li>Oleskan pasta gigi</li>
                <li>Ikuti gerakan di video</li>
                <li>Sikat selama 2 menit</li>
                <li>Berkumur dengan air</li>
            </ul>
            <small style="opacity: 0.8;">Timer: ReyhanZidany | 2025-07-23 16:17:29</small>
        `;
        
        document.body.appendChild(instructions);
        
        setTimeout(() => {
            instructions.style.opacity = '0';
            instructions.style.transform = 'translateX(-400px)';
            setTimeout(() => {
                if (document.body.contains(instructions)) {
                    document.body.removeChild(instructions);
                }
            }, 500);
        }, 10000);
    }
    
    function loadDailyChecklist() {
        const today = new Date().toDateString();
        const checklistData = window.storage.get('dailyChecklist') || {};
        const todayData = checklistData[today] || { morning: false, night: false };
        
        if (morningCheck) morningCheck.checked = todayData.morning;
        if (nightCheck) nightCheck.checked = todayData.night;
        
        // Check for completion achievement
        if (todayData.morning && todayData.night) {
            setTimeout(() => {
                window.achievements.show('Gigi Sehat Hari Ini', 'Kamu sudah sikat gigi 2x hari ini! 🌟');
            }, 1000);
        }
    }
    
    function saveDailyChecklist() {
        const today = new Date().toDateString();
        const checklistData = window.storage.get('dailyChecklist') || {};
        
        checklistData[today] = {
            morning: morningCheck ? morningCheck.checked : false,
            night: nightCheck ? nightCheck.checked : false,
            user: 'ReyhanZidany',
            timestamp: new Date().toISOString()
        };
        
        window.storage.set('dailyChecklist', checklistData);
        
        // Check for streaks
        checkBrushingStreak(checklistData);
    }
    
    function checkBrushingStreak(checklistData) {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const dayData = checklistData[dateString];
            if (dayData && dayData.morning && dayData.night) {
                streak++;
            } else {
                break;
            }
        }
        
        // Show streak achievements
        if (streak === 3) {
            setTimeout(() => {
                window.achievements.show('Streak 3 Hari', 'Konsisten sikat gigi 3 hari berturut-turut! 🔥');
            }, 1500);
        } else if (streak === 7) {
            setTimeout(() => {
                window.achievements.show('Streak Seminggu', 'Luar biasa! Seminggu konsisten! 👑');
            }, 1500);
        }
        
        // Save streak record
        const currentStreak = window.storage.get('brushingStreak') || 0;
        if (streak > currentStreak) {
            window.storage.set('brushingStreak', streak);
        }
    }
    
    // Video interaction tracking
    function trackVideoInteraction(videoId, action) {
        const interaction = {
            videoId: videoId,
            action: action,
            timestamp: new Date().toISOString(),
            user: 'ReyhanZidany'
        };
        
        const interactions = window.storage.get('videoInteractions') || [];
        interactions.push(interaction);
        window.storage.set('videoInteractions', interactions);
        
        // Update video stats
        if (action === 'play') {
            videoStats.startTime = Date.now();
            videoStats.currentVideo = videoId;
        } else if (action === 'pause' || action === 'ended') {
            if (videoStats.startTime && videoStats.currentVideo === videoId) {
                const watchTime = Date.now() - videoStats.startTime;
                videoStats.totalWatchTime += watchTime;
                
                if (!videoStats.watchedVideos.includes(videoId)) {
                    videoStats.watchedVideos.push(videoId);
                }
            }
        }
        
        window.storage.set('videoStats', videoStats);
    }
    
    // YouTube API integration (optional)
    function onYouTubeIframeAPIReady() {
        console.log('YouTube API ready');
        // Additional YouTube API functionality can be added here
    }
    
    // Add lazy loading for videos
    function addVideoLazyLoading() {
        const videoContainers = document.querySelectorAll('.video-wrapper, .video-thumbnail');
        
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target.querySelector('iframe');
                    if (iframe && !iframe.src) {
                        iframe.src = iframe.dataset.src;
                    }
                }
            });
        });
        
        videoContainers.forEach(container => {
            videoObserver.observe(container);
        });
    }
    
    // Initialize video features
    addVideoLazyLoading();
    
    // Add video accessibility controls
    function addVideoAccessibility() {
        const videoContainers = document.querySelectorAll('.video-wrapper, .video-thumbnail');
        
        videoContainers.forEach(container => {
            const controls = document.createElement('div');
            controls.className = 'video-controls';
            controls.innerHTML = `
                <button class="video-btn" onclick="playVideo(this)">▶️ Play</button>
                <button class="video-btn" onclick="pauseVideo(this)">⏸️ Pause</button>
                <button class="video-btn" onclick="toggleFullscreen(this)">🔍 Fullscreen</button>
            `;
            
            container.appendChild(controls);
        });
    }
    
    // Global video control functions
    window.playVideo = function(btn) {
        const iframe = btn.closest('.video-wrapper, .video-thumbnail').querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
    };
    
    window.pauseVideo = function(btn) {
        const iframe = btn.closest('.video-wrapper, .video-thumbnail').querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    };
    
    window.toggleFullscreen = function(btn) {
        const container = btn.closest('.video-wrapper, .video-thumbnail');
        if (container.requestFullscreen) {
            container.requestFullscreen();
        }
    };
    
    console.log('🎥 Video handler loaded successfully!');
    console.log('👤 User: ReyhanZidany | Time: 2025-07-23 16:17:29');
});