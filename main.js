document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Sticky Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Smooth Scroll offset for sticky header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Carousel Logic (Reusable component)
    const initCarousel = (section, carouselIndex) => {
        const track = section.querySelector('.carousel-track');
        const nextBtn = section.querySelector('.nav-btn.next');
        const prevBtn = section.querySelector('.nav-btn.prev');
        if (!track || !nextBtn || !prevBtn) return;

        const originalItems = Array.from(track.querySelectorAll('.carousel-item'));
        const n = originalItems.length;
        if (n === 0) return;

        const gap = 10;
        
        // Ensure enough clones for stability (Total 4 sets)
        for(let i=0; i<3; i++) {
            originalItems.forEach(item => track.appendChild(item.cloneNode(true)));
        }

        const allItems = track.querySelectorAll('.carousel-item');
        let currentX = 0;
        let isPaused = false;
        let isManualTransition = false;
        let pauseTimeout;
        const direction = carouselIndex % 2 === 0 ? 1 : -1;
        const speed = 0.5 * direction;

        const getItemWidth = (el) => el.offsetWidth + gap;
        
        const getSetWidth = () => {
            let total = 0;
            for(let i = 0; i < n; i++) {
                total += getItemWidth(originalItems[i]);
            }
            return total;
        };

        const updateTrack = (instant = false) => {
            track.style.transition = instant ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            track.style.transform = `translateX(-${currentX}px)`;
        };

        const resetPosition = () => {
            const sw = getSetWidth();
            if (sw === 0) return;
            // Stay within CloneSet 1 [sw, 2*sw)
            while (currentX >= 2 * sw) currentX -= sw;
            while (currentX < sw) currentX += sw;
            updateTrack(true);
        };

        const handleManualNav = (dir) => {
            if (isManualTransition) return;
            isPaused = true;
            isManualTransition = true;
            clearTimeout(pauseTimeout);

            const sw = getSetWidth();
            const avgW = sw / n;
            
            // Move approximately to the next/prev based on average width
            // Since we use variable widths, we'll snap to the nearest item in resetPosition later
            // For now, simple jump is enough for UX
            currentX += avgW * dir;
            
            updateTrack();

            // Set state to transitioning so auto-scroll doesn't fight the CSS transition
            setTimeout(() => {
                isManualTransition = false;
                resetPosition(); // Silent snap to keep within bounds
            }, 650);

            pauseTimeout = setTimeout(() => {
                isPaused = false;
            }, 3000); // 3 second pause
        };

        nextBtn.addEventListener('click', () => handleManualNav(1));
        prevBtn.addEventListener('click', () => handleManualNav(-1));

        const animate = () => {
            if (!isPaused && !isManualTransition) {
                currentX += speed;
                const sw = getSetWidth();
                if (sw > 0) {
                    if (currentX >= 2 * sw) currentX -= sw;
                    if (currentX < sw) currentX += sw;
                }
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentX}px)`;
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resetPosition);
        window.addEventListener('load', resetPosition);
        setTimeout(resetPosition, 100);
        requestAnimationFrame(animate);
    };

    // Initialize all carousels with index for alternating direction
    document.querySelectorAll('.carousel-section').forEach((section, index) => {
        initCarousel(section, index);
    });

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg && closeBtn) {
        // Select all relevant images: Gallery, Carousel, Features, Team Members
        document.querySelectorAll('.grid-item img, .carousel-item img, .feature-image img, .team-member__photo img').forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop scrolling
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxImg) {
                closeLightbox();
            }
        });
    }

    // Hero Scroll Rotation with Inertia (Lerp)
    const scrollWrapper = document.querySelector('.symbol-scroll-wrapper');
    if (scrollWrapper) {
        let currentRotation = 0;
        let targetRotation = 0;

        // Listen to scroll to update target
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            // 1 degree per 5 pixels
            targetRotation = scrollPos / 5;
        });

        const updateRotation = () => {
            // Linear Interpolation for smooth inertia
            // Value moves 5% of the way to the target every frame
            currentRotation += (targetRotation - currentRotation) * 0.05;

            scrollWrapper.style.transform = `rotate(${currentRotation}deg)`;
            requestAnimationFrame(updateRotation);
        };

        // Start the animation loop
        requestAnimationFrame(updateRotation);
    }

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Track only text reveals
    document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));

    // Stagger Animations for Grids
    const staggerGrids = () => {
        document.querySelectorAll('.editorial-grid, .contact-grid-layout').forEach(grid => {
            const items = grid.querySelectorAll('.grid-item, .contact-block');
            items.forEach((item, index) => {
                const target = item.classList.contains('reveal-text') 
                    ? item 
                    : item.querySelector('.reveal-text');
                
                if (target) {
                    const delay = (index % 4) * 100;
                    if (delay > 0) target.classList.add(`delay-${delay}`);
                    observer.observe(target);
                }
            });
        });
    };

    staggerGrids();

    // Typography Coloring: Only the 3rd letter of section titles
    const colorizeText = () => {
        const headings = document.querySelectorAll('.section-title');

        headings.forEach(heading => {
            if (heading.dataset.colorized) return;

            const text = heading.innerText;
            let newHtml = '';
            let letterCount = 0;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Check if it's a visible letter (not space)
                if (char.match(/[a-zA-Zа-яА-Я]/)) {
                    letterCount++;
                    // Only the 3rd letter gets colored
                    if (letterCount === 3) {
                        newHtml += `<span class="text-burgundy">${char}</span>`;
                    } else {
                        newHtml += char;
                    }
                } else {
                    newHtml += char;
                }
            }

            heading.innerHTML = newHtml;
            heading.dataset.colorized = 'true';
        });
    };

    colorizeText();

    // Dust Particle System
    const initDust = () => {
        const canvas = document.getElementById('dust-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Configuration
        const particleCount = 60; // Not too crowded
        const connectionDistance = 100; // Unused for simple dust, but good for constellation fx

        let lastWidth = 0; // Initialize to 0 to ensure first resize runs

        const resize = () => {
            // Only resize if width changes (ignores mobile URL bar height changes)
            if (window.innerWidth !== lastWidth) {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
                lastWidth = window.innerWidth;
                initParticles();
            }
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.3; // Very slow horizontal drift
                this.vy = (Math.random() - 0.5) * 0.3; // Very slow vertical drift
                this.size = Math.random() * 2 + 0.5; // Tiny specks

                // 30% chance to be burgundy (Glowing)
                this.isBurgundy = Math.random() > 0.7;

                if (this.isBurgundy) {
                    this.alpha = Math.random() * 0.4 + 0.6; // Much more visible (0.6 - 1.0)
                    this.color = `rgba(128, 0, 32, ${this.alpha})`;
                    this.size += 1; // Slightly larger
                } else {
                    this.alpha = Math.random() * 0.5 + 0.1; // Semi-transparent black
                    this.color = `rgba(0, 0, 0, ${this.alpha})`;
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around screen
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                if (this.isBurgundy) {
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ff3366';
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // Use IntersectionObserver to track if dust should be visible
        let isDustVisible = false;
        const dustObserver = new IntersectionObserver((entries) => {
            isDustVisible = entries.some(entry => entry.isIntersecting);
        }, { threshold: 0 });

        const hero = document.getElementById('hero');
        const contact = document.getElementById('contact');
        if (hero) dustObserver.observe(hero);
        if (contact) dustObserver.observe(contact);

        const animate = () => {
            if (isDustVisible) {
                canvas.style.opacity = '1';
                ctx.clearRect(0, 0, width, height);

                // Draw non-burgundy particles first (Batch 1)
                particles.forEach(p => {
                    if (!p.isBurgundy) {
                        p.update();
                        p.draw();
                    }
                });

                // Draw burgundy particles (Batch 2 - Selective save/restore for glow)
                particles.forEach(p => {
                    if (p.isBurgundy) {
                        p.update();
                        p.draw();
                    }
                });
            } else {
                canvas.style.opacity = '0';
            }

            requestAnimationFrame(animate);
        };


        window.addEventListener('resize', resize);
        resize();
        animate();
    };

    initDust();

    // Loading Bar Logic (Smooth & Fast)
    const loadingBar = document.querySelector('.loading-bar');
    let progress = 0;
    const progressInterval = setInterval(() => {
        // Smaller increments at a faster rate for a "liquid" feel
        const increment = Math.random() * 2 + 0.5; 
        progress += increment;
        
        if (progress > 92) {
            progress = 92; // Wait for real load
            clearInterval(progressInterval);
        }
        if (loadingBar) loadingBar.style.width = `${progress}%`;
    }, 40); // 40ms for high-frequency smoothness

    // Load Handling & Preloader
    const hidePreloader = () => {
        if (document.body.classList.contains('body-loaded')) return;
        
        clearInterval(progressInterval);
        if (loadingBar) loadingBar.style.width = '100%';

        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('body-loaded');
            
            const canvas = document.getElementById('dust-canvas');
            if (canvas) canvas.style.opacity = '1';
            
            setTimeout(() => {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active');
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);

                document.querySelectorAll('.reveal-text, .reveal-image').forEach(el => observer.observe(el));
            }, 100);
        }, 400);
    };

    // Failsafe: Show site after 3.5s regardless of asset load status
    const failsafeTimeout = setTimeout(hidePreloader, 3500);

    window.addEventListener('load', () => {
        clearTimeout(failsafeTimeout);
        hidePreloader();
    });
});
