import { html, render, qs } from './dom.js';
import { getUser, clearSession, saveSession, getToken } from './session.js';
import { getTheme, toggleTheme } from './theme.js';
import { initials } from './ui.js';
import { api } from './api.js';

const NAV_ITEMS = [
    {
        key: 'path', label: 'Courses', short: 'Path', href: '/index.html#learning-path', icon: 'bi-signpost-split',
        children: [
            { label: 'Learning path', href: '/index.html#learning-path', icon: 'bi-signpost-split', sub: 'Your full roadmap from zero to pro' },
            { label: 'Stage 1 — Foundations', href: '/course.html?slug=foundations', icon: 'bi-1-circle', sub: 'Posture, first notes, open chords' },
            { label: 'Stage 2 — First chords', href: '/course.html?slug=first-chords', icon: 'bi-2-circle', sub: 'Em, Am, G, C, D and strumming' },
            { label: 'Stage 3 — Rhythm', href: '/course.html?slug=rhythm', icon: 'bi-3-circle', sub: 'Patterns, timing and folk strums' },
            { label: 'Stage 4 — Scales & theory', href: '/course.html?slug=scales-theory', icon: 'bi-4-circle', sub: 'Pentatonic scale and music basics' },
            { label: 'Stage 5 — Barre chords', href: '/course.html?slug=barre-chords', icon: 'bi-5-circle', sub: 'F major, Bm and new keys' },
            { label: 'Stage 6 — Lead & solos', href: '/course.html?slug=lead-solos', icon: 'bi-6-circle', sub: 'Licks, improvisation and your first solo' },
        ],
    },
    { key: 'dashboard', label: 'Dashboard', short: 'Home', href: '/dashboard.html', icon: 'bi-grid-1x2', auth: true },
    { key: 'goals', label: 'Goals', short: 'Goals', href: '/goals.html', icon: 'bi-bullseye', auth: true },
    { key: 'admin', label: 'Admin', short: 'Admin', href: '/admin.html', icon: 'bi-shield-lock', role: 'admin' },
];

const MOBILE_QUERY = window.matchMedia('(max-width: 900px)');

function visibleItems(user) {
    return NAV_ITEMS.filter((item) => (!item.auth || user) && (!item.role || user?.role === item.role));
}

function themeIcon() {
    return getTheme() === 'dark' ? 'bi-sun' : 'bi-moon-stars';
}

function navLinks(user, active) {
    return visibleItems(user).map((item) => {
        if (item.children) {
            return html`
                <li class="nav-item-dropdown">
                    <a class="nav-link nav-link-has-dropdown ${item.key === active ? 'active' : ''}"
                       href="${item.href}" ${item.key === active ? html`aria-current="page"` : ''}
                       aria-haspopup="true" aria-expanded="false">
                        <i class="bi ${item.icon}" aria-hidden="true"></i>
                        <span>${item.label}</span>
                        <i class="bi bi-chevron-down nav-dropdown-caret" aria-hidden="true"></i>
                    </a>
                    <div class="nav-dropdown-panel" role="menu">
                        ${item.children.map((child) => html`
                            <a class="nav-dropdown-link" href="${child.href}" role="menuitem">
                                <span class="nav-dropdown-link-icon"><i class="bi ${child.icon}" aria-hidden="true"></i></span>
                                <span class="nav-dropdown-link-body">
                                    <span class="nav-dropdown-link-label">${child.label}</span>
                                    <span class="nav-dropdown-link-sub">${child.sub}</span>
                                </span>
                            </a>`)}
                    </div>
                </li>`;
        }
        return html`
            <li><a class="nav-link ${item.key === active ? 'active' : ''}" href="${item.href}"
                   ${item.key === active ? html`aria-current="page"` : ''}>
                <i class="bi ${item.icon}" aria-hidden="true"></i><span>${item.label}</span>
            </a></li>`;
    });
}

function guestMenuLinks() {
    return html`
        <li class="nav-auth-mobile">
            <a class="btn btn-outline btn-block" href="/login.html">Log in</a>
            <a class="btn btn-primary btn-block" href="/register.html">Create free account</a>
        </li>`;
}

function userMenu(user) {
    if (!user) {
        return html`
            <a href="/login.html" class="btn btn-ghost btn-sm nav-login">Log in</a>
            <a href="/register.html" class="btn btn-primary btn-sm">Join free</a>`;
    }
    return html`
        <div class="user-menu" data-user-menu>
            <button class="user-menu-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-user-menu-trigger>
                <span class="avatar" aria-hidden="true">${initials(user.name)}</span>
                <span class="user-first-name">${user.name.split(' ')[0]}</span>
                <i class="bi bi-chevron-down user-menu-caret" aria-hidden="true"></i>
            </button>
            <div class="user-menu-panel" role="menu">
                <div class="user-menu-header">
                    <span class="avatar avatar-lg" aria-hidden="true">${initials(user.name)}</span>
                    <div class="user-menu-identity">
                        <div class="user-menu-name">${user.name}</div>
                        <div class="user-menu-email">${user.email}</div>
                    </div>
                    ${user.role === 'admin' ? html`<span class="badge badge-accent">Admin</span>` : ''}
                </div>
                <a class="user-menu-item" role="menuitem" href="/dashboard.html"><i class="bi bi-grid-1x2"></i> Dashboard</a>
                <a class="user-menu-item" role="menuitem" href="/goals.html"><i class="bi bi-bullseye"></i> My goals</a>
                <a class="user-menu-item" role="menuitem" href="/settings.html"><i class="bi bi-person-gear"></i> Account settings</a>
                ${user.role === 'admin' ? html`<a class="user-menu-item" role="menuitem" href="/admin.html"><i class="bi bi-shield-lock"></i> Admin panel</a>` : ''}
                <button class="user-menu-item" role="menuitem" type="button" data-theme-toggle>
                    <i class="bi ${themeIcon()}" data-theme-icon></i> ${getTheme() === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <div class="user-menu-divider"></div>
                <button class="user-menu-item danger" role="menuitem" type="button" data-logout><i class="bi bi-box-arrow-right"></i> Log out</button>
            </div>
        </div>`;
}

function tabBar(user, active) {
    if (!user) return '';
    return html`
        <nav class="tab-bar" aria-label="Quick navigation">
            ${visibleItems(user).map((item) => html`
                <a class="tab-bar-item ${item.key === active ? 'active' : ''}" href="${item.href}" ${item.key === active ? html`aria-current="page"` : ''}>
                    <i class="bi ${item.icon}" aria-hidden="true"></i>
                    <span>${item.short}</span>
                </a>`)}
        </nav>`;
}

function renderHeader(active) {
    const user = getUser();
    document.body.classList.toggle('has-tab-bar', Boolean(user));
    render('#app-header', html`
        <a class="skip-link" href="#main">Skip to content</a>
        <header class="site-header ${window.scrollY > 4 ? 'is-scrolled' : ''}">
            <div class="container navbar">
                <a class="brand" href="/index.html" aria-label="FireGuitar home">
                    <img class="brand-logo" src="/assets/images/logo.png" alt="FireGuitar" width="154" height="56">
                </a>
                <div class="nav-right">
                    <nav class="nav-menu" id="nav-menu" aria-label="Main">
                        <ul class="nav-links">
                            ${navLinks(user, active)}
                            ${user ? '' : guestMenuLinks()}
                        </ul>
                    </nav>
                    <span class="nav-divider" aria-hidden="true"></span>
                    <div class="nav-actions">
                        <button class="icon-btn" type="button" data-theme-toggle aria-label="Toggle dark mode" title="Toggle dark mode">
                            <i class="bi ${themeIcon()}" data-theme-icon aria-hidden="true"></i>
                        </button>
                        ${userMenu(user)}
                        <button class="icon-btn nav-toggle ${user ? 'nav-toggle-guest-only' : ''}" type="button" data-nav-toggle
                                aria-label="Open menu" aria-controls="nav-menu" aria-expanded="false">
                            <i class="bi bi-list" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        ${tabBar(user, active)}`);
}

function renderFooter() {
    render('#app-footer', html`
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div>
                        <div class="footer-brand">FIRE<span>GUITAR</span></div>
                        <p class="footer-tagline">A structured path from your very first chord to a professional level. Learn step by step, track every win.</p>
                    </div>
                    <div>
                        <div class="footer-title">Learn</div>
                        <ul class="footer-links">
                            <li><a href="/index.html#learning-path">Learning path</a></li>
                            <li><a href="/index.html#how-it-works">How it works</a></li>
                            <li><a href="/course.html?slug=foundations">Start from zero</a></li>
                        </ul>
                    </div>
                    <div>
                        <div class="footer-title">Account</div>
                        <ul class="footer-links">
                            <li><a href="/dashboard.html">Dashboard</a></li>
                            <li><a href="/goals.html">Goals</a></li>
                            <li><a href="/settings.html">Account settings</a></li>
                            <li><a href="/register.html">Create account</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">© ${new Date().getFullYear()} FireGuitar · Online Guitar Lessons</div>
            </div>
        </footer>`);
}

/* ---------- Menus ---------- */
function setMobileMenu(open) {
    const header = qs('.site-header');
    const toggle = qs('[data-nav-toggle]');
    if (!header || !toggle) return;
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('i').className = `bi ${open ? 'bi-x-lg' : 'bi-list'}`;
}

function setUserMenu(open) {
    const menu = qs('[data-user-menu]');
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.querySelector('[data-user-menu-trigger]').setAttribute('aria-expanded', String(open));
}

function refreshThemeControls() {
    document.querySelectorAll('[data-theme-icon]').forEach((icon) => { icon.className = `bi ${themeIcon()}`; });
    const label = qs('.user-menu-item[data-theme-toggle]');
    if (label) label.lastChild.textContent = ` ${getTheme() === 'dark' ? 'Light mode' : 'Dark mode'}`;
}

function bindHeaderEvents() {
    const container = qs('#app-header');
    if (!container) return;

    /* ── Dropdown hover with close-delay ── */
    function initDropdowns() {
        container.querySelectorAll('.nav-item-dropdown').forEach((item) => {
            let closeTimer = null;

            function open() {
                clearTimeout(closeTimer);
                container.querySelectorAll('.nav-item-dropdown').forEach((other) => {
                    if (other !== item) other.classList.remove('dropdown-open');
                });
                item.classList.add('dropdown-open');
                item.querySelector('.nav-link-has-dropdown')?.setAttribute('aria-expanded', 'true');
            }

            function scheduleClose() {
                closeTimer = setTimeout(() => {
                    item.classList.remove('dropdown-open');
                    item.querySelector('.nav-link-has-dropdown')?.setAttribute('aria-expanded', 'false');
                }, 160);
            }

            item.addEventListener('mouseenter', open);
            item.addEventListener('mouseleave', scheduleClose);

            const panel = item.querySelector('.nav-dropdown-panel');
            if (panel) {
                panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
                panel.addEventListener('mouseleave', scheduleClose);
            }
        });
    }
    initDropdowns();

    container.addEventListener('click', (event) => {
        if (event.target.closest('[data-theme-toggle]')) {
            toggleTheme();
            refreshThemeControls();
            return;
        }
        if (event.target.closest('[data-nav-toggle]')) {
            setMobileMenu(!qs('.site-header').classList.contains('menu-open'));
            return;
        }
        if (event.target.closest('[data-user-menu-trigger]')) {
            setUserMenu(!qs('[data-user-menu]').classList.contains('open'));
            setMobileMenu(false);
            return;
        }
        if (event.target.closest('[data-logout]')) {
            clearSession();
            window.location.href = '/index.html';
            return;
        }
        if (event.target.closest('.nav-menu a')) {
            setMobileMenu(false);
            container.querySelectorAll('.nav-item-dropdown').forEach((d) => d.classList.remove('dropdown-open'));
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-user-menu]')) setUserMenu(false);
        if (!event.target.closest('.site-header')) setMobileMenu(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        setUserMenu(false);
        setMobileMenu(false);
        container.querySelectorAll('.nav-item-dropdown').forEach((d) => d.classList.remove('dropdown-open'));
    });

    MOBILE_QUERY.addEventListener('change', () => setMobileMenu(false));

    window.addEventListener('scroll', () => {
        qs('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 4);
    }, { passive: true });
}

/** Keeps the cached user (name/role) in sync with the server without blocking the page. */
async function syncUser(active) {
    if (!getToken()) return;
    try {
        const { user } = await api.get('/auth/me');
        const cached = getUser();
        if (!cached || cached.role !== user.role || cached.name !== user.name) {
            saveSession({ user });
            renderHeader(active);
        }
    } catch { /* api.js already handles expired sessions */ }
}

export function initLayout({ active } = {}) {
    renderHeader(active);
    renderFooter();
    bindHeaderEvents();
    syncUser(active);
}
