import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { qs, getParam } from '../core/dom.js';
import { isLoggedIn } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, bindPasswordToggles, formValues } from '../core/forms.js';
import { setButtonLoading } from '../core/ui.js';

// Already logged-in users don't need to reset their password
if (isLoggedIn()) window.location.replace('/dashboard.html');

initLayout();

const form      = qs('#reset-form');
const submitBtn = qs('#submit-btn');
const tokenInput = qs('#token');

bindPasswordToggles(form);

// Pre-fill token from URL param if coming from forgot-password page
const prefilledToken = getParam('token');
if (prefilledToken) tokenInput.value = prefilledToken;

function validate({ token, password, confirm }) {
    const errors = {};
    if (!token || !token.trim()) {
        errors.token = 'Please paste your reset token.';
    }
    if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        errors.password = 'Password must be at least 8 characters and contain letters and numbers.';
    }
    if (password !== confirm) {
        errors.confirm = 'Passwords do not match.';
    }
    return errors;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    showFormAlert('#form-alert', '');

    const values = formValues(form);
    const errors = validate(values);
    if (Object.keys(errors).length) return showFieldErrors(form, errors);

    setButtonLoading(submitBtn, true, 'Resetting...');
    try {
        const data = await api.post('/auth/reset-password', {
            token: values.token.trim(),
            newPassword: values.password,
        });

        // Hide the form and show success with redirect
        form.hidden = true;
        showFormAlert('#form-alert', data.message || 'Password reset successfully!', 'success');

        const notice = document.createElement('p');
        notice.className = 'auth-switch';
        notice.innerHTML = 'Taking you to log in&hellip;';
        form.insertAdjacentElement('afterend', notice);

        setTimeout(() => window.location.replace('/login.html'), 2000);
    } catch (err) {
        setButtonLoading(submitBtn, false);
        if (err.details) showFieldErrors(form, err.details);
        showFormAlert('#form-alert', err.message);
    }
});
