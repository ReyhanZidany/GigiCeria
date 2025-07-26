// Main script - without navbar functionality (now handled by navbar-loader.js)
document.addEventListener('DOMContentLoaded', function() {
    
    // Page load animation
    document.body.style.opacity = '0';
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .lesson-card, .step-card, .about-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Tooltip functionality for interactive elements
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
                white-space: nowrap;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
        });
    });
    
    // Dynamic copyright year and user info
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.footer p');
    copyrightElements.forEach(element => {
        if (element.textContent.includes('2024')) {
            element.textContent = element.textContent.replace('2024', currentYear);
        }
    });
    
    // Local storage utilities
    window.storage = {
        set: function(key, value) {
            try {
                const data = {
                    value: value,
                    timestamp: new Date().toISOString(),
                    user: 'ReyhanZidany'
                };
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Local storage error:', e);
                return false;
            }
        },
        
        get: function(key) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const data = JSON.parse(item);
                return data.value;
            } catch (e) {
                console.error('Local storage error:', e);
                return null;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Local storage error:', e);
                return false;
            }
        },
        
        getUserData: function() {
            const keys = Object.keys(localStorage);
            const userData = {};
            
            keys.forEach(key => {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item && item.user === 'ReyhanZidany') {
                        userData[key] = {
                            value: item.value,
                            timestamp: item.timestamp
                        };
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            });
            
            return userData;
        }
    };
    
    // Achievement system
    window.achievements = {
        check: function() {
            const visitedPages = window.storage.get('visitedPages') || [];
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (!visitedPages.includes(currentPage)) {
                visitedPages.push(currentPage);
                window.storage.set('visitedPages', visitedPages);
                
                // Check for achievements
                if (visitedPages.length === 1) {
                    this.show('Penjelajah Pemula', 'Selamat datang di GigiPintar! 🎉');
                } else if (visitedPages.length === 3) {
                    this.show('Siswa Rajin', 'Kamu sudah mengunjungi 3 halaman! 📚');
                } else if (visitedPages.length === 5) {
                    this.show('Master Gigi Sehat', 'Kamu sudah menjelajahi semua halaman! 🏆');
                }
            }
        },
        
        show: function(title, message) {
            const achievement = document.createElement('div');
            achievement.className = 'achievement-popup';
            achievement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.5s ease;
                max-width: 300px;
            `;
            
            achievement.innerHTML = `
                <h4 style="margin: 0 0 10px 0; font-size: 1.2rem;">🏆 ${title}</h4>
                <p style="margin: 0; font-size: 1rem;">${message}</p>
                <small style="opacity: 0.8; font-size: 0.8rem;">User: ReyhanZidany</small>
            `;
            
            document.body.appendChild(achievement);
            
            setTimeout(() => {
                achievement.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                achievement.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(achievement)) {
                        document.body.removeChild(achievement);
                    }
                }, 500);
            }, 4000);
        }
    };
    
    // Initialize achievements
    window.achievements.check();
    
    console.log('🦷 GigiPintar Padangsari loaded successfully!');
    console.log('👤 Current user: ReyhanZidany');
    console.log('📅 Current date: 2025-07-23 16:10:02 UTC');
});