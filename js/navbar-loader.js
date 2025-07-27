// Navbar Loader dengan Font Management - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Tambahkan CSS critical path untuk mencegah layout shift
    const criticalCSS = `
        <style id="navbar-critical">
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            opacity: 1;
            visibility: visible;
            transition: none;
        }
        .nav-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 60px;
        }
        .nav-menu {
            display: flex;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .nav-link {
            display: flex;
            align-items: center;
            height: 40px;
            padding: 0 16px;
            text-decoration: none;
            white-space: nowrap;
        }
        .logo-link {
            display: flex !important;
            align-items: center !important;
            text-decoration: none !important;
            border: none !important;
        }
        .logo-text {
            font-family: 'Poppins', sans-serif !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1 !important;
        }
        </style>
    `;
    
    // Inject critical CSS immediately
    document.head.insertAdjacentHTML('beforeend', criticalCSS);
    
    // Font loading management - Optimized
    const fontLoader = {
        loaded: false,
        
        init() {
            // Check if fonts are already loaded
            if (document.documentElement.classList.contains('fonts-loaded')) {
                this.loaded = true;
                return;
            }
            
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    this.onFontsLoaded();
                });
                
                // Fallback timeout
                setTimeout(() => {
                    if (!this.loaded) {
                        this.onFontsLoaded();
                    }
                }, 500); // Reduced from 1000ms
            } else {
                setTimeout(() => {
                    this.onFontsLoaded();
                }, 300); // Reduced timeout
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
    
    // Preload navbar immediately
    function preloadNavbar() {
        if (window.navbarCache) {
            return Promise.resolve(window.navbarCache);
        }
        
        return fetch('navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                window.navbarCache = data; // Cache the navbar
                return data;
            });
    }
    
    function loadNavbar() {
        if (document.querySelector('.navbar')) {
            console.log('ℹ️ Navbar already exists');
            initializeNavbar();
            return;
        }
        
        preloadNavbar()
            .then(data => {
                // Insert navbar without delay
                document.body.insertAdjacentHTML('afterbegin', data);
                
                // Setup immediately
                setupNavbar();
                console.log('✅ Navbar loaded successfully');
            })
            .catch(error => {
                console.error('❌ Error loading navbar:', error);
                createFallbackNavbar();
            });
    }
    
    function setupNavbar() {
        // Force immediate styling
        requestAnimationFrame(() => {
            ensureLogoStyling();
            setActivePage();
            initializeNavbar();
        });
    }
    
    function ensureLogoStyling() {
        const logoLink = document.querySelector('.logo-link');
        const logoText = document.querySelector('.logo-text');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (logoLink) {
            // Force logo link styling with !important equivalent
            const logoStyles = {
                textDecoration: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                height: 'auto'
            };
            
            Object.assign(logoLink.style, logoStyles);
        }
        
        if (logoText) {
            // Force logo text styling
            const textStyles = {
                fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: "700",
                fontSize: "1.5rem",
                color: "#4a90e2",
                textDecoration: "none",
                margin: "0",
                padding: "0",
                border: "none",
                flexShrink: "0",
                whiteSpace: "nowrap",
                lineHeight: "1",
                verticalAlign: "baseline"
            };
            
            Object.assign(logoText.style, textStyles);
        }
        
        // Fix nav links alignment
        navLinks.forEach(link => {
            Object.assign(link.style, {
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
                verticalAlign: 'middle'
            });
        });
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
        
        // Optimized navigation with preloading
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const currentPath = window.location.pathname.split('/').pop();

                if (href && href !== currentPath && href.endsWith('.html')) {
                    e.preventDefault();

                    // Minimal animation untuk feedback
                    this.style.opacity = '0.8';
                    this.style.transform = 'scale(0.98)';
                    this.style.transition = 'all 0.1s ease';

                    // Navigate immediately
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100); // Reduced delay
                }
            });
            
            // Preload on hover
            link.addEventListener('mouseenter', function() {
                const href = this.getAttribute('href');
                if (href && href.endsWith('.html')) {
                    const preloadLink = document.createElement('link');
                    preloadLink.rel = 'prefetch';
                    preloadLink.href = href;
                    document.head.appendChild(preloadLink);
                }
            });
        });
        
        // Outside click handler
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Scroll handler with throttling
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
        
        console.log('✅ Navbar functionality initialized');
    }
    
    function createFallbackNavbar() {
        const fallbackNavbar = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="index.html" class="logo-link">
                            <img src="assets/images/sehatsari.png" alt="SehatSari Logo" class="logo-img" onerror="this.style.display='none'">
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
        
        // Immediate styling
        requestAnimationFrame(() => {
            ensureLogoStyling();
            setupNavbar();
        });
        
        console.log('⚠️ Fallback navbar loaded');
    }
    
    function preloadResources() {
        // Preload navbar HTML
        const navbarLink = document.createElement('link');
        navbarLink.rel = 'prefetch';
        navbarLink.href = 'navbar.html';
        document.head.appendChild(navbarLink);
        
        // Preload logo image
        const logoImg = new Image();
        logoImg.src = 'assets/images/sehatsari.png';
        
        // Preload font if not loaded
        if (!document.documentElement.classList.contains('fonts-loaded')) {
            const fontLink = document.createElement('link');
            fontLink.rel = 'preload';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
            fontLink.as = 'style';
            document.head.appendChild(fontLink);
        }
    }
    
    // Start immediately
    preloadResources();
    
    // Load navbar without waiting
    if (document.readyState === 'loading') {
        loadNavbar();
    } else {
        setTimeout(loadNavbar, 0);
    }
});

// Fallback for older browsers
if (!('fonts' in document)) {
    window.addEventListener('load', () => {
        document.documentElement.classList.add('fonts-loaded');
    });
}

// Page visibility optimization
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !window.navbarCache) {
        // Preload navbar when page becomes visible
        fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                window.navbarCache = data;
            })
            .catch(() => {});
    }
});