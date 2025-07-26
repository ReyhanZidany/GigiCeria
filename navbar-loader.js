// Navbar Loader - Load navbar untuk semua halaman
document.addEventListener('DOMContentLoaded', function() {
    // Function untuk load navbar
    function loadNavbar() {
        fetch('navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Navbar file not found');
                }
                return response.text();
            })
            .then(data => {
                // Insert navbar ke dalam body
                document.body.insertAdjacentHTML('afterbegin', data);
                
                // Set active page
                setActivePage();
                
                // Initialize navbar functionality
                initializeNavbar();
                
                console.log('✅ Navbar loaded successfully');
            })
            .catch(error => {
                console.error('❌ Error loading navbar:', error);
                // Fallback navbar jika file tidak ditemukan
                createFallbackNavbar();
            });
    }
    
    // Function untuk set halaman aktif
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
    
    // Function untuk mendapatkan nama halaman saat ini
    function getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }
    
    // Function untuk inisialisasi navbar functionality
    function initializeNavbar() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            // Toggle mobile menu
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(event) {
                const isClickInsideNav = navMenu.contains(event.target);
                const isClickOnHamburger = hamburger.contains(event.target);
                
                if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
        
        // Add scroll effect to navbar
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                }
            }
        });
        
        // Page transition effect
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href !== window.location.pathname && href.endsWith('.html')) {
                    e.preventDefault();
                    
                    // Add loading animation
                    document.body.style.opacity = '0.7';
                    document.body.style.transition = 'opacity 0.3s ease';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            });
        });
    }
    
    // Fallback navbar jika file tidak bisa di-load
    function createFallbackNavbar() {
        const fallbackNavbar = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <img src="sehatsari.png" alt="SehatSari Logo" class="logo-img" onerror="this.style.display='none'">
                        <h2>GigiPintar</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="index.html" class="nav-link">Beranda</a></li>
                        <li><a href="materi.html" class="nav-link">Materi</a></li>
                        <li><a href="tutorial.html" class="nav-link">Tutorial</a></li>
                        <li><a href="kuis.html" class="nav-link">Kuis</a></li>
                        <li><a href="tentang.html" class="nav-link">Tentang</a></li>
                    </ul>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', fallbackNavbar);
        setActivePage();
        initializeNavbar();
        
        console.log('⚠️ Fallback navbar loaded');
    }
    
    // Load navbar saat halaman dimuat
    loadNavbar();
});