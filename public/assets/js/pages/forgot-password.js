import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { qs } from '../core/dom.js';
import { isLoggedIn } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, formValues } from '../core/forms.js';
import { setButtonLoading } from '../core/ui.js';

// Already logged-in users don't need to reset their password
if (isLoggedIn()) window.location.replace('/dashboard.html');

initLayout();

const form      = qs('#forgot-form');
const submitBtn = qs('#submit-btn');
const tokenResult = qs('#token-result');
const tokenValue  = qs('#token-value');
const copyBtn     = qs('#copy-btn');
const continueBtn = qs('#continue-btn');

function validate({ email }) {
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())) {
        errors.email = 'Please enter a valid email address.';
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

    setButtonLoading(submitBtn, true, 'Sending...');
    try {
        const data = await api.post('/auth/forgot-password', { email: values.email.trim() });

        if (data.resetToken) {
            // Show the token result section and hide the form
            form.hidden = true;
            tokenValue.textContent = data.resetToken;
            // Pre-fill the token on the reset page via URL param for convenience
            continueBtn.href = `/reset-password.html?token=${encodeURIComponent(data.resetToken)}`;
            tokenResult.hidden = false;
            showFormAlert('#form-alert', 'Token generated — copy it below before it expires.', 'success');
        } else {
            // No token in response (email not found) — still show a neutral message
            showFormAlert('#form-alert', data.message || 'If that email is registered, a reset token has been generated.', 'success');
        }
    } catch (err) {
        setButtonLoading(submitBtn, false);
        if (err.details) showFieldErrors(form, err.details);
        showFormAlert('#form-alert', err.message);
    }
});

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(tokenValue.textContent);
        copyBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copied!';
        setTimeout(() => { copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 2000);
    } catch {
        // Fallback: select the text manually
        const range = document.createRange();
        range.selectNodeContents(tokenValue);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
});
