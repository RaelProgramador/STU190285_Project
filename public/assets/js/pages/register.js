import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { qs } from '../core/dom.js';
import { isLoggedIn, saveSession } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, bindPasswordToggles, formValues } from '../core/forms.js';
import { setButtonLoading } from '../core/ui.js';

if (isLoggedIn()) window.location.replace('/dashboard.html');

initLayout();

const form = qs('#register-form');
const submitBtn = qs('#submit-btn');

bindPasswordToggles(form);

function validate({ name, email, password, confirm }) {
    const errors = {};
    if (name.trim().length < 2) errors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email address.';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Password must contain letters and numbers.';
    if (password !== confirm) errors.confirm = 'Passwords do not match.';
    return errors;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    showFormAlert('#form-alert', '');

    const values = formValues(form);
    const errors = validate(values);
    if (Object.keys(errors).length) return showFieldErrors(form, errors);

    setButtonLoading(submitBtn, true, 'Creating account...');
    try {
        const session = await api.post('/auth/register', {
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
        });
        saveSession(session);
        showFormAlert('#form-alert', 'Account created! Taking you to your first lesson...', 'success');
        window.location.replace('/dashboard.html');
    } catch (err) {
        setButtonLoading(submitBtn, false);
        if (err.details) showFieldErrors(form, err.details);
        showFormAlert('#form-alert', err.message);
    }
});
