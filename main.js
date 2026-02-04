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

        let items = Array.from(track.querySelectorAll('.carousel-item'));
        const originalLength = items.length;
        const gap = 10;

        if (originalLength === 0) return;

        // Clone items for infinite effect
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
        items.reverse().forEach(item => {
            const clone = item.cloneNode(true);
            track.insertBefore(clone, track.firstChild);
        });

        // Re-query items after cloning
        const allItems = track.querySelectorAll('.carousel-item');
        let index = originalLength;
        let isTransitioning = false;

        const updateCarousel = (instant = false) => {
            const itemWidth = allItems[0].offsetWidth;
            if (instant) track.style.transition = 'none';
            else track.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';

            track.style.transform = `translateX(-${index * (itemWidth + gap)}px)`;
        };

        // Initial position
        updateCarousel(true);

        const handleLoop = () => {
            isTransitioning = false;
            const itemWidth = allItems[0].offsetWidth;

            if (index >= originalLength * 2) {
                index = originalLength;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${index * (itemWidth + gap)}px)`;
            } else if (index < originalLength) {
                index = originalLength * 2 - 1;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${index * (itemWidth + gap)}px)`;
            }
        };

        track.addEventListener('transitionend', handleLoop);

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            index++;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            index--;
            updateCarousel();
        });

        window.addEventListener('resize', () => updateCarousel(true));

        // Force update once page is fully loaded to ensure correct widths
        window.addEventListener('load', () => updateCarousel(true));

        // Also update when individual images load (fallback)
        allItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                if (img.complete) {
                    updateCarousel(true);
                } else {
                    img.addEventListener('load', () => updateCarousel(true));
                }
            }
        });

        // Continuous smooth auto-scroll
        let scrollOffset = 0;
        // Alternate direction: even index = right (positive), odd index = left (negative)
        const scrollDirection = carouselIndex % 2 === 0 ? 1 : -1;
        const scrollSpeed = 0.5 * scrollDirection; // Pixels per frame
        let isPaused = false;

        const continuousScroll = () => {
            if (!isPaused && !isTransitioning) {
                scrollOffset += scrollSpeed;
                const itemWidth = allItems[0].offsetWidth;
                const singleSetWidth = originalLength * (itemWidth + gap);

                // Reset offset seamlessly when we've scrolled one full set
                if (scrollOffset >= singleSetWidth) {
                    scrollOffset = 0;
                }
                if (scrollOffset < 0) {
                    scrollOffset = singleSetWidth;
                }

                track.style.transition = 'none';
                track.style.transform = `translateX(-${(index * (itemWidth + gap)) + scrollOffset}px)`;
            }
            requestAnimationFrame(continuousScroll);
        };

        requestAnimationFrame(continuousScroll);

        // Pause on hover for manual control
        // Pause on hover/interaction for manual control, resume after delay
        const carouselContainer = section.querySelector('.carousel-container');
        let resumeTimeout;

        if (carouselContainer) {
            const pauseCarousel = () => {
                isPaused = true;
                clearTimeout(resumeTimeout);
            };

            const resumeCarousel = () => {
                resumeTimeout = setTimeout(() => {
                    isPaused = false;
                }, 3000); // Resume after 3 seconds of inactivity
            };

            // Mouse events
            carouselContainer.addEventListener('mouseenter', pauseCarousel);
            carouselContainer.addEventListener('mouseleave', () => {
                resumeCarousel();
            });

            // Touch events for mobile
            carouselContainer.addEventListener('touchstart', pauseCarousel, { passive: true });
            carouselContainer.addEventListener('touchend', resumeCarousel);
        }
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

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Stagger Animations for Grids
    const staggerGrids = () => {
        document.querySelectorAll('.editorial-grid, .contact-grid-layout').forEach(grid => {
            const items = grid.querySelectorAll('.grid-item, .contact-block');
            items.forEach((item, index) => {
                item.classList.add('reveal'); // Ensure transparency
                // Cycle through delays: 0, 100, 200, 300
                const delay = (index % 4) * 100;
                if (delay > 0) item.classList.add(`delay-${delay}`);
                observer.observe(item);
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

        let lastWidth = window.innerWidth;

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
                ctx.save(); // Save context state
                if (this.isBurgundy) {
                    ctx.shadowBlur = 10; // Glow effect
                    ctx.shadowColor = '#ff3366'; // Bright glow color
                }
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore(); // Restore to avoid affecting next particles
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();
    };

    initDust();
});
