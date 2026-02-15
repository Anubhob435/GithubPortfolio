/* ============================================================
   ANUBHOB DEY — PORTFOLIO JS
   Theme, animations, chat, GitHub repos, typewriter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Hide loader
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hide'), 400);
    });
    // Fallback: hide after 2s regardless
    setTimeout(() => loader.classList.add('hide'), 2000);

    initTheme();
    initNav();
    initScrollAnimations();
    initTypewriter();
    initStats();
    initCarousel();
    initAllTabs();
    initExpertiseCarousel();
    initContactForm();
    initChat();
    initBackToTop();
    fetchGitHubRepos();
});

/* --- UTILITY: Throttle --- */
function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
        const now = performance.now();
        if (now - last >= wait) {
            last = now;
            fn.apply(this, args);
        }
    };
}

/* --- THEME --- */
function initTheme() {
    const btn = document.getElementById('theme-btn');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = localStorage.getItem('theme');

    if (saved === 'dark' || (!saved && prefersDark.matches)) {
        document.body.classList.add('dark');
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
}

/* --- NAVIGATION --- */
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    const scrollHint = document.getElementById('scroll-hint');
    const sections = document.querySelectorAll('section[id]');

    // Single throttled scroll handler for nav effects + active link
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        nav.classList.toggle('scrolled', scrollY > 50);
        if (scrollHint) scrollHint.classList.toggle('hide', scrollY > 300);

        // Active link on scroll
        const scrollPos = scrollY + 120;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            const link = links.querySelector(`a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
            }
        });
    }, 50), { passive: true });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });
}

/* --- SCROLL ANIMATIONS (Intersection Observer) --- */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* --- TYPEWRITER --- */
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
        'Software Developer',
        'Data Engineer',
        'AI Enthusiast',
        'Problem Solver',
        'Web Developer'
    ];

    let phraseIdx = 0, charIdx = 0, deleting = false;

    function type() {
        const current = phrases[phraseIdx];
        if (deleting) {
            el.textContent = current.substring(0, charIdx - 1);
            charIdx--;
        } else {
            el.textContent = current.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = deleting ? 40 : 120;

        if (!deleting && charIdx === current.length) {
            speed = 1800;
            deleting = true;
        } else if (deleting && charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            speed = 400;
        }

        setTimeout(type, speed);
    }

    setTimeout(type, 800);
}

/* --- STATS ANIMATION --- */
function initStats() {
    function animateNum(el, target, duration) {
        if (!el) return;
        const startTime = performance.now();
        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNum(document.getElementById('stat-repos'), 68, 1500);
                animateNum(document.getElementById('stat-contribs'), 1827, 2000);
                animateNum(document.getElementById('stat-stars'), 218, 1800);
                animateNum(document.getElementById('stat-streak'), 395, 1600);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) observer.observe(statsEl);
}

/* --- VERTICAL CAROUSEL --- */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    const viewport = document.getElementById('carousel-viewport');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!track || !viewport) return;

    const slides = track.querySelectorAll('.carousel-slide');
    const total = slides.length;
    let current = 0;

    // Set viewport height to first slide height
    function setViewportHeight() {
        const slideHeight = slides[current].offsetHeight;
        viewport.style.height = slideHeight + 'px';
    }

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to project ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    function updateDots() {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function updateButtons() {
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, total - 1));
        const offset = slides[current].offsetTop - track.offsetTop;
        track.style.transform = `translateY(-${offset}px)`;
        setViewportHeight();
        updateDots();
        updateButtons();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Keyboard support
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
    });

    // Touch/swipe support
    let touchStartY = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        const diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
    });

    // Initial setup
    setViewportHeight();
    updateButtons();

    // Recalculate on resize
    window.addEventListener('resize', () => goTo(current));
}

/* --- ALL TABS (Skills + Leadership/Awards/Interests) --- */
function initAllTabs() {
    // Skills tabs
    document.querySelectorAll('.skill-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skill-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.skill-tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    // Leadership/Awards/Interests tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.section') || document;
            parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(`panel-${btn.dataset.tab}`);
            if (panel) panel.classList.add('active');
        });
    });
}

/* --- EXPERTISE HORIZONTAL CAROUSEL --- */
function initExpertiseCarousel() {
    const track = document.getElementById('expertise-track');
    const viewport = document.getElementById('expertise-viewport');
    const prevBtn = document.getElementById('expertise-prev');
    const nextBtn = document.getElementById('expertise-next');
    const dotsContainer = document.getElementById('expertise-dots');
    if (!track || !viewport) return;

    const cards = track.querySelectorAll('.expertise-card');
    let current = 0;
    let visibleCount = getVisibleCount();
    let totalSteps = Math.max(1, cards.length - visibleCount + 1);

    function getVisibleCount() {
        if (window.innerWidth <= 768) return 1;
        return 2;
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSteps; i++) {
            const dot = document.createElement('button');
            dot.className = 'expertise-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        dotsContainer.querySelectorAll('.expertise-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function updateButtons() {
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= totalSteps - 1;
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, totalSteps - 1));
        const card = cards[current];
        const gap = 20;
        const offset = current * (card.offsetWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
        updateButtons();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let touchStartX = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
    });

    // Auto-play
    let autoPlay = setInterval(() => {
        if (current >= totalSteps - 1) current = -1;
        goTo(current + 1);
    }, 4000);

    // Pause on hover
    viewport.addEventListener('mouseenter', () => clearInterval(autoPlay));
    viewport.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            if (current >= totalSteps - 1) current = -1;
            goTo(current + 1);
        }, 4000);
    });

    buildDots();
    updateButtons();

    // Recalculate on resize
    window.addEventListener('resize', () => {
        visibleCount = getVisibleCount();
        totalSteps = Math.max(1, cards.length - visibleCount + 1);
        current = Math.min(current, totalSteps - 1);
        buildDots();
        goTo(current);
    });
}



/* --- CONTACT FORM --- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const resp = document.getElementById('form-response');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = new FormData(form);
            const res = await fetch('/submit_form', { method: 'POST', body: data });
            const json = await res.json();
            resp.textContent = json.message;
            resp.className = `form-response ${json.success ? 'success' : 'error'}`;
            resp.classList.remove('hidden');
            if (json.success) {
                form.reset();
                setTimeout(() => resp.classList.add('hidden'), 4000);
            }
        } catch {
            resp.textContent = 'Something went wrong. Please try again.';
            resp.className = 'form-response error';
            resp.classList.remove('hidden');
        }
    });
}

/* --- CHAT WIDGET --- */
function initChat() {
    const fab = document.getElementById('chat-fab');
    const box = document.getElementById('chat-box');
    const close = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');

    let sessionId = localStorage.getItem('chat_session') || ('s_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8));
    localStorage.setItem('chat_session', sessionId);

    fab.addEventListener('click', () => {
        const isOpen = box.classList.toggle('open');
        fab.classList.toggle('active', isOpen);
        if (isOpen) input.focus();
    });

    close.addEventListener('click', () => {
        box.classList.remove('open');
        fab.classList.remove('active');
    });

    function addMsg(text, type) {
        const div = document.createElement('div');
        div.className = `msg msg-${type}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function addTyping() {
        const div = document.createElement('div');
        div.className = 'msg msg-bot msg-typing';
        div.id = 'typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const t = document.getElementById('typing');
        if (t) t.remove();
    }

    async function sendMsg() {
        const text = input.value.trim();
        if (!text) return;
        addMsg(text, 'user');
        input.value = '';
        send.disabled = true;
        addTyping();

        try {
            const res = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, session_id: sessionId })
            });
            const data = await res.json();
            removeTyping();
            addMsg(data.response, 'bot');
            if (data.session_id) {
                sessionId = data.session_id;
                localStorage.setItem('chat_session', sessionId);
            }
        } catch {
            removeTyping();
            addMsg('Sorry, something went wrong. Try again later.', 'bot');
        }
        send.disabled = false;
    }

    send.addEventListener('click', sendMsg);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });
}

/* --- BACK TO TOP --- */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', throttle(() => {
        btn.classList.toggle('show', window.scrollY > 500);
    }, 100), { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --- GITHUB REPOS --- */
async function fetchGitHubRepos() {
    const container = document.getElementById('github-repos');
    if (!container) return;

    const LANG_COLORS = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        HTML: '#e34c26',
        CSS: '#563d7c',
        'C#': '#178600',
        Go: '#00ADD8',
        Rust: '#dea584',
        Jupyter: '#DA5B0B',
    };

    try {
        const res = await fetch('/get_projects');
        const projects = await res.json();

        if (projects.error) {
            container.innerHTML = `<p class="loading-placeholder">${projects.error}</p>`;
            return;
        }

        // Exclude the 4 featured project repo names
        const featured = ['trackbeesbetav2.0', 'webscrapper-ai-analyzer', 'midpay', 'ipl_predictor'];
        const filtered = projects.filter(p => !featured.includes(p.name.toLowerCase())).slice(0, 3);

        if (filtered.length === 0) {
            container.innerHTML = '<p class="loading-placeholder">No additional repositories found.</p>';
            return;
        }

        container.innerHTML = '';

        filtered.forEach(p => {
            const daysAgo = Math.max(1, Math.floor((Date.now() - new Date(p.updated_at)) / 86400000));
            const color = LANG_COLORS[p.language] || '#8b949e';

            const card = document.createElement('div');
            card.className = 'repo-card fade-up visible';
            card.innerHTML = `
                <div class="repo-card-header">
                    <h4>${p.name}</h4>
                    <a href="${p.url}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
                </div>
                <p>${p.description || 'No description'}</p>
                <div class="repo-card-footer">
                    ${p.language ? `<div class="repo-lang"><span class="repo-lang-dot" style="background:${color}"></span>${p.language}</div>` : '<span></span>'}
                    <div class="repo-stars"><i class="far fa-star"></i> ${p.stars}</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch {
        container.innerHTML = '<p class="loading-placeholder">Failed to load repositories.</p>';
    }
}
