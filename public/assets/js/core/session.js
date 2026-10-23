const TOKEN_KEY = 'fg_token';
const USER_KEY = 'fg_user';
const LEGACY_KEYS = ['glms_user', 'glms_active_course'];

LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return Boolean(getToken() && getUser());
}

export function isAdmin() {
    return getUser()?.role === 'admin';
}

export function saveSession({ token, user }) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function loginUrl() {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return `/login.html?next=${next}`;
}

/** Safe post-login redirect: only same-origin relative paths are accepted. */
export function nextUrl(fallback = '/dashboard.html') {
    const next = new URLSearchParams(window.location.search).get('next');
    return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/**
 * Client-side route guard for UX only — the API enforces the real permissions.
 * Returns the user or null (after redirecting).
 */
export function requireAuth({ role } = {}) {
    const user = getUser();
    if (!user || !getToken()) {
        window.location.replace(loginUrl());
        return null;
    }
    if (role && user.role !== role) {
        window.location.replace('/dashboard.html');
        return null;
    }
    return user;
}
