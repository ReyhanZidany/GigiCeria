// Navbar Loader dengan Font Management
document.addEventListener('DOMContentLoaded', function() {
    // Font loading management
    const fontLoader = {
        loaded: false,
        
        init() {
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    this.onFontsLoaded();
                });
            } else {
                setTimeout(() => {
                    this.onFontsLoaded();
                }, 1000);
            }
            document.documentElement.classList.add('fonts-loading');
        },
        
        onFontsLoaded() {
            this.loaded = true;
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
            console.log('✅ Fonts loaded successfully');
        }
    };
    
    fontLoader.init();
    
    function loadNavbar() {
        if (document.querySelector('.navbar')) {
            console.log('ℹ️ Navbar already exists');
            initializeNavbar();
            return;
        }
        
        fetch('navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                document.body.insertAdjacentHTML('afterbegin', data);
                
                if (fontLoader.loaded) {
                    setupNavbar();
                } else {
                    setTimeout(setupNavbar, 100);
                }
                
                console.log('✅ Navbar loaded successfully');
            })
            .catch(error => {
                console.error('❌ Error loading navbar:', error);
                createFallbackNavbar();
            });
    }
    
    function setupNavbar() {
        setActivePage();
        initializeNavbar();
        ensureLogoStyling();
    }
    
    function ensureLogoStyling() {
        const logoLink = document.querySelector('.logo-link');
        const logoText = document.querySelector('.logo-text');
        
        if (logoLink) {
            // Force logo link styling
            logoLink.style.textDecoration = 'none';
            logoLink.style.border = 'none';
            logoLink.style.display = 'flex';
            logoLink.style.alignItems = 'center';
            logoLink.style.gap = '12px';
        }
        
        if (logoText) {
            // Force logo text styling
            logoText.style.fontFamily = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            logoText.style.fontWeight = "700";
            logoText.style.fontSize = "1.5rem";
            logoText.style.color = "#4a90e2";
            logoText.style.textDecoration = "none";
            logoText.style.margin = "0";
            logoText.style.padding = "0";
            logoText.style.border = "none";
            logoText.style.flexShrink = "0";
            logoText.style.whiteSpace = "nowrap";
        }
    }
    
    function setActivePage() {
        const currentPage = getCurrentPageName();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    function getCurrentPageName() {
        const path = window.location.pathname;
        let page = path.split('/').pop().replace('.html', '') || 'index';
        
        if (page === '' || page === '/') {
            page = 'index';
        }
        
        return page;
    }
    
    function initializeNavbar() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navbar = document.querySelector('.navbar');
        
        if (!hamburger || !navMenu || !navbar) {
            console.warn('⚠️ Navbar elements not found');
            return;
        }
        
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };
        
        hamburger.addEventListener('click', toggleMenu);
        
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        let ticking = false;
        const updateNavbar = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const currentPath = window.location.pathname.split('/').pop();
                
                if (href && href !== currentPath && href.endsWith('.html')) {
                    e.preventDefault();
                    
                    this.style.opacity = '0.7';
                    this.style.pointerEvents = 'none';
                    
                    document.body.style.opacity = '0.95';
                    document.body.style.transition = 'opacity 0.2s ease';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                }
            });
        });
        
        console.log('✅ Navbar functionality initialized');
    }
    
    function createFallbackNavbar() {
        const fallbackNavbar = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="index.html" class="logo-link">
                            <img src="sehatsari.png" alt="SehatSari Logo" class="logo-img" onerror="this.style.display='none'">
                            <h2 class="logo-text">GigiPintar</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="index.html" class="nav-link" data-page="index">🏠 Beranda</a></li>
                        <li><a href="materi.html" class="nav-link" data-page="materi">📚 Materi</a></li>
                        <li><a href="tutorial.html" class="nav-link" data-page="tutorial">🎥 Tutorial</a></li>
                        <li><a href="kuis.html" class="nav-link" data-page="kuis">🧠 Kuis</a></li>
                        <li><a href="tentang.html" class="nav-link" data-page="tentang">ℹ️ Tentang</a></li>
                    </ul>
                    <div class="hamburger" aria-label="Toggle navigation menu" role="button" tabindex="0">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', fallbackNavbar);
        
        setTimeout(() => {
            ensureLogoStyling();
        }, 100);
        
        setupNavbar();
        console.log('⚠️ Fallback navbar loaded');
    }
    
    function preloadResources() {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = 'navbar.html';
        document.head.appendChild(link);
        
        const logoImg = new Image();
        logoImg.src = 'sehatsari.png';
    }
    
    preloadResources();
    loadNavbar();
});

if (!('fonts' in document)) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.documentElement.classList.add('fonts-loaded');
        }, 1000);
    });
}