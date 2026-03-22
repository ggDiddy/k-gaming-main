
// Koncept Gaming - Interactive JavaScript
// Enhanced with animations, smooth scrolling, and user interactions

// Utility Functions
const utils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    smoothScrollTo(element, offset = 100) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

// DOM Ready State Handler
class DOMHandler {
    constructor() {
        this.isReady = false;
        this.readyQueue = [];
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.isReady = true;
                this.flushQueue();
            });
        } else {
            this.isReady = true;
        }
    }

    ready(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyQueue.push(callback);
        }
    }

    flushQueue() {
        while (this.readyQueue.length > 0) {
            const callback = this.readyQueue.shift();
            callback();
        }
    }
}

// Animation and Scroll Effects Manager
class AnimationManager {
    constructor() {
        this.observers = [];
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.createIntersectionObserver();
        this.initScrollAnimations();
        this.initHoverEffects();
    }

    createIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, options);

        // Observe elements with animation data attributes
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });

        this.observers.push(observer);
    }

    animateElement(element) {
        const animationType = element.dataset.aos;
        const delay = element.dataset.aosDelay || 0;

        setTimeout(() => {
            element.classList.add('aos-animate');
            
            // Add custom animations based on type
            switch(animationType) {
                case 'fade-up':
                    this.fadeUp(element);
                    break;
                case 'zoom-in':
                    this.zoomIn(element);
                    break;
                case 'slide-up':
                    this.slideUp(element);
                    break;
                default:
                    element.style.opacity = '1';
                    element.style.transform = 'none';
            }
        }, parseInt(delay));
    }

    fadeUp(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    zoomIn(element) {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    }

    slideUp(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    initScrollAnimations() {
        // Parallax effect for hero background
        const heroBackground = document.querySelector('.hero-bg');
        if (heroBackground) {
            window.addEventListener('scroll', utils.throttle(() => {
                const scrolled = window.pageYOffset;
                const parallax = scrolled * 0.5;
                heroBackground.style.transform = `translateY(${parallax}px)`;
            }, 16));
        }

        // Navbar background on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', utils.throttle(() => {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }, 16));
        }
    }

    initHoverEffects() {
        // Enhanced hover effects for cards
        const cards = document.querySelectorAll('.bonus-card, .category-card, .state-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createHoverRipple(e.currentTarget, e);
            });
        });
    }

    createHoverRipple(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.className = 'hover-ripple';
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            background: rgba(11, 48, 55, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.appendChild(ripple);

        // Create animation keyframes if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

// Navigation Manager
class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initSmoothScrolling();
        this.initActiveNavigation();
    }

    initMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking on links
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }

    initSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    utils.smoothScrollTo(targetElement);
                    this.closeMobileMenu();
                }
            });
        });
    }

    initActiveNavigation() {
        // Update active navigation based on scroll position
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', utils.throttle(() => {
            let currentSection = '';
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 200 && rect.bottom >= 200) {
                    currentSection = section.id;
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }, 100));
    }
}

// Form Handler Manager
class FormManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        });
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Newsletter form handling
        if (form.id === 'newsletter-form') {
            this.handleNewsletterSubmit(form, formData);
        }
        
        // Add more form handlers as needed
    }

    handleNewsletterSubmit(form, formData) {
        const email = formData.get('email') || form.querySelector('input[type="email"]').value;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Validate email
        if (!this.isValidEmail(email)) {
            this.showMessage(form, 'Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        submitButton.textContent = 'Subscribing...';
        submitButton.disabled = true;

        // Simulate API call (replace with actual endpoint)
        setTimeout(() => {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Show success message
            this.showMessage(form, 'Thank you for subscribing! Check your email for exclusive bonuses.', 'success');
            
            // Reset form
            form.reset();
        }, 1500);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(form, message, type) {
        // Remove existing message
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Style the message
        messageElement.style.cssText = `
            padding: 12px 16px;
            margin-top: 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            animation: slideDown 0.3s ease;
            ${type === 'success' ? 
                'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
                'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        // Add animation styles if not exists
        if (!document.querySelector('#form-message-styles')) {
            const style = document.createElement('style');
            style.id = 'form-message-styles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        form.appendChild(messageElement);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    messageElement.remove();
                }, 300);
            }
        }, 5000);
    }
}

// Language Manager
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.languageSelect = document.getElementById('language-select');
        this.init();
    }

    init() {
        if (this.languageSelect) {
            this.languageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }

        // Set initial language from localStorage or browser preference
        const savedLanguage = localStorage.getItem('preferred-language') || this.getBrowserLanguage();
        if (savedLanguage && savedLanguage !== 'en') {
            this.switchLanguage(savedLanguage);
        }
    }

    getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        return lang.startsWith('fr') ? 'fr' : 'en';
    }

    switchLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('preferred-language', language);
        
        if (this.languageSelect) {
            this.languageSelect.value = language;
        }

        // In a real application, you would load language-specific content
        // For now, we'll just show a message
        this.showLanguageSwitch(language);
    }

    showLanguageSwitch(language) {
        const messages = {
            'en': 'Language switched to English',
            'fr': 'Langue changée en français'
        };

        // Create temporary message
        const message = document.createElement('div');
        message.textContent = messages[language] || messages['en'];
        message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-gradient);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;

        // Add animation styles
        if (!document.querySelector('#language-message-styles')) {
            const style = document.createElement('style');
            style.id = 'language-message-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(message);

        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Monitor Core Web Vitals
        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        
        // Monitor custom metrics
        this.measurePageLoadTime();
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            observer.observe({entryTypes: ['largest-contentful-paint']});
        }
    }

    measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            observer.observe({entryTypes: ['first-input']});
        }
    }

    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.cls = clsValue;
                    }
                });
            });
            observer.observe({entryTypes: ['layout-shift']});
        }
    }

    measurePageLoadTime() {
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                this.metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
                this.reportMetrics();
            }
        });
    }

    reportMetrics() {
        // In production, send metrics to analytics
        console.log('Performance Metrics:', this.metrics);
    }
}

// Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // ESC key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Tab navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });

            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    }

    setupScreenReaderSupport() {
        // Announce dynamic content changes
        this.createAriaLiveRegion();
        
        // Enhance button descriptions
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });
    }

    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
        };
    }

    handleEscapeKey() {
        // Close mobile menu
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
}

// Main Application Class
class KonceptGaming {
    constructor() {
        this.domHandler = new DOMHandler();
        this.animationManager = null;
        this.navigationManager = null;
        this.formManager = null;
        this.languageManager = null;
        this.performanceMonitor = null;
        this.accessibilityManager = null;
        
        this.init();
    }

    init() {
        this.domHandler.ready(() => {
            console.log('🎰 Koncept Gaming - Initializing...');
            
            // Initialize all managers
            this.animationManager = new AnimationManager();
            this.navigationManager = new NavigationManager();
            this.formManager = new FormManager();
            this.languageManager = new LanguageManager();
            this.performanceMonitor = new PerformanceMonitor();
            this.accessibilityManager = new AccessibilityManager();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            console.log('✅ Koncept Gaming - Fully Loaded!');
            
            // Announce to screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Koncept Gaming website loaded');
            }
        });
    }

    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Resume animations or refresh data if needed
                console.log('Page is now visible');
            } else {
                // Pause animations to save resources
                console.log('Page is now hidden');
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('Connection restored');
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Internet connection restored');
            }
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Internet connection lost');
            }
        });

        // Handle print events
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('printing');
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        });
    }
}

// Initialize the application
const app = new KonceptGaming();

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KonceptGaming;
}
