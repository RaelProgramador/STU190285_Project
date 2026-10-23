import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { qs } from '../core/dom.js';
import { requireAuth } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, bindPasswordToggles, formValues } from '../core/forms.js';
import { setButtonLoading, initials, toast } from '../core/ui.js';

requireAuth();
initLayout({ active: 'settings' });

/* ── Profile info ── */
async function loadProfile() {
    try {
        const { user } = await api.get('/auth/me');
        qs('#profile-avatar').textContent = initials(user.name);
        qs('#profile-name').textContent   = user.name;
        qs('#profile-email').textContent  = user.email;
        const badge = qs('#profile-role');
        badge.textContent = user.role === 'admin' ? 'Admin' : 'Student';
        badge.className   = `badge ${user.role === 'admin' ? 'badge-accent' : 'badge-success'}`;
    } catch (err) {
        qs('#profile-name').textContent = 'Could not load profile.';
    }
}

/* ── Change password ── */
const pwForm   = qs('#pw-form');
const pwSubmit = qs('#pw-submit-btn');

bindPasswordToggles(pwForm);

function validate({ currentPassword, newPassword, confirmPassword }) {
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Please enter your current password.';
    if (newPassword.length < 8)                              errors.newPassword = 'New password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) errors.newPassword = 'New password must contain letters and numbers.';
    if (newPassword && confirmPassword !== newPassword)      errors.confirmPassword = 'Passwords do not match.';
    return errors;
}

pwForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(pwForm);
    showFormAlert('#pw-alert', '');

    const values = formValues(pwForm);
    const errors = validate(values);
    if (Object.keys(errors).length) { showFieldErrors(pwForm, errors); return; }

    setButtonLoading(pwSubmit, true, 'Updating…');
    try {
        await api.post('/auth/change-password', {
            currentPassword: values.currentPassword,
            newPassword:     values.newPassword,
        });
        pwForm.reset();
        showFormAlert('#pw-alert', 'Password updated successfully.', 'success');
        toast('Password changed.', 'success');
    } catch (err) {
        if (err.details) showFieldErrors(pwForm, err.details);
        showFormAlert('#pw-alert', err.message);
    } finally {
        setButtonLoading(pwSubmit, false);
    }
});

/* ── Smooth scroll for sidebar links ── */
document.querySelectorAll('.settings-nav-item').forEach((link) => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelectorAll('.settings-nav-item').forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
    });
});

loadProfile();
