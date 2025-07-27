// Quiz functionality with Quizizz-style scoring, leaderboard, and timer
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
    
    // Leaderboard data
    let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
    
    const startButton = document.getElementById('startQuizBtn');
    const quizStart = document.getElementById('quizStart');
    const quizContainer = document.getElementById('quizContainer');
    const quizResult = document.getElementById('quizResult');
    const quizCompleted = document.getElementById('quizCompleted');
    
    // Initialize quiz state
    function initializeQuiz() {
        // Remove the no-repeat restriction for leaderboard-style quiz
        showStartState();
        loadLeaderboard();
    }
    
    function showStartState() {
        if (quizStart) quizStart.style.display = 'block';
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResult) quizResult.style.display = 'none';
        if (quizCompleted) quizCompleted.style.display = 'none';
    }
    
    // Player name input
    function promptPlayerName() {
        const nameInput = document.createElement('div');
        nameInput.innerHTML = `
            <div style="background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;">
                    <h3 style="margin-bottom: 20px; color: #4a90e2;">Masukkan Nama Kamu 🎮</h3>
                    <input type="text" id="playerNameInput" placeholder="Nama kamu..." 
                           style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px; margin-bottom: 20px; text-align: center;">
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
                document.body.removeChild(nameInput);
                startQuiz();
            } else {
                alert('Nama harus diisi dan maksimal 20 karakter!');
                input.focus();
            }
        };
        
        window.cancelNameInput = function() {
            document.body.removeChild(nameInput);
        };
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
        scoreDisplay.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #4a90e2; color: white; padding: 15px 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1000; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold;">🏆 ${playerName}</span>
                    <span style="font-size: 18px; font-weight: bold;" id="currentScore">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; opacity: 0.9;">
                    <span>Streak: <span id="currentStreak">0</span></span>
                    <span>Q<span id="questionNumber">1</span>/10</span>
                </div>
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
        
        // Save to leaderboard
        saveToLeaderboard();
        
        showResults();
    }
    
    function saveToLeaderboard() {
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const totalTime = answers.reduce((sum, answer) => sum + answer.timeUsed, 0);
        
        const playerResult = {
            name: playerName,
            score: totalScore,
            correctAnswers: correctAnswers,
            totalQuestions: quizData.length,
            accuracy: Math.round((correctAnswers / quizData.length) * 100),
            totalTime: Math.round(totalTime),
            maxStreak: maxStreak,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Add to leaderboard
        leaderboard.push(playerResult);
        
        // Sort by score (descending) and keep top 50
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 50);
        
        // Save to localStorage
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
    }
    
    function showResults() {
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResult) quizResult.style.display = 'block';
        
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const accuracy = Math.round((correctAnswers / quizData.length) * 100);
        
        // Create comprehensive results display
        const resultContainer = document.querySelector('.result-container') || document.getElementById('quizResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="result-header">
                    <h2>🎉 Hasil Kuis ${playerName}!</h2>
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
                    </div>
                </div>
                
                <div class="leaderboard-preview">
                    <h3>🏆 Leaderboard</h3>
                    <div id="leaderboardList"></div>
                    <button onclick="showFullLeaderboard()" class="btn btn-secondary">Lihat Semua</button>
                </div>
                
                <div class="result-actions">
                    <button onclick="location.reload()" class="btn btn-primary">Main Lagi</button>
                    <a href="materi.html" class="btn btn-secondary">Pelajari Lagi</a>
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
            p.name === playerName && Math.abs(p.timestamp - Date.now()) < 5000
        ) + 1;
        
        let html = '';
        topPlayers.forEach((player, index) => {
            const isCurrentPlayer = player.name === playerName && Math.abs(player.timestamp - Date.now()) < 5000;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            
            html += `
                <div class="leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}">
                    <span class="rank">${medal} #${index + 1}</span>
                    <span class="player-name">${player.name}</span>
                    <span class="player-score">${player.score.toLocaleString()}</span>
                    <span class="player-accuracy">${player.accuracy}%</span>
                </div>
            `;
        });
        
        // Show current player's rank if not in top 5
        if (currentPlayerRank > 5 && currentPlayerRank <= leaderboard.length) {
            html += `<div class="rank-separator">...</div>`;
            const currentPlayer = leaderboard[currentPlayerRank - 1];
            html += `
                <div class="leaderboard-item current-player">
                    <span class="rank">🏅 #${currentPlayerRank}</span>
                    <span class="player-name">${currentPlayer.name}</span>
                    <span class="player-score">${currentPlayer.score.toLocaleString()}</span>
                    <span class="player-accuracy">${currentPlayer.accuracy}%</span>
                </div>
            `;
        }
        
        leaderboardList.innerHTML = html;
    }
    
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
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                max-width: 400px;
                margin: 0 auto;
            }
            .stat-item {
                text-align: center;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 15px;
            }
            .stat-value { font-size: 1.5rem; font-weight: bold; color: #4a90e2; }
            .stat-label { font-size: 0.9rem; color: #666; margin-top: 5px; }
            
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
            .player-name { font-weight: 600; }
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
                <div style="background: white; max-width: 600px; width: 100%; max-height: 80vh; border-radius: 20px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">🏆 Leaderboard Lengkap</h2>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Top ${leaderboard.length} Pemain Terbaik</p>
                    </div>
                    <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                        ${generateFullLeaderboardHTML()}
                    </div>
                    <div style="padding: 20px; text-align: center; border-top: 1px solid #eee;">
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
    
    function generateFullLeaderboardHTML() {
        if (leaderboard.length === 0) {
            return '<p style="text-align: center; color: #999; padding: 40px;">Belum ada data leaderboard</p>';
        }
        
        let html = '';
        leaderboard.forEach((player, index) => {
            const isCurrentPlayer = player.name === playerName && Math.abs(player.timestamp - Date.now()) < 10000;
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
                    grid-template-columns: 50px 1fr auto auto auto;
                    gap: 10px;
                    padding: 12px 15px;
                    background: ${isCurrentPlayer ? 'linear-gradient(135deg, #4a90e2, #357abd)' : '#f8f9fa'};
                    color: ${isCurrentPlayer ? 'white' : 'inherit'};
                    border-radius: 10px;
                    margin-bottom: 8px;
                    align-items: center;
                    font-size: 14px;
                ">
                    <span style="font-weight: bold;">${medal} #${index + 1}</span>
                    <div>
                        <div style="font-weight: 600;">${player.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${date}</div>
                    </div>
                    <span style="font-weight: bold; color: ${isCurrentPlayer ? '#ffeb3b' : '#28a745'};">${player.score.toLocaleString()}</span>
                    <span style="opacity: 0.8;">${player.accuracy}%</span>
                    <span style="opacity: 0.8;">🔥${player.maxStreak}</span>
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
            
            html += `
                <div style="border: 2px solid ${isCorrect ? '#28a745' : '#dc3545'}; border-radius: 10px; margin-bottom: 15px; overflow: hidden;">
                    <div style="background: ${isCorrect ? '#d4edda' : '#f8d7da'}; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong>Soal ${index + 1}</strong>
                            <div style="display: flex; gap: 15px; font-size: 14px;">
                                <span>${isCorrect ? '✅' : '❌'}</span>
                                <span>⏱️ ${answer.timeUsed}s</span>
                                <span>🎯 +${answer.score.toLocaleString()}</span>
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
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    // Initialize quiz when page loads
    initializeQuiz();
    
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
        }, 500);
    };
    
    // Export quiz data for debugging (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.quizDebug = {
            data: quizData,
            leaderboard: leaderboard,
            currentState: {
                question: currentQuestion,
                score: totalScore,
                streak: streak
            },
            clearLeaderboard: function() {
                if (confirm('Hapus semua data leaderboard?')) {
                    localStorage.removeItem('quizLeaderboard');
                    leaderboard = [];
                    console.log('Leaderboard cleared!');
                }
            },
            simulateHighScore: function() {
                const fakeData = {
                    name: 'Test Player',
                    score: 12000,
                    correctAnswers: 10,
                    totalQuestions: 10,
                    accuracy: 100,
                    totalTime: 45,
                    maxStreak: 10,
                    date: new Date().toISOString(),
                    timestamp: Date.now()
                };
                leaderboard.unshift(fakeData);
                localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
                console.log('High score added to leaderboard!');
            }
        };
        
        console.log('🎮 Advanced Quiz System loaded!');
        console.log('Features: Timer, Speed Bonus, Streak System, Leaderboard');
        console.log('Debug functions available in window.quizDebug');
    }
    
    console.log('🚀 Quiz system with leaderboard initialized!');
});