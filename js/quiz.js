// Enhanced Quiz functionality with improved localStorage persistence
document.addEventListener('DOMContentLoaded', function() {
    const quizData = [
        {
            question: "Berapa kali seharusnya kita menyikat gigi dalam sehari?",
            options: ["1 kali", "2 kali", "3 kali", "4 kali"],
            correct: 1,
            explanation: "Sikat gigi sebaiknya dilakukan 2 kali sehari: pagi setelah sarapan dan malam sebelum tidur.",
            timeLimit: 15
        },
        {
            question: "Berapa lama waktu yang dibutuhkan untuk menyikat gigi dengan benar?",
            options: ["30 detik", "1 menit", "2 menit", "5 menit"],
            correct: 2,
            explanation: "Menyikat gigi yang benar membutuhkan waktu minimal 2 menit untuk membersihkan semua permukaan gigi.",
            timeLimit: 15
        },
        {
            question: "Bagian gigi mana yang sering terlupa saat menyikat gigi?",
            options: ["Gigi depan", "Gigi samping", "Gigi belakang", "Semua sama"],
            correct: 2,
            explanation: "Gigi belakang (geraham) sering terlupa karena sulit dijangkau, padahal bagian ini penting untuk dibersihkan.",
            timeLimit: 12
        },
        {
            question: "Apa yang terjadi jika kita jarang menyikat gigi?",
            options: ["Gigi menjadi putih", "Gigi berlubang", "Gigi bertambah kuat", "Tidak ada efeknya"],
            correct: 1,
            explanation: "Jarang menyikat gigi menyebabkan penumpukan bakteri yang dapat merusak gigi dan menyebabkan gigi berlubang.",
            timeLimit: 10
        },
        {
            question: "Makanan mana yang BAIK untuk kesehatan gigi?",
            options: ["Permen", "Coklat", "Susu", "Minuman bersoda"],
            correct: 2,
            explanation: "Susu mengandung kalsium yang sangat baik untuk memperkuat gigi dan tulang.",
            timeLimit: 12
        },
        {
            question: "Kapan waktu yang tepat untuk mengganti sikat gigi?",
            options: ["Setiap bulan", "Setiap 3 bulan", "Setiap 6 bulan", "Setiap tahun"],
            correct: 1,
            explanation: "Sikat gigi sebaiknya diganti setiap 3 bulan atau ketika bulu sikat sudah rusak/melebar.",
            timeLimit: 15
        },
        {
            question: "Gerakan menyikat gigi yang benar adalah:",
            options: ["Maju mundur kuat", "Memutar kecil dan lembut", "Naik turun cepat", "Acak tidak beraturan"],
            correct: 1,
            explanation: "Gerakan memutar kecil dan lembut adalah teknik yang benar untuk membersihkan gigi tanpa melukai gusi.",
            timeLimit: 18
        },
        {
            question: "Selain menyikat gigi, apa lagi yang penting untuk kesehatan mulut?",
            options: ["Makan permen", "Berkumur dengan air", "Minum kopi", "Mengunyah es"],
            correct: 1,
            explanation: "Berkumur dengan air setelah makan membantu membersihkan sisa makanan dan menjaga kebersihan mulut.",
            timeLimit: 14
        },
        {
            question: "Apa fungsi pasta gigi saat menyikat gigi?",
            options: ["Membuat rasa enak", "Membersihkan dan melindungi gigi", "Membuat busa banyak", "Tidak ada fungsinya"],
            correct: 1,
            explanation: "Pasta gigi mengandung fluoride dan bahan pembersih yang membantu membersihkan dan melindungi gigi dari kerusakan.",
            timeLimit: 16
        },
        {
            question: "Seberapa sering sebaiknya kita periksa ke dokter gigi?",
            options: ["Setiap bulan", "Setiap 6 bulan", "Setiap 2 tahun", "Hanya saat sakit gigi"],
            correct: 1,
            explanation: "Pemeriksaan rutin ke dokter gigi setiap 6 bulan membantu mencegah dan mendeteksi masalah gigi sejak dini.",
            timeLimit: 13
        }
    ];
    
    let currentQuestion = 0;
    let totalScore = 0;
    let answers = [];
    let quizStarted = false;
    let questionStartTime = 0;
    let timerInterval = null;
    let timeRemaining = 0;
    let playerName = '';
    let streak = 0;
    let maxStreak = 0;
    
    // Enhanced leaderboard with better persistence
    let leaderboard = loadLeaderboardData();
    
    const startButton = document.getElementById('startQuizBtn');
    const quizStart = document.getElementById('quizStart');
    const quizContainer = document.getElementById('quizContainer');
    const quizResult = document.getElementById('quizResult');
    const quizCompleted = document.getElementById('quizCompleted');
    
    // Enhanced localStorage functions
    function loadLeaderboardData() {
        try {
            const stored = localStorage.getItem('dentalQuizLeaderboard_v2');
            if (stored) {
                const data = JSON.parse(stored);
                // Validate data structure
                if (Array.isArray(data)) {
                    return data.filter(player => 
                        player.name && 
                        typeof player.score === 'number' && 
                        player.date
                    );
                }
            }
        } catch (error) {
            console.warn('Error loading leaderboard:', error);
        }
        return [];
    }
    
    function saveLeaderboardData() {
        try {
            // Sort by score descending and keep top 100 players
            leaderboard.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                // If scores are equal, sort by date (newer first)
                return new Date(b.date) - new Date(a.date);
            });
            
            leaderboard = leaderboard.slice(0, 100);
            
            localStorage.setItem('dentalQuizLeaderboard_v2', JSON.stringify(leaderboard));
            
            // Backup to secondary key
            localStorage.setItem('dentalQuizLeaderboard_backup', JSON.stringify({
                data: leaderboard,
                lastUpdate: new Date().toISOString(),
                version: 2
            }));
            
            console.log('✅ Leaderboard saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving leaderboard:', error);
            return false;
        }
    }
    
    function getPlayerStats() {
        return {
            totalGames: leaderboard.filter(p => p.name === playerName).length,
            bestScore: Math.max(...leaderboard.filter(p => p.name === playerName).map(p => p.score), 0),
            averageAccuracy: Math.round(
                leaderboard.filter(p => p.name === playerName)
                    .reduce((sum, p) => sum + p.accuracy, 0) / 
                Math.max(leaderboard.filter(p => p.name === playerName).length, 1)
            )
        };
    }
    
    // Initialize quiz state
    function initializeQuiz() {
        showStartState();
        displayGlobalStats();
        loadLeaderboard();
    }
    
    function displayGlobalStats() {
        let statsContainer = document.getElementById('globalStats');
        
        if (!statsContainer) {
            // Create enhanced stats container with better spacing
            statsContainer = document.createElement('div');
            statsContainer.id = 'globalStats';
            statsContainer.className = 'global-stats-container';
            
            const quizStartContainer = document.getElementById('quizStart');
            if (quizStartContainer) {
                // Add content separator before stats
                const separator = document.createElement('div');
                separator.className = 'content-separator';
                quizStartContainer.appendChild(separator);
                
                quizStartContainer.appendChild(statsContainer);
            }
        }
        
        const totalPlayers = new Set(leaderboard.map(p => p.name)).size;
        const totalGames = leaderboard.length;
        const avgScore = totalGames > 0 ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / totalGames) : 0;
        const topScore = totalGames > 0 ? Math.max(...leaderboard.map(p => p.score)) : 0;
        
        // Enhanced stats with better layout and animations
        statsContainer.innerHTML = `
            <div class="stats-header" style="text-align: center; margin-bottom: 25px;">
            </div>
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
                    <div class="stat-number">${totalPlayers}</div>
                    <div class="stat-label">👥 Total Pemain</div>
                </div>
                <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
                    <div class="stat-number">${totalGames}</div>
                    <div class="stat-label">🎮 Game Dimainkan</div>
                </div>
                <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
                    <div class="stat-number">${avgScore.toLocaleString()}</div>
                    <div class="stat-label">📈 Rata-rata Skor</div>
                </div>
                <div class="stat-card highlight" data-aos="fade-up" data-aos-delay="400">
                    <div class="stat-number">${topScore.toLocaleString()}</div>
                    <div class="stat-label">🏆 Skor Tertinggi</div>
                </div>
            </div>
            ${totalGames > 0 ? `
                <div class="additional-stats" style="margin-top: 25px; text-align: center; padding: 15px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; font-size: 0.9rem; color: #666;">
                        <div>
                            <strong style="color: #4a90e2;">${Math.round((leaderboard.filter(p => p.accuracy >= 80).length / totalGames) * 100)}%</strong><br>
                            <span>Akurasi ≥80%</span>
                        </div>
                        <div>
                            <strong style="color: #28a745;">${leaderboard.filter(p => p.maxStreak >= 5).length}</strong><br>
                            <span>Streak ≥5</span>
                        </div>
                        <div>
                            <strong style="color: #ffc107;">${Math.round(leaderboard.reduce((sum, p) => sum + p.totalTime, 0) / totalGames)}s</strong><br>
                            <span>Rata-rata Waktu</span>
                        </div>
                        <div>
                            <strong style="color: #dc3545;">${new Date(Math.max(...leaderboard.map(p => p.timestamp))).toLocaleDateString('id-ID')}</strong><br>
                            <span>Game Terakhir</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    function showStartState() {
        if (quizStart) quizStart.style.display = 'block';
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResult) quizResult.style.display = 'none';
        if (quizCompleted) quizCompleted.style.display = 'none';
    }
    
    // Enhanced player name input with history
    function promptPlayerName() {
        const recentPlayers = getRecentPlayerNames();
        
        const nameInput = document.createElement('div');
        nameInput.innerHTML = `
            <div style="background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;">
                    <h3 style="margin-bottom: 20px; color: #4a90e2;">Masukkan Nama Kamu 🎮</h3>
                    <input type="text" id="playerNameInput" placeholder="Nama kamu..." 
                           style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px; margin-bottom: 15px; text-align: center;"
                           maxlength="20">
                    ${recentPlayers.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Pemain sebelumnya:</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                                ${recentPlayers.map(name => 
                                    `<button class="recent-player-btn" onclick="selectRecentPlayer('${name}')" 
                                     style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 15px; cursor: pointer; font-size: 12px;">
                                        ${name}
                                     </button>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="cancelNameInput()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 10px; cursor: pointer;">Batal</button>
                        <button onclick="confirmPlayerName()" style="padding: 12px 24px; background: #4a90e2; color: white; border: none; border-radius: 10px; cursor: pointer;">Mulai Kuis</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(nameInput);
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('playerNameInput');
            if (input) {
                input.focus();
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        confirmPlayerName();
                    }
                });
            }
        }, 100);
        
        // Global functions for buttons
        window.confirmPlayerName = function() {
            const input = document.getElementById('playerNameInput');
            const name = input.value.trim();
            if (name.length > 0 && name.length <= 20) {
                playerName = name;
                saveRecentPlayerName(name);
                document.body.removeChild(nameInput);
                startQuiz();
            } else {
                alert('Nama harus diisi dan maksimal 20 karakter!');
                input.focus();
            }
        };
        
        window.selectRecentPlayer = function(name) {
            const input = document.getElementById('playerNameInput');
            if (input) {
                input.value = name;
                input.focus();
            }
        };
        
        window.cancelNameInput = function() {
            document.body.removeChild(nameInput);
        };
    }
    
    function getRecentPlayerNames() {
        try {
            const recent = JSON.parse(localStorage.getItem('recentPlayers') || '[]');
            return recent.slice(0, 5); // Show last 5 players
        } catch {
            return [];
        }
    }
    
    function saveRecentPlayerName(name) {
        try {
            let recent = JSON.parse(localStorage.getItem('recentPlayers') || '[]');
            recent = recent.filter(n => n !== name); // Remove duplicates
            recent.unshift(name); // Add to beginning
            recent = recent.slice(0, 10); // Keep last 10
            localStorage.setItem('recentPlayers', JSON.stringify(recent));
        } catch (error) {
            console.warn('Could not save recent player name:', error);
        }
    }
    
    // Start quiz
    if (startButton) {
        startButton.addEventListener('click', function() {
            promptPlayerName();
        });
    }
    
    function startQuiz() {
        quizStarted = true;
        currentQuestion = 0;
        totalScore = 0;
        answers = [];
        streak = 0;
        maxStreak = 0;
        
        if (quizStart) quizStart.style.display = 'none';
        if (quizContainer) quizContainer.style.display = 'block';
        
        // Add score display
        addScoreDisplay();
        showQuestion();
    }
    
    function addScoreDisplay() {
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'liveScoreDisplay';
        
        const playerStats = getPlayerStats();
        
        scoreDisplay.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #4a90e2; color: white; padding: 15px 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1000; min-width: 220px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold;">🏆 ${playerName}</span>
                    <span style="font-size: 18px; font-weight: bold;" id="currentScore">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; opacity: 0.9; margin-bottom: 5px;">
                    <span>Streak: <span id="currentStreak">0</span></span>
                    <span>Q<span id="questionNumber">1</span>/10</span>
                </div>
                ${playerStats.totalGames > 0 ? `
                    <div style="font-size: 12px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px;">
                        Best: ${playerStats.bestScore.toLocaleString()} | Games: ${playerStats.totalGames}
                    </div>
                ` : ''}
            </div>
        `;
        document.body.appendChild(scoreDisplay);
    }
    
    function updateScoreDisplay() {
        const currentScoreEl = document.getElementById('currentScore');
        const currentStreakEl = document.getElementById('currentStreak');
        const questionNumberEl = document.getElementById('questionNumber');
        
        if (currentScoreEl) currentScoreEl.textContent = totalScore.toLocaleString();
        if (currentStreakEl) {
            currentStreakEl.textContent = streak;
            currentStreakEl.parentElement.style.color = streak > 0 ? '#ffeb3b' : 'rgba(255,255,255,0.9)';
        }
        if (questionNumberEl) questionNumberEl.textContent = currentQuestion + 1;
    }
    
    function showQuestion() {
        const question = quizData[currentQuestion];
        const questionText = document.getElementById('questionText');
        const answersContainer = document.getElementById('answersContainer');
        const currentQuestionSpan = document.getElementById('currentQuestion');
        const totalQuestionsSpan = document.getElementById('totalQuestions');
        const progressBar = document.getElementById('quizProgressBar');
        const nextBtn = document.getElementById('nextBtn');
        
        // Remove any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        if (questionText) {
            questionText.textContent = question.question;
        }
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentQuestion + 1;
        }
        
        if (totalQuestionsSpan) {
            totalQuestionsSpan.textContent = quizData.length;
        }
        
        if (progressBar) {
            const progress = ((currentQuestion + 1) / quizData.length) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // Add timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timerDisplay';
        timerDisplay.innerHTML = `
            <div style="text-align: center; margin: 20px 0;">
                <div style="display: inline-block; background: #ff6b6b; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(255,107,107,0.3);">
                    ⏰ <span id="timeDisplay">${question.timeLimit}</span> detik
                </div>
                <div style="margin-top: 10px; background: #f0f0f0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div id="timeProgress" style="height: 100%; background: linear-gradient(90deg, #4CAF50, #ff6b6b); width: 100%; transition: width 0.1s linear;"></div>
                </div>
            </div>
        `;
        
        if (answersContainer) {
            answersContainer.innerHTML = '';
            answersContainer.appendChild(timerDisplay);
            
            question.options.forEach((option, index) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-option';
                answerDiv.innerHTML = `
                    <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                `;
                
                answerDiv.addEventListener('click', function() {
                    selectAnswer(index, answerDiv);
                });
                
                answersContainer.appendChild(answerDiv);
            });
        }
        
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
        
        // Start timer
        startTimer(question.timeLimit);
        questionStartTime = Date.now();
        updateScoreDisplay();
    }
    
    function startTimer(timeLimit) {
        timeRemaining = timeLimit;
        const timeDisplay = document.getElementById('timeDisplay');
        const timeProgress = document.getElementById('timeProgress');
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            
            if (timeDisplay) {
                timeDisplay.textContent = timeRemaining;
            }
            
            if (timeProgress) {
                const progressPercent = (timeRemaining / timeLimit) * 100;
                timeProgress.style.width = progressPercent + '%';
                
                // Change color based on time remaining
                if (progressPercent < 25) {
                    timeProgress.style.background = '#ff6b6b';
                } else if (progressPercent < 50) {
                    timeProgress.style.background = '#ffa726';
                } else {
                    timeProgress.style.background = 'linear-gradient(90deg, #4CAF50, #ff6b6b)';
                }
            }
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timeUp();
            }
        }, 1000);
    }
    
    function timeUp() {
        const answersContainer = document.getElementById('answersContainer');
        const allOptions = answersContainer.querySelectorAll('.answer-option');
        
        // Disable all options
        allOptions.forEach(option => {
            option.classList.add('disabled');
            option.style.pointerEvents = 'none';
        });
        
        // Show correct answer
        const question = quizData[currentQuestion];
        allOptions.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            }
        });
        
        // Record as incorrect answer
        answers.push({
            question: currentQuestion,
            selected: -1, // -1 indicates timeout
            correct: question.correct,
            isCorrect: false,
            timeUsed: question.timeLimit,
            score: 0
        });
        
        streak = 0; // Reset streak on timeout
        
        showFeedback('⏰ Waktu habis! ' + question.explanation, 'timeout');
        
        // Show next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.onclick = nextQuestion;
        }
        
        updateScoreDisplay();
    }
    
    function selectAnswer(selectedIndex, answerElement) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const question = quizData[currentQuestion];
        const answersContainer = document.getElementById('answersContainer');
        const nextBtn = document.getElementById('nextBtn');
        const timeUsed = (Date.now() - questionStartTime) / 1000;
        
        // Disable all answer options
        const allOptions = answersContainer.querySelectorAll('.answer-option');
        allOptions.forEach(option => {
            option.classList.add('disabled');
            option.style.pointerEvents = 'none';
        });
        
        // Show correct/incorrect answers
        const isCorrect = selectedIndex === question.correct;
        allOptions.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // Calculate score based on time and correctness
        let questionScore = 0;
        if (isCorrect) {
            const timeBonus = Math.max(0, timeRemaining / question.timeLimit);
            const baseScore = 1000;
            const speedBonus = Math.round(baseScore * timeBonus * 0.5);
            questionScore = baseScore + speedBonus;
            
            // Streak bonus
            streak++;
            if (streak > maxStreak) maxStreak = streak;
            
            if (streak >= 3) {
                const streakBonus = Math.min(streak * 50, 500);
                questionScore += streakBonus;
            }
            
            totalScore += questionScore;
        } else {
            streak = 0;
        }
        
        // Store answer
        answers.push({
            question: currentQuestion,
            selected: selectedIndex,
            correct: question.correct,
            isCorrect: isCorrect,
            timeUsed: Math.round(timeUsed * 10) / 10,
            score: questionScore,
            timeRemaining: timeRemaining
        });
        
        if (isCorrect) {
            let message = `🎉 Benar! +${questionScore.toLocaleString()} poin`;
            if (streak >= 3) {
                message += ` (Streak x${streak}!)`;
            }
            message += `\n${question.explanation}`;
            showFeedback(message, 'success');
        } else {
            showFeedback('❌ Salah. ' + question.explanation, 'error');
        }
        
        // Show score animation
        showScoreAnimation(questionScore, isCorrect);
        
        // Show next button
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.onclick = nextQuestion;
        }
        
        updateScoreDisplay();
    }
    
    function showScoreAnimation(score, isCorrect) {
        if (score > 0) {
            const scoreAnim = document.createElement('div');
            scoreAnim.innerHTML = `+${score.toLocaleString()}`;
            scoreAnim.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                font-weight: bold;
                color: ${isCorrect ? '#4CAF50' : '#ff6b6b'};
                z-index: 9999;
                pointer-events: none;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                animation: scoreFloat 2s ease-out forwards;
            `;
            
            document.body.appendChild(scoreAnim);
            
            setTimeout(() => {
                if (document.body.contains(scoreAnim)) {
                    document.body.removeChild(scoreAnim);
                }
            }, 2000);
        }
        
        // Add CSS animation if not exists
        if (!document.querySelector('#score-animation')) {
            const style = document.createElement('style');
            style.id = 'score-animation';
            style.textContent = `
                @keyframes scoreFloat {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -80px) scale(1); opacity: 0; }
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 15px;
                }
                
                .stat-card {
                    text-align: center;
                    padding: 15px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                
                .stat-card:hover {
                    transform: translateY(-3px);
                }
                
                .stat-card.highlight {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    color: white;
                }
                
                .stat-number {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #4a90e2;
                }
                
                .stat-card.highlight .stat-number {
                    color: #ffeb3b;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 5px;
                }
                
                .stat-card.highlight .stat-label {
                    color: rgba(255,255,255,0.9);
                }
                
                .recent-player-btn:hover {
                    background: #e0e0e0 !important;
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`;
        feedback.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            font-weight: 600;
            white-space: pre-line;
            ${type === 'success' ? 
                'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
                type === 'timeout' ?
                'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;' :
                'background: #f8d7da; color: #721c24; border: 1px solid #f1b0b7;'
            }
        `;
        feedback.textContent = message;
        
        const answersContainer = document.getElementById('answersContainer');
        if (answersContainer) {
            answersContainer.appendChild(feedback);
        }
    }
    
    function nextQuestion() {
        currentQuestion++;
        
        if (currentQuestion < quizData.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    }
    
    function finishQuiz() {
        // Clean up timer and score display
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const liveScore = document.getElementById('liveScoreDisplay');
        if (liveScore) {
            document.body.removeChild(liveScore);
        }
        
        // Save to leaderboard with enhanced data
        saveToLeaderboard();
        
        showResults();
    }
    
    function saveToLeaderboard() {
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const totalTime = answers.reduce((sum, answer) => sum + answer.timeUsed, 0);
        const averageTimePerQuestion = totalTime / quizData.length;
        
        const playerResult = {
            name: playerName.trim(),
            score: totalScore,
            correctAnswers: correctAnswers,
            totalQuestions: quizData.length,
            accuracy: Math.round((correctAnswers / quizData.length) * 100),
            totalTime: Math.round(totalTime * 10) / 10,
            averageTime: Math.round(averageTimePerQuestion * 10) / 10,
            maxStreak: maxStreak,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            sessionId: `${playerName}_${Date.now()}`, // Unique session identifier
            detailedAnswers: answers.map(a => ({
                correct: a.isCorrect,
                time: a.timeUsed,
                score: a.score
            }))
        };
        
        // Add to leaderboard
        leaderboard.push(playerResult);
        
        // Save to localStorage with error handling
        const saved = saveLeaderboardData();
        
        if (!saved) {
            // Show warning to user if save failed
            console.warn('⚠️ Skor mungkin tidak tersimpan. Coba lagi nanti.');
        } else {
            console.log('✅ Skor berhasil disimpan ke leaderboard!');
        }
        
        // Try to sync to additional backup if available
        try {
            // You could add cloud sync here in the future
            window.dispatchEvent(new CustomEvent('leaderboardUpdate', { 
                detail: { player: playerResult, totalPlayers: leaderboard.length } 
            }));
        } catch (error) {
            console.log('Additional sync not available');
        }
    }
    
    function showResults() {
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResult) quizResult.style.display = 'block';
        
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const accuracy = Math.round((correctAnswers / quizData.length) * 100);
        const playerStats = getPlayerStats();
        
        // Determine performance level
        let performanceLevel = '';
        let performanceEmoji = '';
        if (accuracy >= 90) {
            performanceLevel = 'Luar Biasa!';
            performanceEmoji = '🏆';
        } else if (accuracy >= 80) {
            performanceLevel = 'Sangat Baik!';
            performanceEmoji = '🥇';
        } else if (accuracy >= 70) {
            performanceLevel = 'Baik!';
            performanceEmoji = '🥈';
        } else if (accuracy >= 60) {
            performanceLevel = 'Cukup Baik';
            performanceEmoji = '🥉';
        } else {
            performanceLevel = 'Perlu Belajar Lagi';
            performanceEmoji = '📚';
        }
        
        // Create comprehensive results display
        const resultContainer = document.querySelector('.result-container') || document.getElementById('quizResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="result-header">
                    <h2>${performanceEmoji} ${performanceLevel}</h2>
                    <p style="color: #666; margin-bottom: 20px;">Hasil Kuis ${playerName}</p>
                    <div class="final-score-display">
                        <div class="score-circle-large">
                            ${totalScore.toLocaleString()}
                            <span class="score-label">POIN</span>
                        </div>
                    </div>
                </div>
                
                <div class="result-stats">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${correctAnswers}/${quizData.length}</div>
                            <div class="stat-label">Benar</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${accuracy}%</div>
                            <div class="stat-label">Akurasi</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${maxStreak}</div>
                            <div class="stat-label">Max Streak</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${answers.reduce((sum, a) => sum + a.timeUsed, 0).toFixed(1)}s</div>
                            <div class="stat-label">Total Waktu</div>
                        </div>
                    </div>
                    
                    ${playerStats.totalGames > 1 ? `
                        <div class="personal-stats">
                            <h4>📊 Statistik Personal</h4>
                            <div class="personal-stats-grid">
                                <div>Game ke-${playerStats.totalGames}</div>
                                <div>Best Score: ${playerStats.bestScore.toLocaleString()}</div>
                                <div>Rata-rata Akurasi: ${playerStats.averageAccuracy}%</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="leaderboard-preview">
                    <h3>🏆 Leaderboard</h3>
                    <div id="leaderboardList"></div>
                    <button onclick="showFullLeaderboard()" class="btn btn-secondary">Lihat Semua Leaderboard</button>
                </div>
                
                <div class="result-actions">
                    <button onclick="location.reload()" class="btn btn-primary">🎮 Main Lagi</button>
                    <button onclick="shareResults()" class="btn btn-secondary">📤 Share Hasil</button>
                    <a href="materi.html" class="btn btn-secondary">📚 Pelajari Lagi</a>
                </div>
            `;
        }
        
        // Load leaderboard preview
        loadLeaderboard();
        
        // Add styles for new elements
        addResultStyles();
        
        // Show celebration for good scores
        if (totalScore >= 8000) {
            setTimeout(createCelebrationEffect, 1000);
        }
    }
    
    function loadLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;
        
        const topPlayers = leaderboard.slice(0, 5);
        const currentPlayerRank = leaderboard.findIndex(p => 
            p.sessionId === `${playerName}_${leaderboard.find(player => player.name === playerName && Math.abs(player.timestamp - Date.now()) < 10000)?.timestamp}`
        ) + 1;
        
        let html = '';
        topPlayers.forEach((player, index) => {
            const isCurrentPlayer = player.name === playerName && Math.abs(player.timestamp - Date.now()) < 10000;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const timeAgo = getTimeAgo(player.timestamp);
            
            html += `
                <div class="leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}">
                    <span class="rank">${medal} #${index + 1}</span>
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="player-time">${timeAgo}</span>
                    </div>
                    <span class="player-score">${player.score.toLocaleString()}</span>
                    <span class="player-accuracy">${player.accuracy}%</span>
                </div>
            `;
        });
        
        // Show current player's rank if not in top 5
        if (currentPlayerRank > 5 && currentPlayerRank <= leaderboard.length) {
            html += `<div class="rank-separator">...</div>`;
            const currentPlayer = leaderboard[currentPlayerRank - 1];
            const timeAgo = getTimeAgo(currentPlayer.timestamp);
            html += `
                <div class="leaderboard-item current-player">
                    <span class="rank">🏅 #${currentPlayerRank}</span>
                    <div class="player-info">
                        <span class="player-name">${currentPlayer.name}</span>
                        <span class="player-time">${timeAgo}</span>
                    </div>
                    <span class="player-score">${currentPlayer.score.toLocaleString()}</span>
                    <span class="player-accuracy">${currentPlayer.accuracy}%</span>
                </div>
            `;
        }
        
        leaderboardList.innerHTML = html;
    }
    
    function getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (diff < 60000) return 'baru saja';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}j`;
        return `${days}h`;
    }
    
    // Share results function
    window.shareResults = function() {
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const accuracy = Math.round((correctAnswers / quizData.length) * 100);
        
        const shareText = `🦷 Quiz Kesehatan Gigi & Mulut\n\n` +
                         `Saya mendapat skor ${totalScore.toLocaleString()} poin! ✨\n` +
                         `Benar ${correctAnswers}/${quizData.length} soal (${accuracy}%)\n` +
                         `Max Streak: ${maxStreak} 🔥\n\n` +
                         `Coba juga kuis ini!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Kesehatan Gigi & Mulut',
                text: shareText,
                url: window.location.href
            }).catch(console.log);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText + '\n' + window.location.href)
                .then(() => {
                    alert('📋 Hasil telah disalin ke clipboard!');
                })
                .catch(() => {
                    // Final fallback: show text
                    prompt('Salin teks ini untuk dibagikan:', shareText + '\n' + window.location.href);
                });
        }
    };
    
    function addResultStyles() {
        if (document.querySelector('#result-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'result-styles';
        style.textContent = `
            .result-header { text-align: center; margin-bottom: 30px; }
            .final-score-display { margin: 20px 0; }
            .score-circle-large {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4a90e2, #357abd);
                color: white;
                font-size: 2rem;
                font-weight: bold;
                box-shadow: 0 8px 25px rgba(74,144,226,0.3);
            }
            .score-label { font-size: 0.8rem; margin-top: 5px; opacity: 0.9; }
            
            .result-stats { margin: 30px 0; }
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 20px;
                max-width: 500px;
                margin: 0 auto 20px auto;
            }
            .stat-item {
                text-align: center;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 2px solid transparent;
                transition: all 0.2s;
            }
            .stat-item:hover {
                border-color: #4a90e2;
                transform: translateY(-2px);
            }
            .stat-value { font-size: 1.5rem; font-weight: bold; color: #4a90e2; }
            .stat-label { font-size: 0.9rem; color: #666; margin-top: 5px; }
            
            .personal-stats {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
            }
            .personal-stats h4 {
                margin: 0 0 10px 0;
                color: #1976d2;
            }
            .personal-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                font-size: 14px;
                color: #424242;
            }
            
            .leaderboard-preview {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
                margin: 30px 0;
            }
            .leaderboard-item {
                display: grid;
                grid-template-columns: auto 1fr auto auto;
                gap: 15px;
                padding: 12px 15px;
                background: white;
                border-radius: 10px;
                margin-bottom: 8px;
                align-items: center;
                transition: transform 0.2s;
            }
            .leaderboard-item:hover { transform: translateY(-2px); }
            .leaderboard-item.current-player {
                background: linear-gradient(135deg, #4a90e2, #357abd);
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(74,144,226,0.3);
            }
            .rank { font-weight: bold; min-width: 60px; }
            .player-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .player-name { font-weight: 600; }
            .player-time { 
                font-size: 12px; 
                opacity: 0.7; 
                color: #999;
            }
            .current-player .player-time {
                color: rgba(255,255,255,0.8);
            }
            .player-score { font-weight: bold; color: #28a745; }
            .current-player .player-score { color: #ffeb3b; }
            .player-accuracy { font-size: 0.9rem; opacity: 0.8; }
            .rank-separator {
                text-align: center;
                color: #999;
                margin: 10px 0;
                font-weight: bold;
            }
            
            .result-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #4a90e2;
                color: white;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    function createCelebrationEffect() {
        // Create multiple confetti bursts
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 15; i++) {
                    const confetti = document.createElement('div');
                    confetti.style.cssText = `
                        position: fixed;
                        width: 10px;
                        height: 10px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        left: ${20 + Math.random() * 60}%;
                        top: -10px;
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 9999;
                        animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
                    `;
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        if (document.body.contains(confetti)) {
                            document.body.removeChild(confetti);
                        }
                    }, 4000);
                }
            }, burst * 500);
        }
        
        // Add confetti animation
        if (!document.querySelector('#confetti-animation')) {
            const style = document.createElement('style');
            style.id = 'confetti-animation';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Global function for full leaderboard modal
    window.showFullLeaderboard = function() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; max-width: 700px; width: 100%; max-height: 80vh; border-radius: 20px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">🏆 Leaderboard Lengkap</h2>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Top ${leaderboard.length} Pemain Terbaik</p>
                        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px; font-size: 14px;">
                            <span>👥 ${new Set(leaderboard.map(p => p.name)).size} Pemain Unik</span>
                            <span>🎮 ${leaderboard.length} Total Game</span>
                        </div>
                    </div>
                    <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                        ${generateFullLeaderboardHTML()}
                    </div>
                    <div style="padding: 20px; text-align: center; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: center;">
                        <button onclick="exportLeaderboard()" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">📊 Export Data</button>
                        <button onclick="closeLeaderboardModal()" style="padding: 12px 24px; background: #4a90e2; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        modal.id = 'leaderboardModal';
        document.body.appendChild(modal);
    };
    
    window.closeLeaderboardModal = function() {
        const modal = document.getElementById('leaderboardModal');
        if (modal) {
            document.body.removeChild(modal);
        }
    };
    
    window.exportLeaderboard = function() {
        const csvContent = generateLeaderboardCSV();
        downloadCSV(csvContent, 'quiz-leaderboard.csv');
    };
    
    function generateLeaderboardCSV() {
        const headers = ['Rank', 'Name', 'Score', 'Accuracy', 'Correct', 'Total', 'Max Streak', 'Total Time', 'Date', 'Session ID'];
        const rows = leaderboard.map((player, index) => [
            index + 1,
            player.name,
            player.score,
            player.accuracy,
            player.correctAnswers,
            player.totalQuestions,
            player.maxStreak,
            player.totalTime,
            new Date(player.date).toLocaleString('id-ID'),
            player.sessionId || 'N/A'
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }
    
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function generateFullLeaderboardHTML() {
        if (leaderboard.length === 0) {
            return '<p style="text-align: center; color: #999; padding: 40px;">Belum ada data leaderboard</p>';
        }
        
        let html = '';
        leaderboard.forEach((player, index) => {
            const isCurrentPlayer = player.name === playerName && Math.abs(player.timestamp - Date.now()) < 15000;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const date = new Date(player.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="leaderboard-item-full ${isCurrentPlayer ? 'current-player' : ''}" style="
                    display: grid;
                    grid-template-columns: 60px 1fr auto auto auto auto;
                    gap: 10px;
                    padding: 12px 15px;
                    background: ${isCurrentPlayer ? 'linear-gradient(135deg, #4a90e2, #357abd)' : '#f8f9fa'};
                    color: ${isCurrentPlayer ? 'white' : 'inherit'};
                    border-radius: 10px;
                    margin-bottom: 8px;
                    align-items: center;
                    font-size: 14px;
                    border-left: 4px solid ${isCurrentPlayer ? '#ffeb3b' : 'transparent'};
                ">
                    <span style="font-weight: bold;">${medal} #${index + 1}</span>
                    <div>
                        <div style="font-weight: 600;">${player.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${date}</div>
                    </div>
                    <span style="font-weight: bold; color: ${isCurrentPlayer ? '#ffeb3b' : '#28a745'};">${player.score.toLocaleString()}</span>
                    <span style="opacity: 0.8;">${player.accuracy}%</span>
                    <span style="opacity: 0.8;">🔥${player.maxStreak}</span>
                    <span style="opacity: 0.8; font-size: 12px;">${player.totalTime}s</span>
                </div>
            `;
        });
        
        return html;
    }
    
    // Add performance insights
    function getPerformanceInsights() {
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const avgTimePerQuestion = answers.reduce((sum, answer) => sum + answer.timeUsed, 0) / answers.length;
        const quickAnswers = answers.filter(answer => answer.timeUsed < 5 && answer.isCorrect).length;
        
        let insights = [];
        
        if (correctAnswers >= 8) {
            insights.push("🎯 Penguasaan materi sangat baik!");
        } else if (correctAnswers >= 6) {
            insights.push("👍 Pemahaman cukup solid, tingkatkan lagi!");
        } else {
            insights.push("📚 Perlu belajar lebih banyak lagi.");
        }
        
        if (maxStreak >= 5) {
            insights.push("🔥 Streak luar biasa! Konsistensi tinggi!");
        } else if (maxStreak >= 3) {
            insights.push("⚡ Streak bagus, pertahankan fokus!");
        }
        
        if (avgTimePerQuestion < 6) {
            insights.push("⚡ Respon sangat cepat!");
        } else if (avgTimePerQuestion > 12) {
            insights.push("🤔 Pertimbangkan jawaban dengan teliti.");
        }
        
        if (quickAnswers >= 3) {
            insights.push("🚀 Refleks jawaban cepat dan tepat!");
        }
        
        if (totalScore >= 10000) {
            insights.push("🏆 Skor fantastis! Kamu adalah master!");
        } else if (totalScore >= 8000) {
            insights.push("⭐ Skor excellent! Hampir sempurna!");
        } else if (totalScore >= 6000) {
            insights.push("👏 Skor bagus! Terus tingkatkan!");
        }
        
        return insights;
    }
    
    // Add detailed question review
    function showQuestionReview() {
        const reviewButton = document.createElement('button');
        reviewButton.textContent = '📊 Review Jawaban';
        reviewButton.className = 'btn btn-secondary';
        reviewButton.style.margin = '10px';
        reviewButton.onclick = function() {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <div style="background: white; max-width: 800px; width: 100%; max-height: 80vh; border-radius: 20px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 20px;">
                            <h2 style="margin: 0;">📊 Review Jawaban Lengkap</h2>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Analisis performa per soal</p>
                        </div>
                        <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                            ${generateQuestionReviewHTML()}
                        </div>
                        <div style="padding: 20px; text-align: center; border-top: 1px solid #eee;">
                            <button onclick="closeQuestionReview()" style="padding: 12px 24px; background: #4a90e2; color: white; border: none; border-radius: 10px; cursor: pointer;">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            modal.id = 'questionReviewModal';
            document.body.appendChild(modal);
        };
        
       // Enhanced Quiz functionality with improved localStorage persistence (continued)

        const resultActions = document.querySelector('.result-actions');
        if (resultActions) {
            resultActions.appendChild(reviewButton);
        }
    }
    
    window.closeQuestionReview = function() {
        const modal = document.getElementById('questionReviewModal');
        if (modal) {
            document.body.removeChild(modal);
        }
    };
    
    function generateQuestionReviewHTML() {
        let html = '';
        answers.forEach((answer, index) => {
            const question = quizData[answer.question];
            const isCorrect = answer.isCorrect;
            const selectedText = answer.selected === -1 ? 'Waktu Habis' : question.options[answer.selected];
            const timePerformance = answer.timeUsed < 5 ? 'Sangat Cepat' : 
                                  answer.timeUsed < 8 ? 'Cepat' : 
                                  answer.timeUsed < 12 ? 'Normal' : 'Lambat';
            
            html += `
                <div style="border: 2px solid ${isCorrect ? '#28a745' : '#dc3545'}; border-radius: 10px; margin-bottom: 15px; overflow: hidden;">
                    <div style="background: ${isCorrect ? '#d4edda' : '#f8d7da'}; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                            <strong>Soal ${index + 1}</strong>
                            <div style="display: flex; gap: 15px; font-size: 14px; flex-wrap: wrap;">
                                <span>${isCorrect ? '✅ Benar' : '❌ Salah'}</span>
                                <span>⏱️ ${answer.timeUsed}s (${timePerformance})</span>
                                <span>🎯 +${answer.score.toLocaleString()}</span>
                                ${answer.timeRemaining > 0 ? `<span>⚡ Sisa ${answer.timeRemaining}s</span>` : ''}
                            </div>
                        </div>
                        <p style="margin: 0; font-weight: 600;">${question.question}</p>
                    </div>
                    <div style="padding: 15px;">
                        <div style="margin-bottom: 10px;">
                            <strong>Jawaban Kamu:</strong> 
                            <span style="color: ${isCorrect ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                ${selectedText}
                            </span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong>Jawaban Benar:</strong> 
                            <span style="color: #28a745; font-weight: bold;">
                                ${question.options[question.correct]}
                            </span>
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px;">
                            <strong>Penjelasan:</strong> ${question.explanation}
                        </div>
                        ${!isCorrect ? `
                            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; font-size: 14px; margin-top: 10px; border-left: 4px solid #ffc107;">
                                <strong>💡 Tips:</strong> ${getQuestionTip(answer.question)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    function getQuestionTip(questionIndex) {
        const tips = [
            "Ingat, sikat gigi 2 kali sehari adalah standar medis yang direkomendasikan dokter gigi di seluruh dunia.",
            "Durasi 2 menit sangat penting karena dibutuhkan waktu minimal tersebut untuk membersihkan semua permukaan gigi secara menyeluruh.",
            "Gigi belakang sering diabaikan, padahal area ini rentan berlubang karena bentuknya yang bercelah dan sulit dijangkau.",
            "Bakteri plak dapat merusak enamel gigi dalam waktu singkat jika tidak dibersihkan secara rutin.",
            "Kalsium dalam susu membantu remineralisasi gigi dan memperkuat struktur gigi yang telah terkikis asam.",
            "Bulu sikat yang sudah melebar tidak efektif membersihkan dan bahkan bisa melukai gusi.",
            "Gerakan memutar membantu mengangkat plak tanpa mengikis enamel gigi seperti gerakan maju-mundur yang kasar.",
            "Berkumur membantu menetralisir asam dan membersihkan sisa makanan yang tidak terjangkau sikat gigi.",
            "Fluoride dalam pasta gigi adalah mineral penting yang mencegah kerusakan gigi dan memperkuat enamel.",
            "Pemeriksaan rutin membantu deteksi dini masalah gigi sebelum menjadi parah dan mahal untuk diobati."
        ];
        return tips[questionIndex] || "Terus belajar tentang kesehatan gigi dan mulut untuk hidup yang lebih sehat!";
    }
    
    // Advanced leaderboard management functions
    function clearOldLeaderboardData() {
        try {
            // Remove old version data
            localStorage.removeItem('quizLeaderboard');
            console.log('📝 Cleaned up old leaderboard data');
        } catch (error) {
            console.warn('Could not clean old data:', error);
        }
    }
    
    function validateLeaderboardData() {
        try {
            const stored = localStorage.getItem('dentalQuizLeaderboard_v2');
            if (!stored) return false;
            
            const data = JSON.parse(stored);
            if (!Array.isArray(data)) return false;
            
            // Check if data structure is valid
            const sampleItem = data[0];
            if (!sampleItem) return true; // Empty array is valid
            
            const requiredFields = ['name', 'score', 'correctAnswers', 'totalQuestions', 'accuracy', 'date', 'timestamp'];
            return requiredFields.every(field => sampleItem.hasOwnProperty(field));
        } catch (error) {
            console.warn('Leaderboard data validation failed:', error);
            return false;
        }
    }
    
    function getLeaderboardStats() {
        if (leaderboard.length === 0) return null;
        
        const scores = leaderboard.map(p => p.score);
        const accuracies = leaderboard.map(p => p.accuracy);
        
        return {
            totalPlayers: new Set(leaderboard.map(p => p.name)).size,
            totalGames: leaderboard.length,
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            averageAccuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
            perfectScores: leaderboard.filter(p => p.accuracy === 100).length,
            recentGames: leaderboard.filter(p => Date.now() - p.timestamp < 86400000).length // Last 24 hours
        };
    }
    
    // Backup and restore functions
    function createLeaderboardBackup() {
        try {
            const backupData = {
                version: 2,
                timestamp: Date.now(),
                date: new Date().toISOString(),
                data: leaderboard,
                stats: getLeaderboardStats()
            };
            
            const backupString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([backupString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            console.log('✅ Backup created successfully');
        } catch (error) {
            console.error('❌ Failed to create backup:', error);
        }
    }
    
    function restoreLeaderboardBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (backupData.version && backupData.data && Array.isArray(backupData.data)) {
                        leaderboard = backupData.data;
                        saveLeaderboardData();
                        console.log('✅ Backup restored successfully');
                        resolve(backupData);
                    } else {
                        reject(new Error('Invalid backup file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
    
    // Add admin functions for development/testing
    function addAdminControls() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const adminPanel = document.createElement('div');
            adminPanel.id = 'adminPanel';
            adminPanel.innerHTML = `
                <div style="position: fixed; bottom: 20px; left: 20px; background: #333; color: white; padding: 15px; border-radius: 10px; font-size: 12px; z-index: 9999;">
                    <strong>🔧 Admin Panel</strong><br>
                    <button onclick="window.quizAdmin.clearData()" style="margin: 5px 2px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Clear All</button>
                    <button onclick="window.quizAdmin.addTestData()" style="margin: 5px 2px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Add Test Data</button>
                    <button onclick="window.quizAdmin.exportData()" style="margin: 5px 2px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Export</button>
                    <button onclick="window.quizAdmin.showStats()" style="margin: 5px 2px; padding: 5px 10px; background: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer;">Stats</button>
                </div>
            `;
            document.body.appendChild(adminPanel);
        }
    }
    
    // Initialize quiz when page loads
    function initializeQuiz() {
        // Clean up old data first
        clearOldLeaderboardData();
        
        // Validate current data
        if (!validateLeaderboardData()) {
            console.warn('⚠️ Invalid leaderboard data detected, resetting...');
            leaderboard = [];
            saveLeaderboardData();
        }
        
        showStartState();
        displayGlobalStats();
        loadLeaderboard();
        
        // Add admin controls in development
        addAdminControls();
        
        console.log('🚀 Enhanced Quiz System initialized!');
        console.log('📊 Current leaderboard:', leaderboard.length, 'entries');
    }
    
    // Add question review button after showing results
    const originalShowResults = showResults;
    showResults = function() {
        originalShowResults();
        setTimeout(() => {
            showQuestionReview();
            
            // Add performance insights
            const insights = getPerformanceInsights();
            if (insights.length > 0) {
                const insightsDiv = document.createElement('div');
                insightsDiv.innerHTML = `
                    <div style="background: #e3f2fd; border-radius: 15px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #1976d2; margin-bottom: 15px;">💡 Insight Performa</h3>
                        ${insights.map(insight => `<p style="margin: 8px 0; color: #424242;">• ${insight}</p>`).join('')}
                    </div>
                `;
                
                const resultContainer = document.querySelector('.result-container');
                const resultActions = document.querySelector('.result-actions');
                if (resultContainer && resultActions) {
                    resultContainer.insertBefore(insightsDiv, resultActions);
                }
            }
            
            // Add comparison with previous attempts
            addPersonalComparison();
        }, 500);
    };
    
    function addPersonalComparison() {
        const playerGames = leaderboard.filter(p => p.name === playerName);
        if (playerGames.length > 1) {
            const previousGames = playerGames.slice(0, -1); // Exclude current game
            const previousBest = Math.max(...previousGames.map(p => p.score));
            const previousAvg = Math.round(previousGames.reduce((sum, p) => sum + p.score, 0) / previousGames.length);
            
            const currentScore = totalScore;
            const improvement = currentScore - previousBest;
            const avgImprovement = currentScore - previousAvg;
            
            const comparisonDiv = document.createElement('div');
            comparisonDiv.innerHTML = `
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin: 20px 0; border-left: 4px solid #4a90e2;">
                    <h3 style="color: #4a90e2; margin-bottom: 15px;">📈 Perbandingan Personal</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: ${improvement > 0 ? '#28a745' : improvement < 0 ? '#dc3545' : '#6c757d'};">
                                ${improvement > 0 ? '+' : ''}${improvement.toLocaleString()}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">vs Best Score</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: ${avgImprovement > 0 ? '#28a745' : avgImprovement < 0 ? '#dc3545' : '#6c757d'};">
                                ${avgImprovement > 0 ? '+' : ''}${avgImprovement.toLocaleString()}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">vs Average</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: #4a90e2;">
                                ${playerGames.length}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">Total Attempts</div>
                        </div>
                    </div>
                    ${improvement > 500 ? '<p style="color: #28a745; margin-top: 15px; font-weight: bold;">🎉 New Personal Best! Excellent improvement!</p>' : ''}
                    ${improvement < -200 ? '<p style="color: #dc3545; margin-top: 15px;">📚 Practice makes perfect! Review the material and try again.</p>' : ''}
                </div>
            `;
            
            const resultContainer = document.querySelector('.result-container');
            const leaderboardPreview = document.querySelector('.leaderboard-preview');
            if (resultContainer && leaderboardPreview) {
                resultContainer.insertBefore(comparisonDiv, leaderboardPreview);
            }
        }
    }
    
    // Export quiz data for debugging and analytics
    window.quizAdmin = {
        data: quizData,
        leaderboard: leaderboard,
        currentState: {
            question: currentQuestion,
            score: totalScore,
            streak: streak,
            player: playerName
        },
        
        clearData: function() {
            if (confirm('⚠️ Hapus SEMUA data leaderboard? Tindakan ini tidak dapat dibatalkan!')) {
                localStorage.removeItem('dentalQuizLeaderboard_v2');
                localStorage.removeItem('dentalQuizLeaderboard_backup');
                localStorage.removeItem('recentPlayers');
                leaderboard = [];
                console.log('🗑️ All data cleared!');
                location.reload();
            }
        },
        
        addTestData: function() {
            const testPlayers = [
                { name: 'Dr. Gigi', score: 12500, accuracy: 100, maxStreak: 10 },
                { name: 'Student A', score: 8750, accuracy: 90, maxStreak: 7 },
                { name: 'Student B', score: 7200, accuracy: 80, maxStreak: 5 },
                { name: 'Newbie', score: 5500, accuracy: 70, maxStreak: 3 }
            ];
            
            testPlayers.forEach((player, index) => {
                const testData = {
                    name: player.name,
                    score: player.score,
                    correctAnswers: Math.round(player.accuracy / 10),
                    totalQuestions: 10,
                    accuracy: player.accuracy,
                    totalTime: 45 + Math.random() * 30,
                    averageTime: 4.5 + Math.random() * 3,
                    maxStreak: player.maxStreak,
                    date: new Date(Date.now() - (index * 3600000)).toISOString(),
                    timestamp: Date.now() - (index * 3600000),
                    sessionId: `${player.name}_${Date.now() - (index * 3600000)}`,
                    detailedAnswers: Array(10).fill().map(() => ({
                        correct: Math.random() < (player.accuracy / 100),
                        time: 3 + Math.random() * 8,
                        score: Math.random() < (player.accuracy / 100) ? 1000 + Math.random() * 500 : 0
                    }))
                };
                leaderboard.push(testData);
            });
            
            saveLeaderboardData();
            console.log('✅ Test data added!');
            location.reload();
        },
        
        exportData: function() {
            createLeaderboardBackup();
        },
        
        showStats: function() {
            const stats = getLeaderboardStats();
            console.log('📊 Leaderboard Statistics:', stats);
            
            if (stats) {
                alert(`📊 Quiz Statistics:
                
Total Players: ${stats.totalPlayers}
Total Games: ${stats.totalGames}
Average Score: ${stats.averageScore.toLocaleString()}
Highest Score: ${stats.highestScore.toLocaleString()}
Perfect Scores: ${stats.perfectScores}
Games Today: ${stats.recentGames}
Average Accuracy: ${stats.averageAccuracy}%`);
            } else {
                alert('No data available yet!');
            }
        },
        
        getCurrentPlayer: function() {
            return {
                name: playerName,
                currentScore: totalScore,
                currentQuestion: currentQuestion + 1,
                streak: streak,
                answers: answers
            };
        },
        
        simulate: function(playerName, targetScore = 8000) {
            // Simulate a quiz session for testing
            const simulatedAnswers = [];
            let simulatedScore = 0;
            let simulatedStreak = 0;
            let maxSimulatedStreak = 0;
            
            for (let i = 0; i < quizData.length; i++) {
                const isCorrect = Math.random() < (targetScore / 12000); // Probability based on target score
                const timeUsed = 3 + Math.random() * 10;
                const questionScore = isCorrect ? 1000 + Math.random() * 500 : 0;
                
                if (isCorrect) {
                    simulatedStreak++;
                    if (simulatedStreak > maxSimulatedStreak) maxSimulatedStreak = simulatedStreak;
                } else {
                    simulatedStreak = 0;
                }
                
                simulatedScore += questionScore;
                simulatedAnswers.push({
                    question: i,
                    selected: isCorrect ? quizData[i].correct : (quizData[i].correct + 1) % 4,
                    correct: quizData[i].correct,
                    isCorrect: isCorrect,
                    timeUsed: Math.round(timeUsed * 10) / 10,
                    score: questionScore
                });
            }
            
            const simulatedResult = {
                name: playerName,
                score: Math.round(simulatedScore),
                correctAnswers: simulatedAnswers.filter(a => a.isCorrect).length,
                totalQuestions: quizData.length,
                accuracy: Math.round((simulatedAnswers.filter(a => a.isCorrect).length / quizData.length) * 100),
                totalTime: Math.round(simulatedAnswers.reduce((sum, a) => sum + a.timeUsed, 0) * 10) / 10,
                maxStreak: maxSimulatedStreak,
                date: new Date().toISOString(),
                timestamp: Date.now(),
                sessionId: `${playerName}_${Date.now()}_sim`,
                detailedAnswers: simulatedAnswers
            };
            
            leaderboard.push(simulatedResult);
            saveLeaderboardData();
            
            console.log('🤖 Simulated session for', playerName, ':', simulatedResult);
            return simulatedResult;
        }
    };
    
    // Initialize the enhanced quiz system
    initializeQuiz();
    
    // Add event listeners for data persistence
    window.addEventListener('beforeunload', function() {
        // Save any pending data before page unloads
        if (quizStarted && !document.getElementById('quizResult')) {
            // Save incomplete quiz data for potential recovery
            try {
                const incompleteData = {
                    player: playerName,
                    currentQuestion: currentQuestion,
                    score: totalScore,
                    answers: answers,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('incompleteQuiz', JSON.stringify(incompleteData));
            } catch (error) {
                console.warn('Could not save incomplete quiz data');
            }
        }
    });
    
    // Check for incomplete quiz on load
    try {
        const incompleteQuiz = sessionStorage.getItem('incompleteQuiz');
        if (incompleteQuiz) {
            const data = JSON.parse(incompleteQuiz);
            // Check if data is recent (within 1 hour)
            if (Date.now() - data.timestamp < 3600000) {
                if (confirm(`🔄 Anda memiliki kuis yang belum selesai sebagai "${data.player}". Lanjutkan?`)) {
                    // Restore quiz state (you can implement this based on your needs)
                    console.log('Incomplete quiz found:', data);
                }
            }
            // Clear the incomplete data
            sessionStorage.removeItem('incompleteQuiz');
        }
    } catch (error) {
        console.warn('Could not check for incomplete quiz');
    }
    
    // Add periodic backup every 5 minutes if quiz is active
    let backupInterval;
    function startPeriodicBackup() {
        backupInterval = setInterval(() => {
            if (quizStarted) {
                saveLeaderboardData();
                console.log('🔄 Periodic backup completed');
            }
        }, 300000); // 5 minutes
    }
    
    function stopPeriodicBackup() {
        if (backupInterval) {
            clearInterval(backupInterval);
        }
    }
    
    // Start periodic backup when quiz starts
    const originalStartQuiz = startQuiz;
    startQuiz = function() {
        originalStartQuiz();
        startPeriodicBackup();
    };
    
    // Stop periodic backup when quiz ends
    const originalFinishQuiz = finishQuiz;
    finishQuiz = function() {
        stopPeriodicBackup();
        originalFinishQuiz();
    };
    
    console.log('🎮 Enhanced Quiz System with Persistent Leaderboard Ready!');
    console.log('💾 Features: Auto-save, Backup/Restore, Personal Stats, Performance Analytics');
    console.log('🔧 Developer tools available in window.quizAdmin');
});