// Enhanced Quiz dengan Supabase untuk Vercel deployment
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase configuration (ganti dengan URL dan Key Anda)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // Quiz data
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
            options: ["Permen", "Coklat", "Supabase", "Minuman bersoda"],
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
    let playerName = 'ReyhanZidany';
    let streak = 0;
    let maxStreak = 0;
    let isOnline = navigator.onLine;
    let realtimeSubscription = null;
    
    // Local storage sebagai backup
    let localLeaderboard = loadLocalLeaderboard();
    let cloudLeaderboard = [];
    
    // Connection monitoring
    window.addEventListener('online', () => {
        isOnline = true;
        syncWithSupabase();
        showConnectionStatus('✅ Online - Data tersinkronisasi');
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        showConnectionStatus('⚠️ Offline - Menggunakan data lokal');
    });
    
    // Generate unique IDs
    function getDeviceId() {
        let deviceId = localStorage.getItem('deviceId_v2');
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId_v2', deviceId);
        }
        return deviceId;
    }
    
    function generateSessionId() {
        return `${playerName}_${Date.now()}_${getDeviceId()}`;
    }
    
    // Supabase operations
    async function saveToSupabase(playerResult) {
        if (!isOnline) {
            console.log('📱 Offline: Saving to local only');
            return { success: false, offline: true };
        }
        
        try {
            showSyncStatus('info', '💾 Menyimpan ke cloud...');
            
            const supabaseData = {
                name: playerResult.name,
                score: playerResult.score,
                correct_answers: playerResult.correctAnswers,
                total_questions: playerResult.totalQuestions,
                accuracy: playerResult.accuracy,
                total_time: playerResult.totalTime,
                average_time: playerResult.averageTime,
                max_streak: playerResult.maxStreak,
                session_id: playerResult.sessionId,
                device_id: getDeviceId(),
                user_agent: navigator.userAgent.substr(0, 500),
                detailed_answers: playerResult.detailedAnswers,
                metadata: {
                    ...playerResult.metadata,
                    completed_at: '2025-07-27 17:38:07',
                    quiz_version: '3.0',
                    platform: 'vercel',
                    sync_method: 'supabase'
                }
            };
            
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([supabaseData])
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Saved to Supabase:', data.id);
            showSyncStatus('success', '✅ Skor tersimpan di cloud!');
            
            return { success: true, data: data };
            
        } catch (error) {
            console.error('❌ Supabase save error:', error);
            showSyncStatus('error', '❌ Gagal save ke cloud');
            return { success: false, error: error.message };
        }
    }
    
    async function loadFromSupabase() {
        if (!isOnline) {
            console.log('📱 Offline: Using local data');
            return localLeaderboard;
        }
        
        try {
            showSyncStatus('info', '📥 Loading data dari cloud...');
            
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (error) {
                throw error;
            }
            
            // Transform Supabase data ke format aplikasi
            const transformedData = data.map(item => ({
                id: item.id,
                name: item.name,
                score: item.score,
                correctAnswers: item.correct_answers,
                totalQuestions: item.total_questions,
                accuracy: item.accuracy,
                totalTime: item.total_time,
                averageTime: item.average_time,
                maxStreak: item.max_streak,
                sessionId: item.session_id,
                deviceId: item.device_id,
                date: item.created_at,
                timestamp: new Date(item.created_at).getTime(),
                detailedAnswers: item.detailed_answers,
                metadata: item.metadata,
                isFromCloud: true
            }));
            
            console.log(`✅ Loaded ${transformedData.length} scores from Supabase`);
            showSyncStatus('success', `✅ Loaded ${transformedData.length} cloud scores`);
            
            // Merge dengan local data
            cloudLeaderboard = transformedData;
            const mergedData = mergeLeaderboards(localLeaderboard, transformedData);
            
            // Update local storage
            saveLocalLeaderboard(mergedData);
            
            return mergedData;
            
        } catch (error) {
            console.error('❌ Supabase load error:', error);
            showSyncStatus('error', '❌ Gagal load cloud data');
            return localLeaderboard;
        }
    }
    
    // Real-time subscription untuk live updates
    function setupRealtimeSubscription() {
        if (!isOnline) return;
        
        try {
            // Unsubscribe existing subscription
            if (realtimeSubscription) {
                realtimeSubscription.unsubscribe();
            }
            
            realtimeSubscription = supabase
                .channel('leaderboard_changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'leaderboard'
                    },
                    (payload) => {
                        console.log('🔔 New score added:', payload.new);
                        
                        // Transform dan add ke local leaderboard
                        const newScore = {
                            id: payload.new.id,
                            name: payload.new.name,
                            score: payload.new.score,
                            correctAnswers: payload.new.correct_answers,
                            totalQuestions: payload.new.total_questions,
                            accuracy: payload.new.accuracy,
                            totalTime: payload.new.total_time,
                            averageTime: payload.new.average_time,
                            maxStreak: payload.new.max_streak,
                            sessionId: payload.new.session_id,
                            deviceId: payload.new.device_id,
                            date: payload.new.created_at,
                            timestamp: new Date(payload.new.created_at).getTime(),
                            detailedAnswers: payload.new.detailed_answers,
                            metadata: payload.new.metadata,
                            isFromCloud: true,
                            isNew: true
                        };
                        
                        // Add to leaderboard if not exists
                        const exists = localLeaderboard.find(item => 
                            item.sessionId === newScore.sessionId
                        );
                        
                        if (!exists) {
                            localLeaderboard.unshift(newScore);
                            localLeaderboard.sort((a, b) => {
                                if (b.score !== a.score) return b.score - a.score;
                                return new Date(b.date) - new Date(a.date);
                            });
                            localLeaderboard = localLeaderboard.slice(0, 100);
                            
                            saveLocalLeaderboard(localLeaderboard);
                            
                            // Update display if visible
                            const leaderboardList = document.getElementById('leaderboardList');
                            if (leaderboardList && leaderboardList.offsetParent !== null) {
                                loadLeaderboard();
                            }
                            
                            // Show notification for new scores (not from current user)
                            if (newScore.deviceId !== getDeviceId()) {
                                showNewScoreNotification(newScore);
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Realtime status:', status);
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Real-time subscribed');
                    }
                });
                
        } catch (error) {
            console.error('❌ Real-time subscription error:', error);
        }
    }
    
    function showNewScoreNotification(newScore) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px 20px;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(40,167,69,0.3);
                z-index: 10000;
                min-width: 280px;
                animation: slideInRight 0.5s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">🎉</span>
                    <div>
                        <div style="font-weight: bold; margin-bottom: 5px;">
                            New High Score!
                        </div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">
                            ${newScore.name} scored ${newScore.score.toLocaleString()} points
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.5s ease-in forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    // Local storage functions
    function loadLocalLeaderboard() {
        try {
            const stored = localStorage.getItem('dentalQuizLeaderboard_supabase');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading local leaderboard:', error);
            return [];
        }
    }
    
    function saveLocalLeaderboard(data) {
        try {
            localStorage.setItem('dentalQuizLeaderboard_supabase', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving local leaderboard:', error);
            return false;
        }
    }
    
    function mergeLeaderboards(local, cloud) {
        const merged = [...local];
        
        cloud.forEach(cloudItem => {
            const existingIndex = merged.findIndex(localItem => 
                localItem.sessionId === cloudItem.sessionId ||
                (localItem.name === cloudItem.name && 
                 Math.abs(localItem.timestamp - cloudItem.timestamp) < 30000)
            );
            
            if (existingIndex >= 0) {
                // Update existing with cloud data (cloud is source of truth)
                merged[existingIndex] = { ...cloudItem, localId: merged[existingIndex].localId };
            } else {
                // Add new cloud item
                merged.push(cloudItem);
            }
        });
        
        return merged
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.date) - new Date(a.date);
            })
            .slice(0, 100);
    }
    
    // Enhanced save function
    async function saveToLeaderboard() {
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const totalTime = answers.reduce((sum, answer) => sum + answer.timeUsed, 0);
        
        const playerResult = {
            name: playerName.trim(),
            score: totalScore,
            correctAnswers: correctAnswers,
            totalQuestions: quizData.length,
            accuracy: Math.round((correctAnswers / quizData.length) * 100),
            totalTime: Math.round(totalTime * 10) / 10,
            averageTime: Math.round((totalTime / quizData.length) * 10) / 10,
            maxStreak: maxStreak,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            sessionId: generateSessionId(),
            localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            detailedAnswers: answers.map(a => ({
                questionIndex: a.question,
                selected: a.selected,
                correct: a.correct,
                isCorrect: a.isCorrect,
                timeUsed: a.timeUsed,
                score: a.score,
                timeRemaining: a.timeRemaining || 0
            })),
            metadata: {
                quizVersion: '3.0',
                platform: 'vercel',
                userAgent: navigator.userAgent.substr(0, 100),
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                completedAt: '2025-07-27 17:38:07',
                deploymentPlatform: 'vercel',
                databaseProvider: 'supabase'
            }
        };
        
        // Save to local storage first
        localLeaderboard.push(playerResult);
        const localSaved = saveLocalLeaderboard(localLeaderboard);
        
        // Try to save to Supabase
        const supabaseResult = await saveToSupabase(playerResult);
        
        if (supabaseResult.success) {
            console.log('💾 Saved: Local ✅ | Supabase ✅');
            
            // Reload fresh data after save
            setTimeout(async () => {
                const updatedData = await loadFromSupabase();
                localLeaderboard = updatedData;
                displayGlobalStats(updatedData);
            }, 1500);
            
        } else if (supabaseResult.offline) {
            console.log('💾 Saved: Local ✅ | Supabase ⏳ (will sync when online)');
        } else {
            console.log('💾 Saved: Local ✅ | Supabase ❌');
        }
        
        return { local: localSaved, cloud: supabaseResult.success };
    }
    
    // Sync function
    async function syncWithSupabase() {
        if (!isOnline) return;
        
        try {
            const cloudData = await loadFromSupabase();
            localLeaderboard = cloudData;
            
            setupRealtimeSubscription();
            displayGlobalStats(cloudData);
            
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    // Status functions
    function showSyncStatus(type, message) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'sync-status';
        statusDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                font-size: 14px;
                min-width: 200px;
                text-align: center;
                background: ${type === 'success' ? '#28a745' : 
                           type === 'error' ? '#dc3545' : 
                           type === 'warning' ? '#ffc107' : '#17a2b8'};
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                animation: slideInRight 0.3s ease-out;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (document.body.contains(statusDiv)) {
                statusDiv.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (document.body.contains(statusDiv)) {
                        document.body.removeChild(statusDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    function showConnectionStatus(message) {
        const connectionDiv = document.createElement('div');
        connectionDiv.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 10px 15px;
                border-radius: 8px;
                background: ${isOnline ? '#28a745' : '#ffc107'};
                color: white;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(connectionDiv);
        
        setTimeout(() => {
            if (document.body.contains(connectionDiv)) {
                connectionDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(connectionDiv)) {
                        document.body.removeChild(connectionDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Enhanced global stats
    function displayGlobalStats(data = localLeaderboard) {
        let statsContainer = document.getElementById('globalStats');
        
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'globalStats';
            statsContainer.className = 'global-stats-container';
            
            const quizStartContainer = document.getElementById('quizStart');
            if (quizStartContainer) {
                const separator = document.createElement('div');
                separator.className = 'content-separator';
                quizStartContainer.appendChild(separator);
                quizStartContainer.appendChild(statsContainer);
            }
        }
        
        const totalPlayers = new Set(data.map(p => p.name)).size;
        const totalGames = data.length;
        const avgScore = totalGames > 0 ? Math.round(data.reduce((sum, p) => sum + p.score, 0) / totalGames) : 0;
        const topScore = totalGames > 0 ? Math.max(...data.map(p => p.score)) : 0;
        const cloudScores = data.filter(p => p.isFromCloud).length;
        const recentGames = data.filter(p => Date.now() - p.timestamp < 86400000).length;
        
        // Get player stats
        const playerGames = data.filter(p => p.name === playerName);
        const playerBest = playerGames.length > 0 ? Math.max(...playerGames.map(p => p.score)) : 0;
        const playerRank = playerBest > 0 ? data.findIndex(p => p.score === playerBest && p.name === playerName) + 1 : 0;
        
        statsContainer.innerHTML = `
            <div class="stats-header" style="text-align: center; margin-bottom: 25px;">
                <h3 style="color: #4a90e2; margin-bottom: 10px; font-size: 1.4rem; font-weight: bold;">
                    📊 Global Leaderboard ${isOnline ? '🌐' : '📱'} 
                    <span style="font-size: 0.7rem; background: #28a745; color: white; padding: 3px 8px; border-radius: 12px; margin-left: 10px;">LIVE</span>
                </h3>
                <p style="color: #666; margin: 0; font-size: 0.95rem;">
                    Real-time data from Supabase • Hosted on Vercel
                    ${cloudScores > 0 ? ` • ${cloudScores}/${totalGames} synced` : ''}
                </p>
                ${playerBest > 0 ? `
                    <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #4a90e2, #357abd); color: white; border-radius: 12px; display: inline-block;">
                        <strong>👋 ReyhanZidany</strong> • Best: ${playerBest.toLocaleString()} • Rank: #${playerRank}
                    </div>
                ` : ''}
            </div>
            
            <div class="stats-grid">
                <div class="stat-card" data-type="players">
                    <div class="stat-number">${totalPlayers}</div>
                    <div class="stat-label">👥 Total Pemain</div>
                </div>
                <div class="stat-card" data-type="games">
                    <div class="stat-number">${totalGames}</div>
                    <div class="stat-label">🎮 Game Dimainkan</div>
                </div>
                <div class="stat-card" data-type="average">
                    <div class="stat-number">${avgScore.toLocaleString()}</div>
                    <div class="stat-label">📈 Rata-rata Skor</div>
                </div>
                <div class="stat-card highlight" data-type="top">
                    <div class="stat-number">${topScore.toLocaleString()}</div>
                    <div class="stat-label">🏆 Skor Tertinggi</div>
                </div>
            </div>
            
            ${totalGames > 0 ? `
                <div class="additional-stats" style="margin-top: 25px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; font-size: 0.9rem;">
                        <div style="text-align: center; padding: 12px; background: rgba(74,144,226,0.1); border-radius: 10px;">
                            <strong style="color: #4a90e2; display: block; font-size: 1.1rem;">${Math.round((data.filter(p => p.accuracy >= 80).length / totalGames) * 100)}%</strong>
                            <span style="color: #666;">Akurasi ≥80%</span>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(40,167,69,0.1); border-radius: 10px;">
                            <strong style="color: #28a745; display: block; font-size: 1.1rem;">${data.filter(p => p.maxStreak >= 5).length}</strong>
                            <span style="color: #666;">Streak ≥5</span>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(255,193,7,0.1); border-radius: 10px;">
                            <strong style="color: #ffc107; display: block; font-size: 1.1rem;">${recentGames}</strong>
                            <span style="color: #666;">Hari Ini</span>
                        </div>
                        <div style="text-align: center; padding: 12px; background: rgba(220,53,69,0.1); border-radius: 10px;">
                            <strong style="color: #dc3545; display: block; font-size: 1.1rem;">${Math.round(data.reduce((sum, p) => sum + p.totalTime, 0) / totalGames)}s</strong>
                            <span style="color: #666;">Avg Time</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.05); border-radius: 10px;">
                <div style="display: flex; justify-content: center; gap: 15px; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 12px; color: #666;">
                        ${isOnline ? '🌐 Online' : '📱 Offline'} • 
                        Supabase • Vercel • 
                        Last sync: ${new Date().toLocaleTimeString('id-ID')}
                    </span>
                    <button onclick="window.forceSync()" style="padding: 6px 12px; background: #4a90e2; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        🔄 Refresh
                    </button>
                    <button onclick="window.viewRealTimeStats()" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        📊 Live Stats
                    </button>
                </div>
            </div>
        `;
        
        // Animation
        setTimeout(() => {
            const statCards = statsContainer.querySelectorAll('.stat-card');
            statCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }
    
    // Global functions
    window.forceSync = async function() {
        showSyncStatus('info', '🔄 Syncing...');
        await syncWithSupabase();
    };
    
    window.viewRealTimeStats = function() {
        // Show real-time statistics modal
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; max-width: 600px; width: 100%; border-radius: 20px; padding: 30px;">
                    <h3 style="margin-bottom: 20px; color: #4a90e2; text-align: center;">📊 Real-Time Statistics</h3>
                    <div id="realTimeStatsContent">
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 2rem;">⏳</div>
                            <p>Loading real-time data...</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="closeStatsModal()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 10px; cursor: pointer;">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        modal.id = 'statsModal';
        document.body.appendChild(modal);
        
        // Load real-time stats
        setTimeout(async () => {
            const freshData = await loadFromSupabase();
            const content = document.getElementById('realTimeStatsContent');
            if (content) {
                content.innerHTML = generateRealTimeStatsHTML(freshData);
            }
        }, 500);
    };
    
    window.closeStatsModal = function() {
        const modal = document.getElementById('statsModal');
        if (modal) document.body.removeChild(modal);
    };
    
    function generateRealTimeStatsHTML(data) {
        const last24h = data.filter(p => Date.now() - p.timestamp < 86400000);
        const last1h = data.filter(p => Date.now() - p.timestamp < 3600000);
        const topToday = last24h.length > 0 ? Math.max(...last24h.map(p => p.score)) : 0;
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
                    <div style="font-size: 2rem; color: #4a90e2; font-weight: bold;">${data.length}</div>
                    <div style="color: #666;">Total Scores</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
                    <div style="font-size: 2rem; color: #28a745; font-weight: bold;">${last24h.length}</div>
                    <div style="color: #666;">Last 24h</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
                    <div style="font-size: 2rem; color: #ffc107; font-weight: bold;">${last1h.length}</div>
                    <div style="color: #666;">Last Hour</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
                    <div style="font-size: 1.5rem; color: #dc3545; font-weight: bold;">${topToday.toLocaleString()}</div>
                    <div style="color: #666;">Top Today</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(74,144,226,0.1); border-radius: 10px;">
                <strong>🔔 Real-time Features:</strong><br>
                • Live score updates<br>
                • Instant leaderboard sync<br>
                • New player notifications<br>
                • Cross-device synchronization
            </div>
        `;
    }
    
    // Enhanced quiz start layout
    function enhanceQuizStartLayout() {
        const quizStart = document.getElementById('quizStart');
        if (!quizStart) return;
        
        quizStart.innerHTML = `
            <div class="quiz-start-container">
                <div class="quiz-header">
                    <h1 class="quiz-title">🦷 Quiz Kesehatan Gigi & Mulut</h1>
                    <p class="quiz-description">
                        Halo <strong style="color: #4a90e2;">ReyhanZidany</strong>! 👋<br>
                        Uji pengetahuan Anda tentang kesehatan gigi dan mulut.<br>
                        Kompete dengan pemain dari seluruh dunia dalam leaderboard global!
                    </p>
                </div>
                
                <div class="start-button-container">
                    <button id="startQuizBtn" class="enhanced-start-btn">
                        🎮 Mulai Quiz Sekarang
                    </button>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 15px; font-style: italic;">
                        ⏱️ 10 soal • ⚡ Timer • 🏆 Global leaderboard • 🌐 Real-time sync • 🚀 Powered by Supabase
                    </p>
                </div>
            </div>
        `;
        
        const newStartButton = document.getElementById('startQuizBtn');
        if (newStartButton) {
            newStartButton.addEventListener('click', function() {
                startQuiz();
            });
        }
    }
    
    // CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .stat-card {
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize
    async function initializeQuiz() {
        console.log('🚀 Initializing Supabase-powered Quiz on Vercel...');
        
        showConnectionStatus(isOnline ? '🌐 Connected - Loading from Supabase...' : '📱 Offline mode');
        
        try {
            const data = await loadFromSupabase();
            localLeaderboard = data;
            
            if (isOnline) {
                setupRealtimeSubscription();
            }
            
        } catch (error) {
            console.error('Initialization error:', error);
            localLeaderboard = loadLocalLeaderboard();
        }
        
        showStartState();
        enhanceQuizStartLayout();
        displayGlobalStats(localLeaderboard);
        
        console.log(`✅ Quiz initialized with ${localLeaderboard.length} scores`);
        console.log('🔗 Supabase URL:', SUPABASE_URL);
    }
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (realtimeSubscription) {
            realtimeSubscription.unsubscribe();
        }
    });
    
    // Rest of quiz functions (startQuiz, showQuestion, etc.) tetap sama seperti sebelumnya...
    // [Include all the quiz game logic here]
    
    // Initialize
    initializeQuiz();
    
    console.log('🎮 Supabase-powered Quiz System Ready on Vercel!');
    console.log('💾 Features: Real-time sync, Global leaderboard, Offline support');
});