import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { qs } from '../core/dom.js';
import { isLoggedIn, saveSession, nextUrl } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, bindPasswordToggles, formValues } from '../core/forms.js';
import { setButtonLoading } from '../core/ui.js';

if (isLoggedIn()) window.location.replace(nextUrl());

initLayout();

const form = qs('#login-form');
const submitBtn = qs('#submit-btn');
const DEMO = {
    student: { email: 'student@fireguitar.com', password: 'Student1234' },
    admin: { email: 'admin@fireguitar.com', password: 'Admin1234' },
};

bindPasswordToggles(form);

document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-demo]');
    if (!btn) return;
    const account = DEMO[btn.dataset.demo];
    form.email.value = account.email;
    form.password.value = account.password;
    form.requestSubmit();
});

function validate({ email, password }) {
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email address.';
    if (!password) errors.password = 'Please enter your password.';
    return errors;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    showFormAlert('#form-alert', '');

    const values = formValues(form);
    const errors = validate(values);
    if (Object.keys(errors).length) return showFieldErrors(form, errors);

    setButtonLoading(submitBtn, true, 'Logging in...');
    try {
        const session = await api.post('/auth/login', { email: values.email, password: values.password });
        saveSession(session);
        showFormAlert('#form-alert', `Welcome back, ${session.user.name.split(' ')[0]}! Redirecting...`, 'success');
        window.location.replace(nextUrl());
    } catch (err) {
        setButtonLoading(submitBtn, false);
        if (err.details) showFieldErrors(form, err.details);
        showFormAlert('#form-alert', err.message);
    }
});
