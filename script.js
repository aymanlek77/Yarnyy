// =============================================
// YARNY — COMPLETE BUG-FIXED SCRIPT
// =============================================

// =============================================
// 0. TOAST NOTIFICATION (was MISSING — caused ReferenceError)
// =============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('welcomeToast');
    const msgEl = document.getElementById('welcomeMsg');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// =============================================
// 0b. TOGGLE PASSWORD (referenced in HTML onclick but was missing)
// =============================================
function togglePassword(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        iconEl.classList.remove('ph-eye');
        iconEl.classList.add('ph-eye-slash');
    } else {
        input.type = 'password';
        iconEl.classList.remove('ph-eye-slash');
        iconEl.classList.add('ph-eye');
    }
}

// =============================================
// 1. CUSTOM CURSOR
// =============================================
const dot = document.createElement('div');
dot.className = 'cursor-dot';
const ring = document.createElement('div');
ring.className = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
});

document.addEventListener('mousedown', () => ring.classList.add('clicking'));
document.addEventListener('mouseup', () => ring.classList.remove('clicking'));

function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

const hoverTargets = 'a, button, .pro-card, .compact-card, .creator-card-luxe, [onclick], .icon-btn, label, input, textarea, select, .toggle-password, .switch-link a';
document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});

// =============================================
// 2. PRELOADER
// =============================================
let preloaderDismissed = false;

function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    const preloader = document.getElementById('preloader');
    if (!preloader) { try { initAnimations(); } catch (e) { } return; }

    let count = 0;
    const counterEl = document.getElementById('loaderCounter');
    const countTimer = setInterval(() => {
        count += 2;
        if (counterEl) counterEl.innerText = Math.min(count, 100) + '%';
        if (count >= 100) clearInterval(countTimer);
    }, 25);

    setTimeout(() => {
        preloader.classList.add('finished');
        document.body.classList.remove('loading');
        try { initAnimations(); } catch (e) { console.warn('GSAP error:', e); }
        try { initHeroImage(); } catch (e) { }
    }, 1800);
}

document.addEventListener('DOMContentLoaded', dismissPreloader);
setTimeout(dismissPreloader, 500);

function initHeroImage() {
    const img = document.querySelector('.hero-img-main');
    if (img) setTimeout(() => img.classList.add('loaded'), 100);
}

// =============================================
// 3. SMOOTH SCROLL (LENIS)
// =============================================
const lenis = new Lenis({ duration: 1.3, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

document.querySelectorAll('.smooth-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
    });
});

// =============================================
// 4. NAVBAR SCROLL BEHAVIOR
// =============================================
// 4a. HERO NAVBAR BLUR ON SCROLL
// =============================================
(function () {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    function toggleHeroBlur() {
        if (window.scrollY > 0) nav.classList.add('navbar-hero-blur');
        else nav.classList.remove('navbar-hero-blur');
    }
    window.addEventListener('scroll', toggleHeroBlur, { passive: true });
    toggleHeroBlur();
})();

// =============================================
// 4. NAVBAR DYNAMIC THEME
// =============================================
(function () {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    // Sections that drive navbar color.
    // Video sections are intentionally ABSENT — they never change the navbar.
    const SECTION_THEME_MAP = {
        'showcase':            'light',
        'moroccoyarny-banner': 'moroccan', // Fix 2a: full-bleed blue photo → blue navbar
        'moroccan-touch':      'moroccan', // Fix 2b: beige mosaic section → still blue
        'clothes':             'light',
        'men':                 'light',
        'bags':                'light',
        'baby':                'light',
        'special':             'dark',
        'team':                'light',
        'reviews':             'light',
        'contact':             'light',
    };

    // Video section IDs — probe hits here → return null (no change)
    const VIDEO_IDS = new Set(['yarnyVideoSection', 'lpvSection']);

    const ALL_THEME_CLASSES = ['scrolled', 'navbar-dark', 'navbar-moroccan', 'navbar-zelij'];

    // Tracks the last confirmed non-video theme so videos inherit it
    let lastTheme = 'dark'; // Fix 1: hero default is dark

    function applyTheme(theme) {
        nav.classList.remove(...ALL_THEME_CLASSES);
        if (theme === 'dark')     nav.classList.add('navbar-dark');
        if (theme === 'moroccan') nav.classList.add('navbar-moroccan');
        if (theme === 'light')    nav.classList.add('scrolled');
    }

    function resolveTheme() {
        const probe = window.scrollY + nav.offsetHeight + 10;

        // Hero (<header class="hero-master">, no ID) → fully transparent
        const hero = document.querySelector('header.hero-master');
        if (hero) {
            const hTop = hero.offsetTop;
            const hBot = hTop + hero.offsetHeight;
            if (probe >= hTop && probe < hBot) return 'transparent';
        }

        // Fix 3: if probe is inside a video section → null (keep last theme)
        for (const vidId of VIDEO_IDS) {
            const el = document.getElementById(vidId);
            if (!el) continue;
            if (probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight) return null;
        }

        // Regular sections
        for (const [id, theme] of Object.entries(SECTION_THEME_MAP)) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight) return theme;
        }

        // Above all mapped sections = top of page / hero
        return 'transparent';
    }

    function updateNavbar() {
        const theme = resolveTheme();
        if (theme === null) return; // video section — do nothing, keep current look
        lastTheme = theme;
        applyTheme(theme);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    window.addEventListener('resize', updateNavbar, { passive: true });
    updateNavbar();
})();

// =============================================
// 5. 3D CARD TILT
// =============================================
function initCardTilt() {
    document.querySelectorAll('.pro-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -8;
            const rotY = ((x - cx) / cx) * 8;
            card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// =============================================
// 6. MAGNETIC BUTTONS
// =============================================
function initMagneticButtons() {
    document.querySelectorAll('.btn-hero-lumiere, .btn-prestige, .btn-gold-vip').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// =============================================
// 7. AUTH MANAGER — FIXED: no auto-login, proper flows
// =============================================
const AuthManager = (() => {
    const authOverlay = document.getElementById('authOverlay');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const profileSection = document.getElementById('profileSection');
    const userBtn = document.getElementById('userBtn');
    const dropdownName = document.getElementById('dropdownName');
    const userDropdown = document.getElementById('userDropdown');

    let currentUser = null;

    // FIX: Initialize isLoggedIn to false
    window.isLoggedIn = false;

    function save() {
        if (currentUser) localStorage.setItem('yarny_session', JSON.stringify(currentUser));
        else localStorage.removeItem('yarny_session');
    }

    function load() {
        try { return JSON.parse(localStorage.getItem('yarny_session')); }
        catch { return null; }
    }

    function switchView(view) {
        [loginSection, registerSection, profileSection].forEach(s => s && s.classList.remove('active'));
        const map = { login: loginSection, register: registerSection, profile: profileSection };
        const el = map[view];
        if (!el) return;
        el.classList.add('active');
        if (view !== 'profile') {
            el.style.opacity = 0;
            requestAnimationFrame(() => { el.style.transition = 'opacity 0.4s'; el.style.opacity = 1; });
        }
    }

    function setLoggedIn(user, silent = false) {
        currentUser = user;
        window.isLoggedIn = true;
        save();
        if (dropdownName) dropdownName.textContent = user.name;
        if (userBtn) {
            userBtn.classList.add('active');
            userBtn.innerHTML = '<i class="ph-fill ph-user-circle"></i><span class="status-dot" style="display:block"></span>';
        }
        if (!silent) showToast('Welcome back, ' + user.name + '!');
    }

    function setLoggedOut() {
        currentUser = null;
        window.isLoggedIn = false;
        save();
        if (dropdownName) dropdownName.textContent = 'Guest';
        if (userBtn) {
            userBtn.classList.remove('active');
            userBtn.innerHTML = '<i class="ph ph-user"></i><span class="status-dot" id="statusDot"></span>';
        }
        showToast("You've been signed out.");
    }

    function measureStrength(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    }

    function updateStrengthUI(pw) {
        const bar = document.querySelector('.pw-strength-bar');
        const label = document.querySelector('.pw-strength-label');
        if (!bar || !label) return;
        const score = measureStrength(pw);
        const widths = ['0%', '25%', '50%', '75%', '100%'];
        const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        bar.style.width = widths[score];
        bar.style.background = colors[score];
        label.textContent = labels[score];
        label.style.color = colors[score];
    }

    function validateField(input, message) {
        const wrap = input.closest('.modern-input,.ck-field');
        const errorEl = wrap && wrap.querySelector('.field-error');
        if (!input.value.trim()) {
            input.classList.add('input-invalid');
            if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
            return false;
        }
        input.classList.remove('input-invalid');
        if (errorEl) errorEl.classList.remove('show');
        return true;
    }

    function clearError(input) {
        input.classList.remove('input-invalid');
        const wrap = input.closest('.modern-input,.ck-field');
        const err = wrap && wrap.querySelector('.field-error');
        if (err) err.classList.remove('show');
    }

    function openDropdown() { userDropdown && userDropdown.classList.add('open'); }
    function closeDropdown() { userDropdown && userDropdown.classList.remove('open'); }

    function init() {
        // BUG FIX: Clear any stale session — user should login fresh
        // Remove this line if you want session persistence:
        localStorage.removeItem('yarny_session');
        window.isLoggedIn = false;

        // User button handler
        userBtn && userBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (window.isLoggedIn) {
                userDropdown && userDropdown.classList.contains('open') ? closeDropdown() : openDropdown();
            } else {
                authOverlay && authOverlay.classList.add('active');
                switchView('login');
                lenis.stop();
            }
        });

        document.addEventListener('click', e => {
            const wrap = document.getElementById('userDropdownWrap');
            if (wrap && !wrap.contains(e.target)) closeDropdown();
        });

        document.getElementById('ddLogout') && document.getElementById('ddLogout').addEventListener('click', e => {
            e.preventDefault();
            closeDropdown();
            setLoggedOut();
        });
        document.getElementById('ddProfile') && document.getElementById('ddProfile').addEventListener('click', e => {
            e.preventDefault();
            closeDropdown();
            authOverlay && authOverlay.classList.add('active');
            switchView('profile');
            lenis.stop();
        });
        document.getElementById('ddOrders') && document.getElementById('ddOrders').addEventListener('click', e => {
            e.preventDefault();
            closeDropdown();
            showToast('Orders feature coming soon!');
        });

        document.getElementById('closeAuth') && document.getElementById('closeAuth').addEventListener('click', () => {
            authOverlay.classList.remove('active');
            lenis.start();
        });
        authOverlay && authOverlay.addEventListener('click', e => {
            if (e.target === authOverlay) { authOverlay.classList.remove('active'); lenis.start(); }
        });

        window.showRegister = () => switchView('register');
        window.showLogin = () => switchView('login');

        // Register form
        const regForm = document.getElementById('registerForm');
        regForm && regForm.addEventListener('submit', e => {
            e.preventDefault();
            const nameEl = document.getElementById('regName');
            const emailEl = document.getElementById('regEmail');
            const pwEl = document.getElementById('regPass');
            let ok = true;
            if (!validateField(nameEl, 'Please enter your name')) ok = false;
            if (!validateField(emailEl, 'Please enter your email')) ok = false;
            if (!validateField(pwEl, 'Please enter a password')) ok = false;
            if (pwEl && measureStrength(pwEl.value) < 2) {
                pwEl.classList.add('input-invalid');
                const err = pwEl.parentElement && pwEl.parentElement.querySelector('.field-error');
                if (err) { err.textContent = 'Password too weak'; err.classList.add('show'); }
                ok = false;
            }
            if (!ok) return;
            setLoggedIn({ name: nameEl.value.trim(), email: emailEl.value.trim() });
            authOverlay.classList.remove('active');
            lenis.start();
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm && loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const emailEl = document.getElementById('logEmail');
            const pwEl = document.getElementById('logPass');
            let ok = true;
            if (emailEl && !validateField(emailEl, 'Please enter your email')) ok = false;
            if (pwEl && !validateField(pwEl, 'Please enter your password')) ok = false;
            if (!ok) return;
            const name = emailEl ? emailEl.value.split('@')[0] : 'Guest';
            setLoggedIn({ name, email: emailEl ? emailEl.value : '' });
            authOverlay.classList.remove('active');
            lenis.start();
        });

        // Logout
        document.getElementById('logoutBtn') && document.getElementById('logoutBtn').addEventListener('click', () => {
            authOverlay.classList.remove('active');
            lenis.start();
            setLoggedOut();
        });

        // Password strength
        const regPw = document.getElementById('regPass');
        if (regPw) {
            const wrap = regPw.closest('.field-wrap') || regPw.parentElement;
            if (wrap && !wrap.querySelector('.pw-strength-wrap')) {
                wrap.insertAdjacentHTML('beforeend',
                    '<div class="pw-strength-wrap"><div class="pw-strength-bar"></div></div><span class="pw-strength-label"></span>'
                );
            }
            regPw.addEventListener('input', () => updateStrengthUI(regPw.value));
        }

        // Error spans
        document.querySelectorAll('#loginForm .modern-input, #registerForm .modern-input').forEach(wrap => {
            if (!wrap.querySelector('.field-error')) {
                const span = document.createElement('span');
                span.className = 'field-error';
                wrap.appendChild(span);
            }
        });

        document.querySelectorAll('#registerForm input, #loginForm input').forEach(inp => {
            inp.addEventListener('input', () => clearError(inp));
        });
    }

    return { init, isLoggedIn: () => !!window.isLoggedIn, getUser: () => currentUser };
})();

// =============================================
// 8. CART MANAGER — FIXED
// =============================================
const CartManager = (() => {
    const VAT_RATE = 0.20;
    const SHIPPING_COST = 50;
    const FREE_SHIP_THRESH = 500;
    const STORAGE_KEY = 'yarny_cart';

    let cartData = [];

    const drawer = document.getElementById('cartDrawer');
    const overlayBg = document.getElementById('cartOverlay');
    const itemsEl = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShipping');
    const vatEl = document.getElementById('cartVAT');
    const totalEl = document.getElementById('cartFinalTotal');
    const countEl = document.getElementById('cartCount');
    const countHeader = document.getElementById('cartCountHeader');
    const progressBar = document.getElementById('shippingBar');
    const shippingText = document.getElementById('shippingText');

    function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData)); } catch { } }
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) cartData = JSON.parse(raw);
        } catch { }
    }

    function parsePrice(str) { return parseInt(String(str).replace(/[^0-9]/g, '')) || 0; }
    function getSubtotal() { return cartData.reduce((s, item) => s + parsePrice(item.price) * item.qty, 0); }
    function getShippingCost(sub) { return sub >= FREE_SHIP_THRESH ? 0 : SHIPPING_COST; }
    function getVAT(sub) { return Math.round(sub * VAT_RATE); }
    function getTotal(sub) { return sub + getShippingCost(sub) + getVAT(sub); }

    function animateCounter(el, newVal) {
        if (!el) return;
        el.style.transform = 'scale(1.4)';
        el.style.transition = 'transform 0.2s';
        setTimeout(() => { el.textContent = newVal; el.style.transform = 'scale(1)'; }, 120);
    }

    function render() {
        if (!itemsEl) return;
        itemsEl.innerHTML = '';
        const sub = getSubtotal();
        const shipping = getShippingCost(sub);
        const vat = getVAT(sub);
        const total = getTotal(sub);
        const count = cartData.reduce((s, i) => s + i.qty, 0);

        if (cartData.length === 0) {
            itemsEl.innerHTML = '<div class="empty-cart-msg"><div class="empty-cart-icon-wrap"><i class="ph ph-handbag"></i></div><p>Your bag is empty</p><small>Add something beautiful</small></div>';
        } else {
            cartData.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.dataset.idx = idx;
                row.innerHTML = `
                    <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                    <div class="cart-item-info">
                        <span class="cart-item-badge">Handmade</span>
                        <h4>${item.name}</h4>
                        <p>${item.price}</p>
                        <div class="cart-item-qty">
                            <button class="qty-btn qty-dec" data-idx="${idx}">−</button>
                            <span class="qty-num">${item.qty}</span>
                            <button class="qty-btn qty-inc" data-idx="${idx}">+</button>
                        </div>
                    </div>
                    <button class="cart-remove-btn cart-rm" data-idx="${idx}" title="Remove">
                        <i class="ph-bold ph-x"></i>
                    </button>`;
                itemsEl.appendChild(row);
            });
        }

        if (subtotalEl) subtotalEl.textContent = sub + ' MAD';
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'Free' : shipping + ' MAD';
            shippingEl.style.color = shipping === 0 ? '#2a9d5c' : '#999';
        }
        if (vatEl) vatEl.textContent = vat + ' MAD';
        if (totalEl) totalEl.textContent = total + ' MAD';

        const prevCount = parseInt(countEl ? countEl.textContent : 0);
        if (prevCount !== count) animateCounter(countEl, count);
        else if (countEl) countEl.textContent = count;
        if (countHeader) countHeader.textContent = '(' + count + ')';

        if (progressBar) progressBar.style.width = Math.min((sub / FREE_SHIP_THRESH) * 100, 100) + '%';
        if (shippingText) {
            if (sub >= FREE_SHIP_THRESH) {
                shippingText.innerHTML = '\u{1F389} <strong>Free Shipping Unlocked!</strong>';
            } else {
                shippingText.innerHTML = 'Add <strong>' + (FREE_SHIP_THRESH - sub) + ' MAD</strong> for Free Shipping';
            }
        }
        save();
    }

    function add(name, price, image, btnElement) {
        // BUG FIX: Require login but show a helpful message
        if (!window.isLoggedIn) {
            showToast('Please sign in to add items to your bag');
            document.getElementById('authOverlay').classList.add('active');
            window.showLogin && window.showLogin();
            lenis.stop();
            return;
        }
        const id = name.replace(/\s+/g, '_').toLowerCase();
        const existing = cartData.find(i => i.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cartData.push({ id, name, price, image, qty: 1 });
        }
        render();

        if (btnElement) {
            const w = btnElement.offsetWidth;
            btnElement.style.width = w + 'px';
            requestAnimationFrame(() => btnElement.classList.add('clicked'));
            setTimeout(() => { btnElement.classList.remove('clicked'); btnElement.style.width = ''; }, 2000);
        }

        const cartIcon = document.getElementById('openCart');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.3)';
            setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
        }

        showToast(name + ' added to bag!');
    }

    function remove(idx) {
        const rows = itemsEl ? itemsEl.querySelectorAll('.cart-item-row') : [];
        const row = rows[idx];
        if (row) {
            row.style.transform = 'translateX(20px)';
            row.style.opacity = '0';
            row.style.transition = '0.3s';
            setTimeout(() => { cartData.splice(idx, 1); render(); }, 300);
        } else {
            cartData.splice(idx, 1); render();
        }
    }

    function changeQty(idx, delta) {
        if (!cartData[idx]) return;
        cartData[idx].qty = Math.max(1, cartData[idx].qty + delta);
        render();
    }

    function clear() { cartData = []; render(); }
    function getData() { return cartData; }
    function open() { drawer && drawer.classList.add('open'); overlayBg && overlayBg.classList.add('open'); lenis.stop(); }
    function close() { drawer && drawer.classList.remove('open'); overlayBg && overlayBg.classList.remove('open'); lenis.start(); }

    function init() {
        load();
        render();

        document.getElementById('openCart') && document.getElementById('openCart').addEventListener('click', open);
        document.getElementById('closeCart') && document.getElementById('closeCart').addEventListener('click', close);
        overlayBg && overlayBg.addEventListener('click', close);

        document.getElementById('checkoutBtn') && document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (cartData.length === 0) {
                showToast('Your bag is empty!');
                return;
            }
            close();
            setTimeout(() => CheckoutManager.open(), 350);
        });

        itemsEl && itemsEl.addEventListener('click', e => {
            const inc = e.target.closest('.qty-inc');
            const dec = e.target.closest('.qty-dec');
            const rm = e.target.closest('.cart-rm');
            if (inc) changeQty(+inc.dataset.idx, +1);
            if (dec) changeQty(+dec.dataset.idx, -1);
            if (rm) remove(+rm.dataset.idx);
        });
    }

    return { init, add, remove, changeQty, clear, open, close, getData, getSubtotal, getVAT, getShippingCost, render };
})();

// === YARNY PRODUCT SYNC FIX START ===
// Expose globally — always reads the live <img src> from the card so the cart
// always reflects the current product image, regardless of stale onclick arguments.
window.addToCart = (name, price, image, btnEl) => {
    let actualImage = image;
    if (btnEl) {
        const cardRoot = btnEl.closest('.moroccan-card-wrap') ||
                         btnEl.closest('.arch-door') ||
                         btnEl.closest('.pro-card');
        const liveImg = cardRoot ? cardRoot.querySelector('img') : null;
        if (liveImg && liveImg.getAttribute('src')) {
            actualImage = liveImg.getAttribute('src');
        } else if (cardRoot && (cardRoot.dataset.image || cardRoot.dataset.img)) {
            actualImage = cardRoot.dataset.image || cardRoot.dataset.img;
        }
    }
    CartManager.add(name, price, actualImage, btnEl);
};
window.removeFromCart = (idx) => CartManager.remove(idx);
// === YARNY PRODUCT SYNC FIX END ===

// =============================================
// 15. WISHLIST MANAGER — FIXED
// =============================================
const WishlistManager = (() => {
    const STORAGE_KEY = 'yarny_wishlist';
    let items = new Map();

    const drawer = document.getElementById('wishlistDrawer');
    const overlayBg = document.getElementById('wishlistOverlay');
    const itemsEl = document.getElementById('wishlistItems');
    const countEl = document.getElementById('wishlistCount');
    const countHead = document.getElementById('wishlistCountHeader');

    function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...items.values()])); } catch { } }
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) JSON.parse(raw).forEach(item => items.set(item.id, item));
        } catch { }
    }

    function has(id) { return items.has(id); }

    function render() {
        if (!itemsEl) return;
        const count = items.size;

        if (countEl) {
            countEl.textContent = count;
            countEl.style.display = count > 0 ? '' : 'none';
        }
        if (countHead) countHead.textContent = '(' + count + ')';

        itemsEl.innerHTML = '';
        if (count === 0) {
            itemsEl.innerHTML = '<div class="empty-cart-msg"><div class="empty-cart-icon-wrap"><i class="ph ph-heart"></i></div><p>No favorites yet</p><small>Tap the heart on any piece you love</small></div>';
            return;
        }

        items.forEach((item, id) => {
            const row = document.createElement('div');
            row.className = 'wishlist-item-row';
            row.dataset.id = id;
            row.innerHTML = `
                <div class="wishlist-item-img-wrap">
                    <img src="${item.image}" class="wishlist-item-img" alt="${item.name}">
                </div>
                <div class="wishlist-item-info">
                    <span class="wishlist-item-tag">Handmade \u00B7 Yarny</span>
                    <h4>${item.name}</h4>
                    <p>${item.price} MAD</p>
                    <div class="wishlist-item-btns">
                        <button class="wishlist-add-cart-btn wl-add" data-id="${id}">Add to Bag</button>
                        <button class="wishlist-remove-btn wl-rm" data-id="${id}" title="Remove"><i class="ph ph-trash"></i></button>
                    </div>
                </div>`;
            itemsEl.appendChild(row);
        });
    }

    function toggle(id, productData) {
        const btn = document.querySelector('.btn-wishlist[data-id="' + id + '"]');
        if (items.has(id)) {
            items.delete(id);
            btn && btn.classList.remove('active');
            showToast('Removed from wishlist');
        } else {
            items.set(id, productData);
            btn && btn.classList.add('active');
            btn && btn.classList.add('heart-pop');
            btn && setTimeout(() => btn.classList.remove('heart-pop'), 450);
            if (typeof gsap !== 'undefined' && btn) {
                gsap.fromTo(btn, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
            }
            showToast('Added to wishlist \u2764');
        }
        render();
        save();

        // Sync QV heart
        const qvBtn = document.getElementById('qvAddWishlist');
        if (qvBtn && qvBtn.dataset.id === id) {
            qvBtn.classList.toggle('active', items.has(id));
        }
    }

    function open() { drawer && drawer.classList.add('open'); overlayBg && overlayBg.classList.add('open'); lenis.stop(); }
    function close() { drawer && drawer.classList.remove('open'); overlayBg && overlayBg.classList.remove('open'); lenis.start(); }

    function init() {
        load();
        render();

        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            if (items.has(btn.dataset.id)) btn.classList.add('active');
        });

        document.getElementById('openWishlist') && document.getElementById('openWishlist').addEventListener('click', open);
        document.getElementById('closeWishlist') && document.getElementById('closeWishlist').addEventListener('click', close);
        overlayBg && overlayBg.addEventListener('click', close);

        // BUG FIX: Use stopImmediatePropagation to prevent QV from also firing
        document.addEventListener('click', e => {
            const btn = e.target.closest('.btn-wishlist');
            if (!btn) return;
            e.stopPropagation();
            e.stopImmediatePropagation();
            const card = btn.closest('.pro-card');
            const name = card ? card.dataset.name : btn.dataset.id;
            const price = card ? card.dataset.price : '0';
            const img = card ? (card.dataset.image || card.dataset.img) : '';
            const id = btn.dataset.id || (name && name.replace(/\s+/g, '_').toLowerCase());
            const cleanPrice = String(price).replace(/[^0-9]/g, '');
            toggle(id, { id, name, price: cleanPrice, image: img });
        });

        itemsEl && itemsEl.addEventListener('click', e => {
            const rm = e.target.closest('.wl-rm');
            const add = e.target.closest('.wl-add');
            if (rm) {
                const id = rm.dataset.id;
                const row = rm.closest('.wishlist-item-row');
                if (row) { row.style.opacity = '0'; row.style.transform = 'translateX(10px)'; row.style.transition = '0.3s'; }
                setTimeout(() => {
                    items.delete(id);
                    render(); save();
                    const cardBtn = document.querySelector('.btn-wishlist[data-id="' + id + '"]');
                    cardBtn && cardBtn.classList.remove('active');
                }, 300);
            }
            if (add) {
                const id = add.dataset.id;
                const item = items.get(id);
                if (item) CartManager.add(item.name, item.price + ' MAD', item.image, null);
                close();
                setTimeout(() => CartManager.open(), 350);
            }
        });

        document.getElementById('wishlistToCartAll') && document.getElementById('wishlistToCartAll').addEventListener('click', () => {
            items.forEach(item => CartManager.add(item.name, item.price + ' MAD', item.image, null));
            close();
            setTimeout(() => CartManager.open(), 350);
        });
    }

    return { init, toggle, has, render };
})();

// =============================================
// 16. QUICK VIEW MANAGER — FIXED event handling
// =============================================
const QuickViewManager = (() => {
    const overlay = document.getElementById('qvOverlay');
    const modal = document.getElementById('qvModal');
    const img = document.getElementById('qvImg');
    const nameEl = document.getElementById('qvName');
    const priceEl = document.getElementById('qvPrice');
    const descEl = document.getElementById('qvDesc');
    const addCart = document.getElementById('qvAddCart');
    const addWish = document.getElementById('qvAddWishlist');

    let current = null;

    function open(data) {
        current = data;
        if (img) { img.src = data.img; img.alt = data.name; }
        if (nameEl) nameEl.textContent = data.name;
        if (priceEl) priceEl.textContent = data.price + ' MAD';
        if (descEl) descEl.textContent = data.desc || 'A handmade luxury piece crafted with care in Tanger, Morocco.';
        const wlId = data.id || (data.name && data.name.replace(/\s+/g, '_').toLowerCase());
        if (addWish) {
            addWish.dataset.id = wlId;
            addWish.classList.toggle('active', WishlistManager.has(wlId));
        }
        overlay && overlay.classList.add('open');
        modal && modal.classList.add('open');
        lenis.stop();
    }

    function close() {
        overlay && overlay.classList.remove('open');
        modal && modal.classList.remove('open');
        lenis.start();
        current = null;
    }

    function init() {
        document.getElementById('qvClose') && document.getElementById('qvClose').addEventListener('click', close);
        overlay && overlay.addEventListener('click', close);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

        // BUG FIX: REMOVED the capture-phase stopPropagation that was killing Add to Bag onclick
        // Instead, the QV handler simply checks for these buttons and skips them

        // Quick view — eye button click or card click
        document.addEventListener('click', e => {
            // Skip if clicking Add to Bag, wishlist, or qty buttons
            if (e.target.closest('.btn-liquid-gold') ||
                e.target.closest('.btn-wishlist') ||
                e.target.closest('.qty-btn') ||
                e.target.closest('.cart-remove-btn')) return;

            const eyeBtn = e.target.closest('.btn-quickview');
            const card = e.target.closest('.pro-card');
            const source = eyeBtn || card;
            if (!source) return;

            const el = eyeBtn || card;
            const name = el.dataset.name;
            const price = el.dataset.price;
            // === YARNY PRODUCT SYNC FIX START ===
            // Read the live <img src> from the card so the modal always shows the
            // current image, even if data-img or onclick args are stale/duplicated.
            const _qvCard = el.closest('.pro-card');
            const _qvImg = _qvCard ? _qvCard.querySelector('img') : null;
            const imgSrc = (_qvImg && _qvImg.getAttribute('src')) || el.dataset.image || el.dataset.img;
            // === YARNY PRODUCT SYNC FIX END ===
            const desc = el.dataset.description || el.dataset.desc;
            if (!name) return;

            open({ name, price, img: imgSrc, desc, id: name.replace(/\s+/g, '_').toLowerCase() });
        });

        // Add to cart from QV
        addCart && addCart.addEventListener('click', () => {
            if (!current) return;
            CartManager.add(current.name, current.price + ' MAD', current.img, null);
            close();
            setTimeout(() => CartManager.open(), 350);
        });

        // Wishlist from QV
        addWish && addWish.addEventListener('click', () => {
            if (!current) return;
            const id = current.id || current.name.replace(/\s+/g, '_').toLowerCase();
            WishlistManager.toggle(id, { id, name: current.name, price: current.price, image: current.img });
            addWish.classList.toggle('active', WishlistManager.has(id));
        });
    }

    return { init, open, close };
})();

// =============================================
// 17. CHECKOUT MANAGER — FIXED
// =============================================
const CheckoutManager = (() => {
    const overlay = document.getElementById('checkoutOverlay');
    const drawer = document.getElementById('checkoutDrawer');
    let step = 1;

    function setStep(n) {
        step = n;
        for (let i = 1; i <= 4; i++) {
            const panel = document.getElementById('ckStep' + i);
            if (panel) panel.classList.toggle('active', i === n);
        }
        document.querySelectorAll('.ckstep').forEach(el => {
            const s = +el.dataset.step;
            el.classList.toggle('active', s === n);
            el.classList.toggle('done', s < n);
        });
        document.querySelectorAll('.ckstep-line').forEach((line, i) => {
            line.classList.toggle('done', i < n - 1);
        });
        if (n === 1) renderCartReview();
    }

    function renderCartReview() {
        const el = document.getElementById('ckCartReview');
        if (!el) return;
        const data = CartManager.getData();
        el.innerHTML = data.length === 0
            ? '<p style="color:rgba(255,255,255,0.3);font-size:0.78rem;padding:12px 0">No items in bag.</p>'
            : data.map(item => `
                <div class="ck-cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="ck-cart-item-info">
                        <h5>${item.name}</h5>
                        <span>${item.price}</span>
                    </div>
                    <span class="ck-cart-item-qty">\u00D7${item.qty}</span>
                </div>`).join('');

        const sub = CartManager.getSubtotal();
        const shipping = CartManager.getShippingCost(sub);
        const vat = CartManager.getVAT(sub);

        const ckSub = document.getElementById('ckSubtotal');
        const ckShp = document.getElementById('ckShipping');
        const ckVat = document.getElementById('ckVAT');
        const ckTot = document.getElementById('ckTotal');
        if (ckSub) ckSub.textContent = sub + ' MAD';
        if (ckShp) ckShp.textContent = shipping === 0 ? 'Free' : shipping + ' MAD';
        if (ckVat) ckVat.textContent = vat + ' MAD';
        if (ckTot) ckTot.textContent = (sub + shipping + vat) + ' MAD';
    }

    function validateBilling() {
        const fields = [
            { id: 'ckName', msg: 'Full name is required' },
            { id: 'ckEmail', msg: 'Valid email is required' },
            { id: 'ckPhone', msg: 'Phone number is required' },
            { id: 'ckCity', msg: 'City is required' },
            { id: 'ckAddress', msg: 'Address is required' },
            { id: 'ckCountry', msg: 'Please select a country' },
        ];
        let ok = true;
        fields.forEach(({ id, msg }) => {
            const inp = document.getElementById(id);
            const err = inp && inp.parentElement.querySelector('.ck-error');
            if (!inp || !inp.value.trim()) {
                if (inp) inp.style.borderBottomColor = 'var(--accent)';
                if (err) { err.textContent = msg; err.classList.add('show'); }
                ok = false;
            } else {
                if (inp) inp.style.borderBottomColor = '';
                if (err) err.classList.remove('show');
            }
        });
        return ok;
    }

    function validatePayment() {
        const method = document.querySelector('input[name="payMethod"]:checked');
        if (!method || method.value === 'cod') return true;
        const num = document.getElementById('ckCardNum');
        const exp = document.getElementById('ckExpiry');
        const cvv = document.getElementById('ckCVV');
        let ok = true;
        [[num, 'Card number required'], [exp, 'Expiry required'], [cvv, 'CVV required']].forEach(([el, msg]) => {
            const err = el && el.parentElement.querySelector('.ck-error');
            if (!el || !el.value.trim()) {
                if (el) el.style.borderBottomColor = 'var(--accent)';
                if (err) { err.textContent = msg; err.classList.add('show'); }
                ok = false;
            } else {
                if (el) el.style.borderBottomColor = '';
                if (err) err.classList.remove('show');
            }
        });
        return ok;
    }

    function processOrder() {
        const proc = document.getElementById('ckProcessing');
        if (proc) proc.classList.add('show');
        const email = (document.getElementById('ckEmail') || {}).value || 'your email';
        const orderNum = 'YRN-' + Math.floor(1000 + Math.random() * 9000);

        setTimeout(() => {
            if (proc) proc.classList.remove('show');
            const orderNumEl = document.getElementById('ckOrderNum');
            const confirmEmail = document.getElementById('ckConfirmEmail');
            if (orderNumEl) orderNumEl.textContent = orderNum;
            if (confirmEmail) confirmEmail.textContent = email;
            setStep(4);
            CartManager.clear();
        }, 2800);
    }

    function initCardFormat() {
        const cardNum = document.getElementById('ckCardNum');
        cardNum && cardNum.addEventListener('input', e => {
            let val = e.target.value.replace(/\D/g, '').slice(0, 16);
            e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
        });
        const expiry = document.getElementById('ckExpiry');
        expiry && expiry.addEventListener('input', e => {
            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 2) val = val.slice(0, 2) + ' / ' + val.slice(2);
            e.target.value = val;
        });
    }

    function initPaymentToggle() {
        document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.ck-pay-opt').forEach(opt => {
                    opt.classList.toggle('active', opt.querySelector('input') === radio);
                });
                const cardFields = document.getElementById('ckCardFields');
                const codNote = document.getElementById('ckCODNote');
                if (radio.value === 'cod') {
                    if (cardFields) cardFields.style.display = 'none';
                    if (codNote) codNote.style.display = 'flex';
                } else {
                    if (cardFields) cardFields.style.display = '';
                    if (codNote) codNote.style.display = 'none';
                }
            });
        });
        document.querySelectorAll('.ck-pay-opt').forEach(label => {
            label.addEventListener('click', () => {
                const radio = label.querySelector('input[type="radio"]');
                if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
            });
        });
    }

    function open() {
        if (CartManager.getData().length === 0) { showToast('Your bag is empty!'); return; }
        setStep(1);
        overlay && overlay.classList.add('open');
        drawer && drawer.classList.add('open');
        lenis.stop();
    }

    function close() {
        overlay && overlay.classList.remove('open');
        drawer && drawer.classList.remove('open');
        lenis.start();
    }

    function init() {
        document.getElementById('closeCheckout') && document.getElementById('closeCheckout').addEventListener('click', close);
        overlay && overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

        drawer && drawer.addEventListener('click', e => {
            const next = e.target.closest('.ck-next');
            const back = e.target.closest('.ck-back');
            if (next) {
                const toStep = +next.dataset.next;
                if (toStep === 3 && !validateBilling()) return;
                setStep(toStep);
            }
            if (back) setStep(+back.dataset.back);
        });

        document.getElementById('ckPayNow') && document.getElementById('ckPayNow').addEventListener('click', () => {
            if (!validatePayment()) return;
            processOrder();
        });

        document.getElementById('ckDoneBtn') && document.getElementById('ckDoneBtn').addEventListener('click', () => {
            close();
            setStep(1);
        });

        initCardFormat();
        initPaymentToggle();

        drawer && drawer.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                el.style.borderBottomColor = '';
                const err = el.parentElement && el.parentElement.querySelector('.ck-error');
                if (err) err.classList.remove('show');
            });
        });
    }

    return { init, open, close };
})();

// =============================================
// 18. BOOTSTRAP
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
    CartManager.init();
    WishlistManager.init();
    QuickViewManager.init();
    CheckoutManager.init();
    initCardTilt();
    initMagneticButtons();

    const newTargets = '.btn-wishlist, .btn-quickview, .qty-btn, .wishlist-add-cart-btn, .wishlist-remove-btn, .ck-pay-opt, .ck-back, .ck-next, .qv-close, .qv-heart-btn, .user-dropdown-item';
    document.querySelectorAll(newTargets).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
});

// =============================================
// 9. GSAP ANIMATIONS
// =============================================
gsap.registerPlugin(ScrollTrigger);

function initAnimations() {
    const heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.6')
        .to('.hero-title-main', { opacity: 1, y: 0, duration: 1.3, ease: 'power4.out' }, '-=0.7')
        .to('.hero-stats-row', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.8')
        .to('.btn-hero-lumiere', { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' }, '-=0.7');

    gsap.to('.hero-bg', {
        yPercent: 25, ease: 'none',
        scrollTrigger: { trigger: '.hero-master', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.from('.marquee-strip', {
        opacity: 0,
        scrollTrigger: { trigger: '.marquee-strip', start: 'top 100%' }
    });

    // Collection section animations
    if (document.querySelector('.coll-grid')) {
        // Mirrors moroccan-touch header timeline exactly — only trigger changes
        var showcaseHeaderTl = gsap.timeline({
            scrollTrigger: { trigger: '#showcase', start: 'top 82%', once: true }
        });
        showcaseHeaderTl
            .fromTo('.showcase-eyebrow',
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' })
            .fromTo('.showcase-main-title',
                { y: 50, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
                { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.out' },
                '-=0.4')
            .fromTo('.showcase-subtitle',
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' },
                '-=0.7')
            .fromTo('.showcase-deco',
                { scaleX: 0, transformOrigin: 'center' },
                { scaleX: 1, duration: 0.7, ease: 'power3.out' },
                '-=0.5');

        gsap.from('.showcase-card', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#showcase',
                start: 'top 70%',
                once: true
            }
        });

        document.querySelectorAll('.compact-card').forEach(card => {
            const img = card.querySelector('.compact-img-box img');
            if (!img) return;
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const px = ((e.clientX - r.left) / r.width - 0.5) * 16;
                const py = ((e.clientY - r.top) / r.height - 0.5) * 10;
                gsap.to(img, { x: px, y: py, duration: 0.5, ease: 'power2.out', overwrite: true });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(img, { x: 0, y: 0, duration: 0.9, ease: 'power3.out', overwrite: true });
            });
        });

        const statNums = document.querySelectorAll('.coll-stat-num');
        gsap.fromTo(statNums,
            { y: 30, opacity: 0, scale: 0.88 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.75, stagger: 0.13, ease: 'back.out(1.8)',
                scrollTrigger: {
                    trigger: '.coll-stats-strip', start: 'top 92%',
                    onEnter() {
                        statNums.forEach(el => {
                            const raw = el.textContent.replace(/[^0-9]/g, '');
                            const suffix = el.textContent.replace(/[0-9]/g, '');
                            const target = parseInt(raw);
                            if (!target) return;
                            let cur = 0;
                            const step = target / 55;
                            const t = setInterval(() => {
                                cur = Math.min(cur + step, target);
                                el.textContent = Math.round(cur) + suffix;
                                if (cur >= target) clearInterval(t);
                            }, 18);
                        });
                    }
                }
            }
        );

        gsap.fromTo('.coll-stat-label',
            { y: 12, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.55, stagger: 0.13, delay: 0.25, ease: 'power3.out',
                scrollTrigger: { trigger: '.coll-stats-strip', start: 'top 92%' }
            }
        );

        gsap.fromTo('.coll-stat-sep',
            { scaleY: 0, transformOrigin: 'top' },
            {
                scaleY: 1, duration: 0.7, stagger: 0.15, delay: 0.1, ease: 'power3.out',
                scrollTrigger: { trigger: '.coll-stats-strip', start: 'top 92%' }
            }
        );
    }

    // Product grids
    document.querySelectorAll('.grid-4-strict').forEach(grid => {
        gsap.fromTo(grid.children,
            { y: 50, opacity: 0, filter: 'blur(6px)' },
            {
                y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.1, ease: 'power3.out',
                scrollTrigger: { trigger: grid, start: 'top 82%' }
            }
        );
    });

    // Special order
    const vipTrigger = document.querySelector('.split-vip-3col') || document.querySelector('.split-vip');
    if (vipTrigger) {
        gsap.fromTo('.vip-img-panel',
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power4.inOut',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-panel-img',
            { scale: 1.12 },
            {
                scale: 1.0, duration: 1.8, ease: 'power3.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-panel-title',
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1.1, delay: 0.7, ease: 'power4.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-text-area',
            { x: -40, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 1.1, delay: 0.2, ease: 'power4.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-step',
            { x: -25, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 0.7, stagger: 0.13, delay: 0.6, ease: 'power3.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-form-container',
            { x: 50, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 1.1, delay: 0.35, ease: 'power4.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-input-group',
            { y: 18, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.75, ease: 'power3.out',
                scrollTrigger: { trigger: vipTrigger, start: 'top 82%' }
            }
        );

        gsap.fromTo('.vip-swatch',
            { scale: 0, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 0.5, stagger: 0.03, delay: 0.9, ease: 'back.out(2)',
                scrollTrigger: { trigger: '.vip-color-section', start: 'top 90%' }
            }
        );

        gsap.to('.vip-ghost-text', {
            y: -40, ease: 'none',
            scrollTrigger: { trigger: '.bg-dark-vip', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        });
    }

    // Artisan cards
    document.querySelectorAll('.artisan-card').forEach((card, i) => {
        gsap.fromTo(card,
            { y: 40, opacity: 0, scale: 0.96 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.85, delay: i * 0.1, ease: 'power4.out',
                scrollTrigger: { trigger: '.artisan-grid', start: 'top 85%' }
            }
        );

        const imgWrap = card.querySelector('.artisan-img-wrap');
        if (imgWrap) {
            gsap.fromTo(imgWrap,
                { clipPath: 'inset(0 0 100% 0)' },
                {
                    clipPath: 'inset(0 0 0% 0)', duration: 1.1, delay: i * 0.1, ease: 'power4.inOut',
                    scrollTrigger: { trigger: '.artisan-grid', start: 'top 85%' }
                }
            );
        }

        const photo = card.querySelector('.artisan-photo');
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, { rotateY: px * 7, rotateX: -py * 5, transformPerspective: 600, duration: 0.35, ease: 'power2.out', overwrite: true });
            if (photo) gsap.to(photo, { x: px * 8, y: py * 5, duration: 0.4, ease: 'power2.out', overwrite: true });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: true });
            if (photo) gsap.to(photo, { x: 0, y: 0, duration: 0.8, ease: 'power3.out', overwrite: true });
        });
    });

    // ── Dev Signature — delegated to initDevSignature() ─────────────────────
    initDevSignature();

    gsap.fromTo('.reviews-head',
        { y: 40, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: '#reviews', start: 'top 82%' }
        }
    );

    gsap.fromTo('.contact-left',
        { x: -50, opacity: 0 },
        {
            x: 0, opacity: 1, duration: 1.2, ease: 'power4.out',
            scrollTrigger: { trigger: '#contact', start: 'top 80%' }
        }
    );

    gsap.fromTo('.contact-right',
        { x: 50, opacity: 0 },
        {
            x: 0, opacity: 1, duration: 1.2, delay: 0.15, ease: 'power4.out',
            scrollTrigger: { trigger: '#contact', start: 'top 80%' }
        }
    );

    gsap.fromTo('.contact-info-item',
        { y: 20, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-info-items', start: 'top 85%' }
        }
    );

    gsap.fromTo('.contact-field',
        { y: 18, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-form', start: 'top 85%' }
        }
    );

    gsap.fromTo('.footer-giant-text',
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1.5, ease: 'power4.out',
            scrollTrigger: { trigger: '.footer-giant-text', start: 'top 95%' }
        }
    );

    initCounters();
    initCardTilt();
    initMagneticButtons();

    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
}

// =============================================
// 10. DEV SIGNATURE ANIMATIONS
// =============================================
function initDevSignature() {

    if (typeof gsap === 'undefined') return;

    const section = document.querySelector('#dev-signature');
    if (!section) return;

    // Set initial states
    gsap.set('.dev-name',          { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
    gsap.set('.dev-label',         { opacity: 0, y: 10 });
    gsap.set('.dev-sublabel',      { opacity: 0, y: 10 });
    gsap.set('.dev-tagline-line1', { opacity: 0, x: 25 });
    gsap.set('.dev-tagline-line2', { opacity: 0, x: 25 });
    gsap.set('.dev-giant-word',    { opacity: 0, scale: 1.12 });
    gsap.set('.dev-photo',         { opacity: 0, x: 50 });
    gsap.set('.dev-bio p',         { opacity: 0, y: 18 });
    gsap.set('.dev-stack span',    { opacity: 0, y: 10 });
    gsap.set('.dev-social-link',   { opacity: 0, y: 8 });
    gsap.set('.dev-role',          { opacity: 0 });

    // Main entrance timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#dev-signature',
            start: 'top 75%',
            once: true
        }
    });

    tl.to('.dev-label',         { opacity: 1, y: 0,      duration: 0.6, ease: 'power2.out' })
      .to('.dev-name',          { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.out' }, '-=0.3')
      .to('.dev-sublabel',      { opacity: 1, y: 0,      duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .to('.dev-tagline-line1', { opacity: 1, x: 0,      duration: 0.7, ease: 'power2.out' }, '-=0.6')
      .to('.dev-tagline-line2', { opacity: 1, x: 0,      duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to('.dev-photo',         { opacity: 1, x: 0,      duration: 1.2, ease: 'power3.out' }, '-=0.8')
      .to('.dev-giant-word',    { opacity: 1, scale: 1,  duration: 1.4, ease: 'power2.out' }, '-=1.0')
      .to('.dev-bio p',         { opacity: 1, y: 0,      duration: 0.7, ease: 'power2.out' }, '-=0.6')
      .to('.dev-stack span',    { opacity: 1, y: 0,      duration: 0.5, stagger: 0.07, ease: 'power2.out' }, '-=0.4')
      .to('.dev-social-link',   { opacity: 1, y: 0,      duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
      .to('.dev-role',          { opacity: 1,             duration: 0.6, ease: 'power2.out' }, '-=0.4');

    // Giant word parallax on scroll
    gsap.to('.dev-giant-word', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
            trigger: '#dev-signature',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    // Background subtle parallax
    gsap.to('.dev-bg-image', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
            trigger: '#dev-signature',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
        }
    });

    // Mouse move parallax
    const photoContainer = document.querySelector('.dev-photo-container');
    const giantWord      = document.querySelector('.dev-giant-word');

    if (photoContainer && giantWord) {
        const movePhoto  = gsap.quickTo(photoContainer, 'x', { duration: 0.9, ease: 'power2.out' });
        const movePhotoY = gsap.quickTo(photoContainer, 'y', { duration: 0.9, ease: 'power2.out' });
        const moveWord   = gsap.quickTo(giantWord,      'x', { duration: 1.2, ease: 'power2.out' });

        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const dx   = e.clientX - rect.left - rect.width  / 2;
            const dy   = e.clientY - rect.top  - rect.height / 2;
            movePhoto(dx *  0.012);
            movePhotoY(dy * 0.008);
            moveWord(dx *  -0.008);
        });

        section.addEventListener('mouseleave', () => {
            movePhoto(0);
            movePhotoY(0);
            moveWord(0);
        });
    }
}

// =============================================
// 11. HERO STAT COUNTERS
// =============================================
function initCounters() {
    document.querySelectorAll('.hero-stat-num').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        if (!target) return;
        ScrollTrigger.create({
            trigger: stat, start: 'top 90%', once: true,
            onEnter: () => {
                let current = 0;
                const step = target / 60;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        stat.innerText = stat.getAttribute('data-suffix') ? target + stat.getAttribute('data-suffix') : target + '+';
                        clearInterval(timer);
                    } else {
                        stat.innerText = Math.floor(current) + (stat.getAttribute('data-suffix') || '+');
                    }
                }, 20);
            }
        });
    });
}

// =============================================
// 11. SPECIAL ORDER FORM
// =============================================
const specialForm = document.getElementById('specialOrderForm');
const vipWrapper = document.getElementById('vipFormWrapper');
const vipMsg = document.getElementById('vipSuccessMsg');
const vipBtn = document.getElementById('vipSubmitBtn');

if (specialForm) {
    specialForm.addEventListener('submit', e => {
        e.preventDefault();
        if (vipBtn) {
            vipBtn.innerHTML = '<span>Processing...</span>';
            vipBtn.style.opacity = '0.7';
            vipBtn.style.pointerEvents = 'none';
        }
        setTimeout(() => {
            gsap.to(vipWrapper, {
                opacity: 0, y: -20, duration: 0.5,
                onComplete: () => {
                    vipWrapper.style.display = 'none';
                    vipMsg.classList.add('active');
                    gsap.fromTo('.vip-success-icon', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' });
                    gsap.fromTo('.vip-success-msg h3', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.2 });
                    gsap.fromTo('.vip-success-msg p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.4 });
                }
            });
        }, 1600);
    });
}

// =============================================
// 14. CONTACT FORM
// =============================================
const contactForm = document.getElementById('contactForm');
const contactFormWrapper = document.getElementById('contactFormWrapper');
const contactSuccess = document.getElementById('contactSuccess');

if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-contact-send');
        if (btn) {
            btn.innerHTML = '<span>Sending...</span> <i class="ph ph-circle-notch"></i>';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';
        }
        setTimeout(() => {
            gsap.to(contactFormWrapper, {
                opacity: 0, y: -15, duration: 0.45,
                onComplete: () => {
                    contactFormWrapper.style.display = 'none';
                    contactSuccess.classList.add('active');
                    gsap.fromTo('.contact-success-icon', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)' });
                    gsap.fromTo('.contact-success h4', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2 });
                    gsap.fromTo('.contact-success p', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.35 });
                }
            });
        }, 1400);
    });
}

// =============================================
// 12. SCROLL PROGRESS LINE
// =============================================
const progressLine = document.createElement('div');
progressLine.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--gold));z-index:10001;transition:width 0.1s;width:0%;pointer-events:none;';
document.body.appendChild(progressLine);

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressLine.style.width = (scrollTop / scrollHeight) * 100 + '%';
});

// =============================================
// 13. DATA ATTRIBUTES
// =============================================
document.querySelectorAll('.compact-card').forEach((card, i) => {
    card.setAttribute('data-num', String(i + 1).padStart(2, '0'));
});

// =============================================
// 14. COLOR SWATCH PICKER
// =============================================
(function () {
    const swatches = document.querySelectorAll('.vip-swatch');
    const hiddenInput = document.getElementById('vipColorInput');
    const selectedLabel = document.getElementById('vipColorSelected');
    const selectedColors = new Set();

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.dataset.color;
            if (swatch.classList.contains('active')) {
                swatch.classList.remove('active');
                selectedColors.delete(color);
            } else {
                swatch.classList.add('active');
                selectedColors.add(color);
            }
            const arr = [...selectedColors];
            if (hiddenInput) hiddenInput.value = arr.join(', ');
            if (selectedLabel) {
                selectedLabel.textContent = arr.length ? arr.join(' \u00B7 ') : 'Select colors';
                selectedLabel.style.color = arr.length ? 'rgba(197,160,89,0.9)' : 'rgba(255,255,255,0.35)';
            }
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(swatch,
                    { scale: swatch.classList.contains('active') ? 1.4 : 1.3 },
                    { scale: swatch.classList.contains('active') ? 1.25 : 1.0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }
                );
            }
        });
    });
})();

// =============================================
// MOBILE HAMBURGER MENU
// =============================================
(function () {
    // Create hamburger button
    const burger = document.createElement('button');
    burger.className = 'hamburger-btn';
    burger.id = 'hamburgerBtn';
    burger.setAttribute('aria-label', 'Menu');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // Create mobile menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobileMenu';

    // Get nav links and clone them for mobile
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const links = navLinks.querySelectorAll('a');
    let menuHTML = '<div class="mobile-menu-inner">';
    menuHTML += '<div class="mobile-menu-brand">';
    menuHTML += '<span class="mobile-menu-tag">Navigation</span>';
    menuHTML += '</div>';
    menuHTML += '<nav class="mobile-menu-nav">';
    links.forEach((link, i) => {
        menuHTML += '<a href="' + link.getAttribute('href') + '" class="mobile-menu-link smooth-link" style="animation-delay:' + (0.05 * i) + 's">';
        menuHTML += '<span class="mobile-link-num">0' + (i + 1) + '</span>';
        menuHTML += '<span class="mobile-link-text">' + link.textContent + '</span>';
        menuHTML += '</a>';
    });
    menuHTML += '</nav>';
    menuHTML += '<div class="mobile-menu-footer">';
    menuHTML += '<p>Handmade Luxury from Tanger, Morocco.</p>';
    menuHTML += '</div>';
    menuHTML += '</div>';
    overlay.innerHTML = menuHTML;

    // Insert hamburger before nav-actions
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        navActions.parentNode.insertBefore(burger, navActions);
    }
    document.body.appendChild(overlay);

    // Toggle menu
    function toggleMenu() {
        burger.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    }

    burger.addEventListener('click', toggleMenu);

    // Close on link click
    overlay.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', function () {
            toggleMenu();
            // Smooth scroll
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });
    });

    // Close on overlay background click
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) toggleMenu();
    });
})();

// ═══════════════════════════════════════════════════════
// MOROCCAN TOUCH — GOLDEN ARCH DOORS v7 — ALL ANIMATIONS
// ═══════════════════════════════════════════════════════
(function initMoroccanAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.querySelector('#moroccan-touch')) return;

    // Header timeline
    var headerTl = gsap.timeline({
        scrollTrigger: { trigger: '#moroccan-touch .moroccan-header', start: 'top 82%' }
    });
    headerTl
        .fromTo('.moroccan-eyebrow', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' })
        .fromTo('.moroccan-title', { y: 50, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
            { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.out' }, '-=0.4')
        .fromTo('.moroccan-subtitle', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' }, '-=0.7')
        .fromTo('.moroccan-divider', { scaleX: 0, transformOrigin: 'center' },
            { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5');

    // Hero — cinematic clip-path reveal
    var heroTl = gsap.timeline({
        scrollTrigger: { trigger: '.moroccan-hero-row', start: 'top 78%' }
    });
    heroTl
        .fromTo('.moroccan-hero-img', { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power4.inOut' })
        .fromTo('.moroccan-hero-text', { x: 60, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.1, ease: 'power4.out' }, '-=0.8')
        .fromTo('.moroccan-stat-item', { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power4.out' }, '-=0.5')
        .fromTo('.moroccan-flag-stripe', { scaleX: 0, transformOrigin: 'left' },
            { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3');

    // Map — image entrance
    gsap.fromTo('.morocco-map-img-container',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: '.morocco-map-wrapper', start: 'top 80%' }
        }
    );
    gsap.fromTo('.map-side-info',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: 'power4.out',
          scrollTrigger: { trigger: '.morocco-map-wrapper', start: 'top 80%' }
        }
    );

    // Map floating / breathing animation
    if (document.querySelector('.morocco-map-img')) {
        gsap.to('.morocco-map-img', {
            y: -8,
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    // Product cards — staggered arch reveal
    document.querySelectorAll('.moroccan-card-wrap').forEach(function(card, i) {
        gsap.fromTo(card,
            { y: 70, opacity: 0, scale: 0.93 },
            { y: 0, opacity: 1, scale: 1,
              duration: 1, delay: i * 0.15, ease: 'power4.out',
              scrollTrigger: { trigger: '.moroccan-products-grid', start: 'top 82%' }
            }
        );
    });

    // Stats bar + flag line
    gsap.fromTo('.moroccan-stats-bar',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out',
          scrollTrigger: { trigger: '.moroccan-stats-bar', start: 'top 90%' }
        }
    );
    gsap.fromTo('.moroccan-flag-line',
        { scaleX: 0, transformOrigin: 'center' },
        { scaleX: 1, duration: 1.5, ease: 'power3.out',
          scrollTrigger: { trigger: '.moroccan-flag-line', start: 'top 92%' }
        }
    );

    // Zellige parallax
    if (document.querySelector('.moroccan-zellige-bg')) {
        gsap.to('.moroccan-zellige-bg', {
            yPercent: -10, ease: 'none',
            scrollTrigger: { trigger: '#moroccan-touch', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }
})();

// === YARNY VIDEO SECTION START ===

(function () {
    var videoSection = document.getElementById('yarnyVideoSection');
    var videoBg = document.getElementById('yarnyVideoBg');

    if (!videoSection || !videoBg) return;

    // Fade in on scroll into view
    var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                videoSection.classList.add('yarny-visible');
                fadeObserver.unobserve(videoSection);
            }
        });
    }, { threshold: 0.1 });

    fadeObserver.observe(videoSection);

    // Parallax: video moves at 0.4x scroll speed
    function updateParallax() {
        var rect = videoSection.getBoundingClientRect();
        var sectionTop = rect.top + window.scrollY;
        var scrolled = window.scrollY - sectionTop;
        var offset = scrolled * 0.4;
        videoBg.style.transform = 'translateY(' + offset + 'px)';
    }

    // Scale up video slightly to prevent empty edges during parallax
    videoBg.style.height = '130%';
    videoBg.style.top = '-15%';

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // Start video at 0.03s
    videoBg.addEventListener('loadedmetadata', function () {
        videoBg.currentTime = 0.03;
    });
    if (videoBg.readyState >= 1) {
        videoBg.currentTime = 0.03;
    }
})();

// === YARNY VIDEO SECTION END ===

// === YARNY PRODUCT SYNC FIX START ===
// Inject a bag icon into every .btn-liquid-gold "Add to bag" button if not already present,
// so the button looks premium and consistent with the Moroccan section arch-cart-btn buttons.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-liquid-gold .btn-txt').forEach(span => {
        if (!span.querySelector('i')) {
            const icon = document.createElement('i');
            icon.className = 'ph ph-handbag';
            icon.style.cssText = 'margin-right:7px;font-size:0.95em;vertical-align:-1px;';
            span.prepend(icon);
        }
    });
});
// === YARNY PRODUCT SYNC FIX END ===

// === MEMBERS ANIMATION START ===
(function () {
    // Staggered fade-up entrance for member cards via IntersectionObserver.
    // Uses CSS classes so hover transitions are unaffected after animation ends.
    const cards = document.querySelectorAll('#team .artisan-card');
    if (!cards.length) return;

    // Hide all cards immediately so they don't flash before the observer fires
    cards.forEach(card => card.classList.add('member-entering'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const card = entry.target;
            const idx  = Array.from(cards).indexOf(card);

            // Swap classes: remove the hidden state, start the fade-up animation
            card.classList.remove('member-entering');
            card.style.animationDelay = (idx * 0.15) + 's';
            card.classList.add('member-visible');

            // After the animation ends, clean up so CSS hover transitions
            // take over naturally with no animation fill-mode interference
            card.addEventListener('animationend', () => {
                card.classList.remove('member-visible');
                card.style.animationDelay = '';
            }, { once: true });

            observer.unobserve(card);
        });
    }, { threshold: 0.15 });

    cards.forEach(card => observer.observe(card));
})();
// === MEMBERS ANIMATION END ===

// =============================================
// TEAM SECTION — cinematic staggered animations
// =============================================
function initTeamAnimations() {
  if (typeof gsap === 'undefined') return;

  /* Set initial states */
  gsap.set('.team-card', { opacity: 0, y: 0 });

  /* Header entrance — mirrors showcase header timeline */
  const teamHeaderTl = gsap.timeline({
    scrollTrigger: { trigger: '#team', start: 'top 82%', once: true }
  });

  teamHeaderTl
    .fromTo('#team .showcase-eyebrow',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' })
    .fromTo('.team-main-title',
      { y: 50, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
      { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.out' },
      '-=0.4')
    .fromTo('#team .showcase-subtitle',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' },
      '-=0.7')
    .fromTo('#team .showcase-deco',
      { scaleX: 0, transformOrigin: 'center' },
      { scaleX: 1, duration: 0.7, ease: 'power3.out' },
      '-=0.5');

  /* Cards staggered entrance */
  gsap.to('.team-card', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.team-grid',
      start: 'top 75%',
      once: true
    }
  });

  /* Floating animation on each card */
  document.querySelectorAll('.team-card')
    .forEach((card, i) => {

      gsap.to(card, {
        y: -10,
        duration: 2 + (i * 0.5),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.7
      })

      gsap.to(card, {
        rotation: i % 2 === 0 ? 1.2 : -1.2,
        duration: 3 + (i * 0.4),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.5
      })
    })

  /* Mouse parallax on the grid */
  const grid = document.querySelector('.team-grid');
  if (grid) {
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      document.querySelectorAll('.team-card').forEach((card, i) => {
        const depth = 0.5 + (i * 0.15);
        gsap.to(card, {
          x: dx * 8 * depth,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    });
  }
}

initTeamAnimations();
