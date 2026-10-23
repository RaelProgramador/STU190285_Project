import { html } from './dom.js';

/* ---------- Formatters ---------- */
export function formatDuration(minutes) {
    if (!minutes) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function formatRelative(iso) {
    if (!iso) return '—';
    const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(isoDate) {
    if (!isoDate) return '';
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function plural(count, word, pluralWord = `${word}s`) {
    return `${count} ${count === 1 ? word : pluralWord}`;
}

export function initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

/* ---------- Progress ---------- */
export function progressBar(percent, { small = false, label } = {}) {
    const value = Math.max(0, Math.min(100, Math.round(percent || 0)));
    return html`
        ${label ? html`<div class="progress-label"><span>${label}</span><span>${value}%</span></div>` : ''}
        <div class="progress ${small ? 'progress-sm' : ''}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill ${value === 100 ? 'is-complete' : ''}" data-width="${value}"></div>
        </div>`;
}

export function progressRing(percent, { size = 120, stroke = 10, caption = 'complete', onDark = false } = {}) {
    const value = Math.max(0, Math.min(100, Math.round(percent || 0)));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - value / 100);
    return html`
        <div class="progress-ring ${onDark ? 'on-dark' : ''}" role="img" aria-label="${value}% ${caption}">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle class="progress-ring-track" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}"></circle>
                <circle class="progress-ring-value ${value === 100 ? 'is-complete' : ''}" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
                        stroke-width="${stroke}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" data-offset="${offset}"></circle>
            </svg>
            <div class="progress-ring-label">
                <span class="progress-ring-value-text">${value}%</span>
                <span class="progress-ring-caption">${caption}</span>
            </div>
        </div>`;
}

/** Animates bars/rings from 0 after they are in the DOM. */
export function animateProgress(root = document) {
    requestAnimationFrame(() => {
        root.querySelectorAll('.progress-fill[data-width]').forEach((el) => { el.style.width = `${el.dataset.width}%`; });
        root.querySelectorAll('.progress-ring-value[data-offset]').forEach((el) => { el.style.strokeDashoffset = el.dataset.offset; });
    });
}

/* ---------- Lesson & course status ---------- */
const STATUS_META = {
    completed: { icon: 'bi-check-lg', label: 'Completed', badge: 'badge-success' },
    in_progress: { icon: 'bi-play-fill', label: 'In progress', badge: 'badge-accent' },
    available: { icon: 'bi-play-fill', label: 'Available', badge: 'badge-accent' },
    locked: { icon: 'bi-lock-fill', label: 'Locked', badge: '' },
};

export function statusIcon(status) {
    const meta = STATUS_META[status] || STATUS_META.locked;
    const cls = status === 'in_progress' ? 'available' : status;
    return html`<span class="status-icon status-${cls}" title="${meta.label}"><i class="bi ${meta.icon}" aria-hidden="true"></i></span>`;
}

export function statusBadge(status) {
    const meta = STATUS_META[status] || STATUS_META.locked;
    return html`<span class="badge ${meta.badge}"><i class="bi ${meta.icon}" aria-hidden="true"></i> ${meta.label}</span>`;
}

/* ---------- Toasts ---------- */
function toastRegion() {
    let region = document.querySelector('.toast-region');
    if (!region) {
        region = document.createElement('div');
        region.className = 'toast-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        document.body.appendChild(region);
    }
    return region;
}

export function toast(message, type = 'info', timeout = 3500) {
    const icons = { success: 'bi-check-circle-fill', error: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = String(html`<i class="bi ${icons[type] || icons.info}" aria-hidden="true"></i><span>${message}</span>`);
    toastRegion().appendChild(el);
    setTimeout(() => {
        el.classList.add('leaving');
        setTimeout(() => el.remove(), 300);
    }, timeout);
}

/* ---------- Generic states ---------- */
export function emptyState({ icon = '🎸', title, text, action }) {
    return html`
        <div class="empty-state">
            <div class="empty-state-icon" aria-hidden="true">${icon}</div>
            <h3>${title}</h3>
            ${text ? html`<p>${text}</p>` : ''}
            ${action ? html`<a class="btn btn-primary" href="${action.href}">${action.label}</a>` : ''}
        </div>`;
}

export function errorState(message) {
    return html`<div class="alert alert-error"><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i><span>${message}</span></div>`;
}

export function setButtonLoading(button, loading, loadingText = 'Please wait...') {
    if (loading) {
        button.dataset.label = button.innerHTML;
        button.disabled = true;
        button.innerHTML = String(html`<span class="spinner" aria-hidden="true"></span> ${loadingText}`);
    } else {
        button.disabled = false;
        if (button.dataset.label) button.innerHTML = button.dataset.label;
    }
}
