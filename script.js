// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== NAVIGATION =====
class Navigation {
    constructor() {
        this.nav = $('.nav');
        this.navToggle = $('.nav-toggle');
        this.navMenu = $('.nav-menu');
        this.navLinks = $$('.nav-link');
        this.header = $('.header');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupSmoothScrolling();
        this.setupScrollSpy();
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Header background on scroll
        window.addEventListener('scroll', () => this.handleHeaderScroll());
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    }
    
    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
    }
    
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = $(targetId);
                
                if (targetSection) {
                    const headerHeight = this.header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupScrollSpy() {
        const sections = $$('section[id]');
        
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + this.header.offsetHeight + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const navLink = $(`.nav-link[href="#${sectionId}"]`);
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    this.navLinks.forEach(link => link.classList.remove('active'));
                    navLink?.classList.add('active');
                }
            });
        });
    }
    
    handleHeaderScroll() {
        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            this.header.style.background = 'rgba(15, 20, 25, 0.99)';
            this.header.style.boxShadow = `
                0 12px 40px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.05)
            `;
            this.header.style.transform = 'translateX(-50%) scale(0.98)';
        } else {
            this.header.style.background = 'rgba(15, 20, 25, 0.98)';
            this.header.style.boxShadow = `
                0 8px 32px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.03)
            `;
            this.header.style.transform = 'translateX(-50%) scale(1)';
        }
    }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.elements = $$('.animate-on-scroll, .section-header, .hero-content > *, .about-content > *, .skill-category, .project-card, .contact-item');
        this.observer = null;
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.addAnimationClasses();
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
    
    addAnimationClasses() {
        this.elements.forEach(el => {
            el.classList.add('animate-on-scroll');
        });
    }
}

// ===== TYPING ANIMATION =====
class TypingAnimation {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = texts;
        this.options = {
            typeSpeed: 100,
            deleteSpeed: 50,
            pauseTime: 2000,
            loop: true,
            ...options
        };
        
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        if (this.element) {
            this.init();
        }
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;
        
        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            typeSpeed = this.options.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===== CONTACT FORM =====
class ContactForm {
    constructor() {
        this.form = $('.contact-form');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!this.validateForm(data)) {
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Enviando...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission
            await this.simulateSubmission(data);
            
            this.showNotification('Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
            this.form.reset();
        } catch (error) {
            this.showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    validateForm(data) {
        const { name, email, subject, message } = data;
        
        if (!name.trim()) {
            this.showNotification('Por favor, preencha seu nome.', 'error');
            return false;
        }
        
        if (!email.trim() || !this.isValidEmail(email)) {
            this.showNotification('Por favor, insira um email válido.', 'error');
            return false;
        }
        
        if (!subject.trim()) {
            this.showNotification('Por favor, preencha o assunto.', 'error');
            return false;
        }
        
        if (!message.trim()) {
            this.showNotification('Por favor, escreva uma mensagem.', 'error');
            return false;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async simulateSubmission(data) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }
    
    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = $('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: auto;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }
    
    removeNotification(notification) {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}

// ===== FLOATING ELEMENTS ANIMATION =====
class FloatingElements {
    constructor() {
        this.elements = $$('.floating-element');
        this.init();
    }
    
    init() {
        this.elements.forEach(element => {
            this.animateElement(element);
        });
    }
    
    animateElement(element) {
        const speed = element.dataset.speed || 1;
        const initialPosition = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };
        
        element.style.left = initialPosition.x + 'px';
        element.style.top = initialPosition.y + 'px';
        
        // Parallax effect on mouse move
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const moveX = (mouseX - 0.5) * 50 * speed;
            const moveY = (mouseY - 0.5) * 50 * speed;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }
}

// ===== SMOOTH SCROLL TO TOP =====
class ScrollToTop {
    constructor() {
        this.button = null;
        this.init();
    }
    
    init() {
        this.createButton();
        this.bindEvents();
    }
    
    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'scroll-to-top';
        this.button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        this.button.setAttribute('aria-label', 'Voltar ao topo');
        
        this.button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.25rem;
            cursor: pointer;
            box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
        `;
        
        document.body.appendChild(this.button);
    }
    
    bindEvents() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 500;
            
            if (scrolled) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'translateY(-3px)';
            this.button.style.boxShadow = '0 8px 25px 0 rgba(102, 126, 234, 0.4)';
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'translateY(0)';
            this.button.style.boxShadow = '0 4px 14px 0 rgba(102, 126, 234, 0.3)';
        });
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.preloadImages();
        this.lazyLoadImages();
        this.optimizeAnimations();
    }
    
    preloadImages() {
        const images = $$('img[src]');
        images.forEach(img => {
            const imagePreload = new Image();
            imagePreload.src = img.src;
        });
    }
    
    lazyLoadImages() {
        const images = $$('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    optimizeAnimations() {
        // Reduce animations on low-performance devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        }
        
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const animations = $$('.floating-element, .hero-card');
            
            if (document.hidden) {
                animations.forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            } else {
                animations.forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }
        });
    }
}

// ===== REDUCED MOTION UTILITIES =====
class MotionUtils {
    constructor() {
        this.init();
    }
    
    init() {
        this.handleReducedMotion();
    }
    
    handleReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduced-motion');
            
            // Disable complex animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== ENHANCED TYPING ANIMATION =====
class EnhancedTypingAnimation {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = texts;
        this.options = {
            typeSpeed: 150,
            deleteSpeed: 100,
            pauseTime: 2000,
            loop: true,
            ...options
        };
        
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isTyping = false;
        
        if (this.element) {
            this.init();
        }
    }
    
    init() {
        setTimeout(() => {
            this.type();
        }, 1000);
    }
    
    type() {
        this.isTyping = true;
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;
        
        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            typeSpeed = this.options.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===== ENHANCED SKILLS SYSTEM =====
class EnhancedSkillsSystem {
    constructor() {
        this.skillCards = $$('.skill-card[data-level]');
        this.filters = $$('.skill-filter');
        this.categories = $$('.skill-category-enhanced');
        this.radarCanvas = $('#skillsRadar');
        this.radarChart = null;
        this.init();
    }
    
    init() {
        this.setupFilters();
        this.setupProgressAnimation();
        this.setupRadarChart();
        this.setupTimelineAnimation();
        this.setupCertificationsAnimation();
        
        // Inicializar com apenas a categoria frontend visível
        setTimeout(() => {
            this.initializeActiveCategory();
        }, 100);
    }
    
    // Filtros de Skills
    setupFilters() {
        this.filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');
                
                // Update active filter
                this.filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Filter categories
                this.filterCategories(filterValue);
            });
        });
    }
    
    filterCategories(filterValue) {
        this.categories.forEach(category => {
            const categoryType = category.getAttribute('data-category');
            
            if (categoryType === filterValue) {
                category.style.display = 'block';
                category.style.animation = 'fadeInUp 0.6s ease-out';
            } else {
                category.style.animation = 'fadeOutDown 0.3s ease-out';
                setTimeout(() => {
                    category.style.display = 'none';
                }, 300);
            }
        });
        
        // Inicializar com apenas a categoria ativa visível
        this.initializeActiveCategory();
    }
    
    initializeActiveCategory() {
        // Esconder todas as categorias inicialmente
        this.categories.forEach(category => {
            category.style.display = 'none';
        });
        
        // Mostrar apenas a categoria ativa (frontend por padrão)
        const activeFilter = document.querySelector('.skill-filter.active');
        if (activeFilter) {
            const activeCategory = activeFilter.getAttribute('data-filter');
            const targetCategory = document.querySelector(`[data-category="${activeCategory}"]`);
            if (targetCategory) {
                targetCategory.style.display = 'block';
                targetCategory.style.animation = 'fadeInUp 0.6s ease-out';
            }
        }
    }
    
    // Animação das Barras de Progresso
    setupProgressAnimation() {
        this.skillCards.forEach(card => {
            const level = card.getAttribute('data-level');
            card.style.setProperty('--skill-level', level + '%');
        });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Animate skill card with stagger
                    const cards = entry.target.querySelectorAll('.skill-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animated');
                        }, index * 150);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        this.categories.forEach(category => {
            observer.observe(category);
        });
    }
    
    // Gráfico Radar de Competências
    setupRadarChart() {
        if (!this.radarCanvas) return;
        
        const ctx = this.radarCanvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        
        const skills = [
            { name: 'Frontend', value: 90, color: '#61dafb' },
            { name: 'Backend', value: 85, color: '#68d391' },
            { name: 'Mobile', value: 75, color: '#02569b' },
            { name: 'DevOps', value: 70, color: '#f14e32' },
            { name: 'Design', value: 80, color: '#a259ff' },
            { name: 'Database', value: 82, color: '#47a047' }
        ];
        
        this.animateRadarChart(ctx, centerX, centerY, maxRadius, skills);
    }
    
    animateRadarChart(ctx, centerX, centerY, maxRadius, skills) {
        let frame = 0;
        const maxFrames = 60;
        
        const animate = () => {
            ctx.clearRect(0, 0, 300, 300);
            
            const progress = Math.min(frame / maxFrames, 1);
            const easeProgress = this.easeOutCubic(progress);
            
            // Draw grid circles
            this.drawRadarGrid(ctx, centerX, centerY, maxRadius);
            
            // Draw axes
            this.drawRadarAxes(ctx, centerX, centerY, maxRadius, skills);
            
            // Draw skill polygon
            this.drawSkillPolygon(ctx, centerX, centerY, maxRadius, skills, easeProgress);
            
            // Draw skill points
            this.drawSkillPoints(ctx, centerX, centerY, maxRadius, skills, easeProgress);
            
            // Draw labels
            this.drawSkillLabels(ctx, centerX, centerY, maxRadius, skills);
            
            if (frame < maxFrames) {
                frame++;
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation when radar section comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe($('.skills-radar-section'));
    }
    
    drawRadarGrid(ctx, centerX, centerY, maxRadius) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Draw concentric circles
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawRadarAxes(ctx, centerX, centerY, maxRadius, skills) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        skills.forEach((_, index) => {
            const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
    }
    
    drawSkillPolygon(ctx, centerX, centerY, maxRadius, skills, progress) {
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        skills.forEach((skill, index) => {
            const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
            const radius = (maxRadius * skill.value / 100) * progress;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    drawSkillPoints(ctx, centerX, centerY, maxRadius, skills, progress) {
        skills.forEach((skill, index) => {
            const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
            const radius = (maxRadius * skill.value / 100) * progress;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.fillStyle = skill.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Add white border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
    
    drawSkillLabels(ctx, centerX, centerY, maxRadius, skills) {
        ctx.fillStyle = '#1a202c';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        skills.forEach((skill, index) => {
            const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
            const labelRadius = maxRadius + 20;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;
            
            ctx.fillText(skill.name, x, y);
        });
    }
    
    // Timeline Animation
    setupTimelineAnimation() {
        const timelineItems = $$('.timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInLeft 0.8s ease-out';
                    
                    // Animate timeline dot
                    const dot = entry.target.querySelector('.timeline-dot');
                    if (dot) {
                        setTimeout(() => {
                            dot.style.animation = 'pulse 2s ease-in-out infinite';
                        }, 500);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    // Certificações Animation
    setupCertificationsAnimation() {
        const certCards = $$('.certification-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger animation for certificates
                    const index = Array.from(certCards).indexOf(entry.target);
                    
                    setTimeout(() => {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                        
                        // Animate check mark
                        const checkmark = entry.target.querySelector('.cert-status');
                        if (checkmark) {
                            setTimeout(() => {
                                checkmark.style.animation = 'checkmark 0.5s ease-in-out';
                            }, 400);
                        }
                    }, index * 150);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        certCards.forEach(card => {
            observer.observe(card);
        });
    }
    
    // Utility function for easing
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// ===== SKILL CARD INTERACTIONS =====
class SkillCardInteractions {
    constructor() {
        this.skillCards = $$('.skill-card');
        this.init();
    }
    
    init() {
        this.setupHoverEffects();
        this.setupClickEffects();
    }
    
    setupHoverEffects() {
        this.skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightRelatedSkills(card);
                this.showSkillTooltip(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.resetSkillHighlights();
                this.hideSkillTooltip();
            });
        });
    }
    
    setupClickEffects() {
        this.skillCards.forEach(card => {
            card.addEventListener('click', () => {
                this.showSkillDetails(card);
            });
        });
    }
    
    highlightRelatedSkills(activeCard) {
        const category = activeCard.closest('.skill-category-enhanced');
        const categoryCards = category.querySelectorAll('.skill-card');
        
        // Dim all other cards
        this.skillCards.forEach(card => {
            if (!categoryCards.includes(card)) {
                card.style.opacity = '0.5';
            }
        });
        
        // Highlight category cards
        categoryCards.forEach(card => {
            card.style.opacity = '1';
            if (card !== activeCard) {
                card.style.transform = 'translateY(-2px)';
            }
        });
    }
    
    resetSkillHighlights() {
        this.skillCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = '';
        });
    }
    
    showSkillTooltip(card) {
        const level = card.getAttribute('data-level');
        const experience = card.getAttribute('data-experience');
        const skillName = card.querySelector('h4').textContent;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <strong>${skillName}</strong><br>
            Nível: ${level}%<br>
            Experiência: ${experience} anos
        `;
        
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 0.75rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-large);
            font-size: 0.875rem;
            z-index: 1000;
            pointer-events: none;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            animation: fadeIn 0.3s ease-out forwards;
        `;
        
        card.style.position = 'relative';
        card.appendChild(tooltip);
    }
    
    hideSkillTooltip() {
        const tooltip = $('.skill-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    showSkillDetails(card) {
        const skillName = card.querySelector('h4').textContent;
        const level = card.getAttribute('data-level');
        const experience = card.getAttribute('data-experience');
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);
        
        // Create modal or expanded view
        const modal = document.createElement('div');
        modal.className = 'skill-modal';
        modal.innerHTML = `
            <div class="skill-modal-content">
                <button class="skill-modal-close">&times;</button>
                <div class="skill-modal-header">
                    <h3>${skillName}</h3>
                    <div class="skill-modal-level">
                        <span class="level-number">${level}%</span>
                        <span class="level-label">Proficiência</span>
                    </div>
                </div>
                <div class="skill-modal-body">
                    <p><strong>Experiência:</strong> ${experience} anos</p>
                    <div class="skill-modal-tags">
                        <strong>Tecnologias relacionadas:</strong>
                        <div class="tags-container">
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="skill-modal-progress">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${level}%; --fill-color: var(--primary-color);"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            animation: fadeIn 0.3s ease-out forwards;
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        const closeBtn = modal.querySelector('.skill-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
    }
}

// ===== PROJECT FILTERS =====
class ProjectFilters {
    constructor() {
        this.filterButtons = $$('.filter-btn');
        this.projectCards = $$('.project-card');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilter(button);
            });
        });
    }
    
    handleFilter(activeButton) {
        const filter = activeButton.getAttribute('data-filter');
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
        
        // Filter projects
        this.projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.classList.remove('filtered');
                card.style.display = 'block';
            } else {
                card.classList.add('filtered');
                setTimeout(() => {
                    if (card.classList.contains('filtered')) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Animate grid reflow
        setTimeout(() => {
            this.projectCards.forEach(card => {
                if (!card.classList.contains('filtered')) {
                    card.style.display = 'block';
                }
            });
        }, 350);
    }
}



// ===== LOADING SCREEN =====
class LoadingScreen {
    constructor() {
        this.loadingScreen = $('.loading-screen');
        this.loadingBar = $('.loading-bar');
        
        this.init();
    }
    
    init() {
        if (this.loadingScreen) {
            this.simulateLoading();
        }
    }
    
    simulateLoading() {
        // Simulate realistic loading time
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 2500);
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                this.loadingScreen.remove();
                document.body.classList.add('loaded');
            }, 500);
        }
    }
}

// ===== ENHANCED SCROLL ANIMATIONS =====
class EnhancedScrollAnimations extends ScrollAnimations {
    constructor() {
        super();
        this.setupAdvancedAnimations();
    }
    
    setupAdvancedAnimations() {
        const leftElements = $$('.about-text, .contact-info');
        const rightElements = $$('.about-image, .contact-form');
        
        leftElements.forEach(el => el.classList.add('slide-in-left'));
        rightElements.forEach(el => el.classList.add('slide-in-right'));
        
        // Enhanced observer for different animation types
        const advancedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.classList.contains('slide-in-left')) {
                        element.style.animationDelay = '0.3s';
                    } else if (element.classList.contains('slide-in-right')) {
                        element.style.animationDelay = '0.6s';
                    }
                    
                    element.classList.add('animated');
                    advancedObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        [...leftElements, ...rightElements].forEach(el => {
            advancedObserver.observe(el);
        });
    }
}

// ===== ENHANCED PERFORMANCE OPTIMIZER =====
class EnhancedPerformanceOptimizer extends PerformanceOptimizer {
    constructor() {
        super();
        this.setupIntelligentLoading();
    }
    
    setupIntelligentLoading() {
        // Preload critical images
        this.preloadCriticalImages();
        
        // Setup connection optimization
        this.optimizeConnections();
        
        // Monitor performance
        this.monitorPerformance();
    }
    
    preloadCriticalImages() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    optimizeConnections() {
        const origins = [
            'https://images.unsplash.com',
            'https://cdnjs.cloudflare.com',
            'https://fonts.googleapis.com'
        ];
        
        origins.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = origin;
            document.head.appendChild(link);
        });
    }
    
    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        console.log(`Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        }
    }
}

// ===== HERO STATS ANIMATION =====
class HeroStatsAnimation {
    constructor() {
        this.statNumbers = $$('.stat-number[data-count]');
        this.init();
    }
    
    init() {
        this.setupObserver();
    }
    
    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }
    
    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target > 10 ? '+' : '');
        }, 16);
    }
}

// ===== ENHANCED FLOATING ELEMENTS =====
class EnhancedFloatingElements extends FloatingElements {
    constructor() {
        super();
        this.setupMouseInteraction();
    }
    
    setupMouseInteraction() {
        const hero = $('.hero');
        if (!hero) return;
        
        let mouseX = 0;
        let mouseY = 0;
        
        hero.addEventListener('mousemove', (e) => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
            
            this.elements.forEach((element, index) => {
                const speed = parseFloat(element.dataset.speed) || 1;
                const moveX = (mouseX - 0.5) * 30 * speed;
                const moveY = (mouseY - 0.5) * 30 * speed;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
}

// ===== SCROLL INDICATOR =====
class ScrollIndicator {
    constructor() {
        this.indicator = $('.scroll-indicator');
        this.init();
    }
    
    init() {
        if (this.indicator) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        this.indicator.addEventListener('click', () => {
            const aboutSection = $('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Hide indicator on scroll
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 100;
            this.indicator.style.opacity = scrolled ? '0' : '1';
        });
    }
}

// ===== ENHANCED BUTTONS =====
class EnhancedButtons {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDownloadCV();
        this.setupButtonEffects();
    }
    
    setupDownloadCV() {
        const downloadBtn = $('[data-action="download-cv"]');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadCV();
            });
        }
    }
    
    setupButtonEffects() {
        const buttons = $$('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createRippleEffect(button);
            });
        });
    }
    
    createRippleEffect(button) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = -size / 2 + 'px';
        ripple.style.marginTop = -size / 2 + 'px';
        
        // Add ripple animation
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    downloadCV() {
        // Create notification for demo
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        `;
        notification.textContent = '📄 CV será baixado em breve!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== ENHANCED CODE CARD INTERACTIONS =====
class EnhancedCodeCardInteractions {
    constructor() {
        this.tabs = $$('.tab');
        this.cardContents = $$('.card-content');
        this.copyBtn = $('#copy-btn');
        this.playBtn = $('#play-btn');
        this.currentTab = 'portfolio';
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.setupTabSwitching();
        this.setupCopyButton();
        this.setupPlayButton();
        this.setupLineInteractions();
        this.initializeFirstTab();
    }
    
    setupTabSwitching() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Update tabs
        this.tabs.forEach(t => t.classList.remove('active'));
        const activeTab = this.tabs.find(t => t.dataset.tab === tabName);
        if (activeTab) activeTab.classList.add('active');
        
        // Update content
        this.cardContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = this.cardContents.find(c => c.dataset.content === tabName);
        if (targetContent) {
            targetContent.classList.add('active');
            this.currentTab = tabName;
            
            // Reset typing animation for new tab
            this.resetTypingAnimation(targetContent);
        }
    }
    
    setupCopyButton() {
        if (!this.copyBtn) return;
        
        this.copyBtn.addEventListener('click', () => {
            const activeContent = this.cardContents.find(c => c.classList.contains('active'));
            if (!activeContent) return;
            
            const codeText = this.extractCodeText(activeContent);
            this.copyToClipboard(codeText);
            this.showCopyFeedback();
        });
    }
    
    setupPlayButton() {
        if (!this.playBtn) return;
        
        this.playBtn.addEventListener('click', () => {
            if (this.isTyping) return;
            
            const activeContent = this.cardContents.find(c => c.classList.contains('active'));
            if (activeContent) {
                this.startTypingAnimation(activeContent);
            }
        });
    }
    
    setupLineInteractions() {
        this.cardContents.forEach(content => {
            const lines = content.querySelectorAll('.code-line');
            lines.forEach(line => {
                line.addEventListener('mouseenter', () => {
                    this.highlightLine(line);
                });
                
                line.addEventListener('click', () => {
                    this.animateLineClick(line);
                });
            });
        });
    }
    
    initializeFirstTab() {
        // Ensure first tab is active
        const firstTab = this.tabs.find(t => t.dataset.tab === 'portfolio');
        if (firstTab) {
            firstTab.classList.add('active');
        }
        
        const firstContent = this.cardContents.find(c => c.dataset.content === 'portfolio');
        if (firstContent) {
            firstContent.classList.add('active');
            this.resetTypingAnimation(firstContent);
            
            // Auto-start typing animation after a delay
            setTimeout(() => {
                this.startTypingAnimation(firstContent);
            }, 2000);
        }
    }
    
    resetTypingAnimation(content) {
        const lines = content.querySelectorAll('.typing-line');
        const codeElements = content.querySelectorAll('.code .keyword, .code .variable, .code .property, .code .string, .code .comment, .code .boolean, .code .selector, .code .number');
        
        // Reset lines
        lines.forEach(line => {
            line.classList.remove('visible', 'typing');
        });
        
        // Reset code elements
        codeElements.forEach(element => {
            element.classList.remove('visible');
        });
        
        // Make sure content is visible
        content.style.display = 'block';
        content.style.opacity = '1';
    }
    
    startTypingAnimation(content) {
        if (this.isTyping) return;
        this.isTyping = true;
        
        const lines = content.querySelectorAll('.typing-line');
        let currentLineIndex = 0;
        
        const animateLine = () => {
            if (currentLineIndex >= lines.length) {
                this.isTyping = false;
                return;
            }
            
            const line = lines[currentLineIndex];
            line.classList.add('visible', 'typing');
            
            // Animate code elements in this line
            const codeElements = line.querySelectorAll('.keyword, .variable, .property, .string, .comment, .boolean, .selector, .number');
            this.animateCodeElements(codeElements);
            
            // Remove typing class after delay
            setTimeout(() => {
                line.classList.remove('typing');
            }, 1000);
            
            currentLineIndex++;
            setTimeout(animateLine, 300);
        };
        
        animateLine();
    }
    
    animateCodeElements(elements) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 50);
        });
    }
    
    highlightLine(line) {
        line.classList.add('highlighted');
        setTimeout(() => {
            line.classList.remove('highlighted');
        }, 2000);
    }
    
    animateLineClick(line) {
        line.style.transform = 'scale(1.02)';
        line.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            line.style.transform = 'scale(1)';
        }, 200);
    }
    
    extractCodeText(content) {
        const lines = content.querySelectorAll('.code-line');
        let codeText = '';
        
        lines.forEach(line => {
            const codeElement = line.querySelector('.code');
            if (codeElement) {
                codeText += codeElement.textContent + '\n';
            }
        });
        
        return codeText;
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    showCopyFeedback() {
        const originalIcon = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        this.copyBtn.style.color = '#27ca3f';
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalIcon;
            this.copyBtn.style.color = '';
        }, 2000);
    }
}

// ===== ENHANCED CONTACT FORM FOR COMMERCIAL USE =====
class EnhancedContactForm extends ContactForm {
    constructor() {
        super();
        this.form = $('.contact-form');
        this.serviceSelect = $('#service');

        this.deadlineSelect = $('#deadline');
    }
    
    init() {
        super.init();
        this.setupServiceValidation();

        this.setupFormEnhancements();
    }
    
    setupServiceValidation() {
        if (this.serviceSelect) {
            this.serviceSelect.addEventListener('change', () => {

                this.updateDeadlineSuggestions();
            });
        }
    }
    

    
    setupFormEnhancements() {
        // Auto-fill suggestions based on service
        const serviceSuggestions = {
            website: {
                deadline: 'normal',
                message: 'Preciso de um site profissional para minha empresa com as seguintes funcionalidades:\n\n- Design responsivo\n- SEO otimizado\n- Painel administrativo\n- Integração com redes sociais\n\nPor favor, me envie um orçamento detalhado.'
            },
            ecommerce: {
                deadline: 'normal',
                message: 'Gostaria de desenvolver uma loja virtual completa com:\n\n- Sistema de pagamento\n- Gestão de produtos\n- Relatórios de vendas\n- Integração com marketplaces\n\nAguardo seu orçamento!'
            },
            mobile: {
                deadline: 'flexible',
                message: 'Preciso de um aplicativo mobile para iOS e Android com:\n\n- Interface moderna\n- Push notifications\n- Integração com APIs\n- Publicação nas lojas\n\nQual seria o investimento necessário?'
            }
        };
        
        if (this.serviceSelect) {
            this.serviceSelect.addEventListener('change', () => {
                const selectedService = this.serviceSelect.value;
                if (serviceSuggestions[selectedService]) {
                    const suggestion = serviceSuggestions[selectedService];
                    
                    if (this.deadlineSelect) {
                        this.deadlineSelect.value = suggestion.deadline;
                    }
                    
                    const messageTextarea = $('#message');
                    if (messageTextarea && !messageTextarea.value) {
                        messageTextarea.value = suggestion.message;
                    }
                }
            });
        }
    }
    

    
    updateDeadlineSuggestions() {
        const service = this.serviceSelect?.value;
        const deadlineOptions = {
            website: ['normal', 'flexible'],
            ecommerce: ['normal', 'flexible'],
            mobile: ['flexible'],
            custom: ['urgent', 'normal', 'flexible']
        };
        
        if (service && deadlineOptions[service] && this.deadlineSelect) {
            Array.from(this.deadlineSelect.options).forEach(option => {
                if (deadlineOptions[service].includes(option.value)) {
                    option.style.fontWeight = 'bold';
                    option.style.color = '#667eea';
                } else {
                    option.style.fontWeight = 'normal';
                    option.style.color = '';
                }
            });
        }
    }
    

    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Enhanced validation
        if (!this.validateCommercialForm(data)) {
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission
            await this.simulateCommercialSubmission(data);
            
            // Show success message
            this.showNotification('✅ Orçamento enviado com sucesso! Entraremos em contato em até 24 horas.', 'success');
            
            // Reset form
            this.form.reset();
            
            // Send WhatsApp message
            this.sendWhatsAppMessage(data);
            
        } catch (error) {
            this.showNotification('❌ Erro ao enviar orçamento. Tente novamente ou entre em contato via WhatsApp.', 'error');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    validateCommercialForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Email inválido');
        }
        
        if (!data.service) {
            errors.push('Selecione um tipo de projeto');
        }
        
        if (!data.message || data.message.trim().length < 20) {
            errors.push('Descreva seu projeto com pelo menos 20 caracteres');
        }
        
        if (errors.length > 0) {
            this.showNotification(`❌ ${errors.join(', ')}`, 'error');
            return false;
        }
        
        return true;
    }
    
    async simulateCommercialSubmission(data) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📧 Orçamento enviado:', data);
                resolve();
            }, 2000);
        });
    }
    
    sendWhatsAppMessage(data) {
        const serviceNames = {
            website: 'Website Profissional',
            ecommerce: 'E-commerce',
            mobile: 'Aplicativo Mobile',
            custom: 'Projeto Personalizado'
        };
        
        const message = `Olá! Solicitei um orçamento no seu site:

📋 *Projeto:* ${serviceNames[data.service] || 'Não especificado'}
⏰ *Prazo:* ${data.deadline || 'Não especificado'}

📝 *Detalhes:* ${data.message}

Aguardo seu retorno!`;
        
        const whatsappUrl = `https://wa.me/+5561999989402?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp after a short delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
    }
}

// ===== FLOATING CTA =====
class FloatingCTA {
    constructor() {
        this.cta = $('.floating-cta');
        this.closeBtn = $('.cta-close');
        this.hasShown = false;
        this.scrollThreshold = 1000; // Show after scrolling 1000px
    }
    
    init() {
        if (!this.cta) return;
        
        this.bindEvents();
        this.setupScrollTrigger();
        this.setupAutoHide();
    }
    
    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hide();
                this.savePreference();
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cta.classList.contains('show')) {
                this.hide();
                this.savePreference();
            }
        });
    }
    
    setupScrollTrigger() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollY = window.scrollY;
                
                if (scrollY > this.scrollThreshold && !this.hasShown && !this.getPreference()) {
                    this.show();
                    this.hasShown = true;
                }
            }, 100);
        });
    }
    
    setupAutoHide() {
        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (this.cta.classList.contains('show')) {
                this.hide();
            }
        }, 30000);
    }
    
    show() {
        if (this.cta) {
            this.cta.classList.remove('hide');
            this.cta.classList.add('show');
            
            // Add entrance animation
            this.cta.style.animation = 'slideInRight 0.6s ease-out';
        }
    }
    
    hide() {
        if (this.cta) {
            this.cta.classList.remove('show');
            this.cta.classList.add('hide');
        }
    }
    
    savePreference() {
        localStorage.setItem('cta-closed', 'true');
    }
    
    getPreference() {
        return localStorage.getItem('cta-closed') === 'true';
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading screen first
    new LoadingScreen();
    
    // Initialize all components
    new Navigation();
    new EnhancedScrollAnimations();
    new EnhancedContactForm(); // Enhanced commercial form
    new EnhancedFloatingElements();
    new ScrollToTop();
    new EnhancedPerformanceOptimizer();
    new MotionUtils();
    new EnhancedSkillsSystem();
    new SkillCardInteractions();
    new ProjectFilters();
    new HeroStatsAnimation();
    new ScrollIndicator();
    new EnhancedButtons();
    new EnhancedCodeCardInteractions();
    new FloatingCTA(); // Initialize Floating CTA
    
    // Initialize enhanced typing animation
    const typingElement = $('.typing-text');
    if (typingElement) {
        new EnhancedTypingAnimation(typingElement, [
            'Desenvolvedor Full Stack & Designer',
            'Especialista em Vue.js', 
            'Designer Gráfico',
            'Desenvolvedor Mobile',
            'Criador de Soluções Web'
        ]);
    }
    
    console.log('✨ Portfólio premium com seção hero e skills revolucionárias!');
});

// ===== UTILITY FUNCTIONS FOR EXTERNAL USE =====
window.portfolioUtils = {
    scrollToSection: (sectionId) => {
        const section = $(sectionId);
        const header = $('.header');
        
        if (section && header) {
            const targetPosition = section.offsetTop - header.offsetHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    showNotification: (message, type = 'info') => {
        const contactForm = new ContactForm();
        contactForm.showNotification(message, type);
    }
};

// ===== SERVICE WORKER REGISTRATION (Optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 