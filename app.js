document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       CANVAS PARTICLE SYSTEM — Scroll-reactive with trails
       ============================================================ */
    const canvas = document.getElementById('hero-particles');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        const hero = canvas.closest('.hero');
        let W, H;
        let scrollVelocity = 0;
        let lastScrollY = window.scrollY;
        let particles = [];
        let animationId = null;

        const PARTICLE_COUNT = 60;
        const TRAIL_LENGTH = 12;
        const BASE_SPEED = 0.3;
        const SCROLL_FORCE = 2.5;
        const FRICTION = 0.92;

        const COLORS = [
            { r: 99,  g: 102, b: 241 },  // indigo
            { r: 168, g: 85,  b: 247 },  // violet
            { r: 6,   g: 182, b: 212 },  // cyan
            { r: 139, g: 92,  b: 246 },  // purple
            { r: 59,  g: 130, b: 246 },  // blue
        ];

        function resize() {
            const rect = hero.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            W = rect.width;
            H = rect.height;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function createParticle() {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const radius = Math.random() * 2.5 + 0.8;
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * BASE_SPEED,
                vy: (Math.random() - 0.5) * BASE_SPEED,
                radius: radius,
                baseRadius: radius,
                color: color,
                alpha: Math.random() * 0.5 + 0.2,
                trail: [],                   // array of {x, y} past positions
                drift: Math.random() * 0.002 + 0.001,  // gentle drift speed
                phase: Math.random() * Math.PI * 2,
            };
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(createParticle());
            }
        }

        // Track scroll velocity
        function onScroll() {
            const currentScrollY = window.scrollY;
            scrollVelocity = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;
        }

        function update() {
            const time = performance.now() * 0.001;

            for (const p of particles) {
                // Save position to trail
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > TRAIL_LENGTH) {
                    p.trail.shift();
                }

                // Gentle organic drift
                p.vx += Math.sin(time * 0.5 + p.phase) * p.drift;
                p.vy += Math.cos(time * 0.3 + p.phase) * p.drift;

                // Scroll force — drags particles downward/upward
                p.vy += scrollVelocity * SCROLL_FORCE * 0.01;

                // Lateral scatter from scroll (slight random horizontal push)
                p.vx += scrollVelocity * (Math.random() - 0.5) * 0.015;

                // Friction
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Stretch radius when moving fast (gives a sense of speed)
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                p.radius = p.baseRadius + speed * 0.5;

                // Wrap around edges
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;
            }

            // Decay scroll velocity each frame
            scrollVelocity *= 0.85;
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            for (const p of particles) {
                const { r, g, b } = p.color;

                // Draw trail
                if (p.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x, p.trail[0].y);

                    for (let i = 1; i < p.trail.length; i++) {
                        ctx.lineTo(p.trail[i].x, p.trail[i].y);
                    }
                    ctx.lineTo(p.x, p.y);

                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.15})`;
                    ctx.lineWidth = p.radius * 0.8;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();

                    // Glowing trail — wider, more transparent
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.05})`;
                    ctx.lineWidth = p.radius * 2.5;
                    ctx.stroke();
                }

                // Draw particle (main dot)
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
                ctx.fill();

                // Soft glow around particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                const glow = ctx.createRadialGradient(
                    p.x, p.y, p.radius * 0.5,
                    p.x, p.y, p.radius * 3
                );
                glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.3})`);
                glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = glow;
                ctx.fill();
            }
        }

        function loop() {
            update();
            draw();
            animationId = requestAnimationFrame(loop);
        }

        // Initialize
        resize();
        initParticles();

        window.addEventListener('resize', () => {
            resize();
            // Re-clamp particles to new bounds
            for (const p of particles) {
                if (p.x > W) p.x = Math.random() * W;
                if (p.y > H) p.y = Math.random() * H;
            }
        });

        window.addEventListener('scroll', onScroll, { passive: true });

        // Only animate when hero is visible (performance)
        const heroObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (!animationId) loop();
                } else {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                }
            },
            { threshold: 0 }
        );
        heroObserver.observe(hero);
    }


    /* ============================================================
       SCROLL REVEAL FALLBACK — IntersectionObserver
       (Only runs when native scroll-driven animations are unsupported)
       ============================================================ */
    const supportsScrollDriven = CSS.supports(
        '(animation-timeline: view()) and (animation-range: entry)'
    );

    if (!supportsScrollDriven) {
        const revealElements = document.querySelectorAll('.scroll-reveal');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.12,
        };

        const revealOnScroll = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger child skill-tags if present
                    const tags = entry.target.querySelectorAll('.skill-tag');
                    if (tags.length > 0) {
                        tags.forEach((tag, i) => {
                            tag.style.opacity = '0';
                            tag.style.transform = 'translateY(15px) scale(0.9)';
                            tag.style.transition = `opacity 0.5s ${i * 0.06}s cubic-bezier(0.16,1,0.3,1), transform 0.5s ${i * 0.06}s cubic-bezier(0.16,1,0.3,1)`;
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    tag.style.opacity = '1';
                                    tag.style.transform = 'translateY(0) scale(1)';
                                });
                            });
                        });
                    }

                    // Stagger experience items if present
                    const items = entry.target.querySelectorAll('.experience-item');
                    if (items.length > 0) {
                        items.forEach((item, i) => {
                            item.style.opacity = '0';
                            item.style.transform = 'translateX(-20px)';
                            item.style.transition = `opacity 0.6s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1), transform 0.6s ${i * 0.15}s cubic-bezier(0.16,1,0.3,1)`;
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    item.style.opacity = '1';
                                    item.style.transform = 'translateX(0)';
                                });
                            });
                        });
                    }

                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(revealOnScroll, observerOptions);
            revealElements.forEach((el) => {
                observer.observe(el);
            });
        } else {
            revealElements.forEach((el) => {
                el.classList.add('active');
            });
        }
    }

    /* ============================================================
       SMOOTH HOVER GLOW TRACKING ON CARDS
       ============================================================ */
    if (!prefersReducedMotion) {
        const cards = document.querySelectorAll('.card');

        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty(
                    'background',
                    `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.04), transparent 40%), rgba(255, 255, 255, 0.035)`
                );
            });

            card.addEventListener('mouseleave', () => {
                card.style.removeProperty('background');
            });
        });
    }
});
