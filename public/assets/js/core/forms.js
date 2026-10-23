import { html, render, qsa } from './dom.js';

/** Maps API/client validation errors ({ field: message }) onto inputs named after those fields. */
export function showFieldErrors(form, errors = {}) {
    Object.entries(errors).forEach(([field, message]) => {
        const input = form.querySelector(`[name="${field}"]`);
        const slot = form.querySelector(`[data-error-for="${field}"]`);
        input?.classList.add('has-error');
        input?.setAttribute('aria-invalid', 'true');
        if (slot) slot.textContent = message;
    });
    const first = Object.keys(errors)[0];
    if (first) form.querySelector(`[name="${first}"]`)?.focus();
}

export function clearFieldErrors(form) {
    qsa('.has-error', form).forEach((el) => { el.classList.remove('has-error'); el.removeAttribute('aria-invalid'); });
    qsa('[data-error-for]', form).forEach((el) => { el.textContent = ''; });
}

export function showFormAlert(target, message, type = 'error') {
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    render(target, message ? html`<div class="alert alert-${type}" role="alert"><i class="bi ${icon}" aria-hidden="true"></i><span>${message}</span></div>` : '');
}

export function bindPasswordToggles(root = document) {
    root.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-toggle-password]');
        if (!btn) return;
        const input = document.getElementById(btn.dataset.togglePassword);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.querySelector('i').className = `bi ${show ? 'bi-eye-slash' : 'bi-eye'}`;
    });
}

export function formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
}
