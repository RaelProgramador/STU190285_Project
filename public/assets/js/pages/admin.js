import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render, qs } from '../core/dom.js';
import { requireAuth } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, bindPasswordToggles, formValues } from '../core/forms.js';
import { formatRelative, initials, progressBar, animateProgress, errorState, toast, setButtonLoading } from '../core/ui.js';

const admin = requireAuth({ role: 'admin' });
initLayout({ active: 'admin' });

let users   = [];
let lessons = [];
let modules = [];

const matches = (query, ...fields) => fields.some((f) => String(f || '').toLowerCase().includes(query));

/* ================================================================
   STATS
   ================================================================ */
function statCard(icon, value, label, sub) {
    return html`
        <div class="card">
            <div class="admin-stat-icon"><i class="bi ${icon}" aria-hidden="true"></i></div>
            <div class="admin-stat-value">${value}</div>
            <div class="admin-stat-label">${label}</div>
            ${sub ? html`<div class="admin-stat-sub">${sub}</div>` : ''}
        </div>`;
}

function renderStats(stats) {
    render('#admin-stats', html`
        ${statCard('bi-people-fill',      stats.users,       'Users',            `${stats.admins} admin${stats.admins === 1 ? '' : 's'}`)}
        ${statCard('bi-journal-richtext', stats.lessons,     'Lessons',          `${stats.lessonsWithVideo} with video`)}
        ${statCard('bi-check2-all',       stats.completions, 'Lessons completed',`${stats.completionsLastWeek} in the last 7 days`)}
        ${statCard('bi-bullseye',         stats.goals,       'Goals created')}`);
}

/* ================================================================
   USERS
   ================================================================ */
function renderUsers() {
    const query = qs('#user-search').value.trim().toLowerCase();
    const rows  = users.filter((u) => matches(query, u.name, u.email));
    if (!rows.length) {
        render('#users-table', html`<p class="text-muted">No users match your search.</p>`);
        return;
    }
    render('#users-table', html`
        <table class="table">
            <thead><tr><th>User</th><th>Progress</th><th>Last activity</th><th>Joined</th><th>Role</th></tr></thead>
            <tbody>
                ${rows.map((u) => html`
                    <tr>
                        <td><div class="user-cell">
                            <span class="avatar" aria-hidden="true">${initials(u.name)}</span>
                            <div><div class="user-cell-name">${u.name}</div><div class="user-cell-email">${u.email}</div></div>
                        </div></td>
                        <td class="progress-cell">${progressBar(u.percent, { small: true, label: `${u.completed} lessons` })}</td>
                        <td>${u.lastActivity ? formatRelative(u.lastActivity) : '—'}</td>
                        <td>${formatRelative(u.createdAt)}</td>
                        <td>
                            <select class="select role-select" data-user-id="${u.id}" aria-label="Role for ${u.name}"
                                    ${u.id === admin.id ? html`disabled title="You cannot change your own role"` : ''}>
                                <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                                <option value="admin"   ${u.role === 'admin'   ? 'selected' : ''}>Admin</option>
                            </select>
                        </td>
                    </tr>`)}
            </tbody>
        </table>`);
    animateProgress(qs('#users-table'));
}

qs('#user-search').addEventListener('input', renderUsers);

qs('#users-table').addEventListener('change', async (event) => {
    const select = event.target.closest('[data-user-id]');
    if (!select) return;
    const id   = Number(select.dataset.userId);
    const user = users.find((u) => u.id === id);
    const prev = user.role;
    select.disabled = true;
    try {
        await api.patch(`/admin/users/${id}/role`, { role: select.value });
        user.role = select.value;
        toast(`${user.name} is now ${select.value === 'admin' ? 'an admin' : 'a student'}.`, 'success');
    } catch (err) {
        select.value = prev;
        toast(err.message, 'error');
    } finally {
        select.disabled = false;
    }
});

/* ================================================================
   LESSONS TABLE
   ================================================================ */
function renderLessons() {
    const query = qs('#lesson-search').value.trim().toLowerCase();
    const rows  = lessons.filter((l) => matches(query, l.title, l.moduleTitle, l.courseTitle));

    if (!rows.length) {
        render('#lessons-table', html`<p class="text-muted">No lessons match your search.</p>`);
        return;
    }

    render('#lessons-table', html`
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Lesson</th>
                    <th>Video</th>
                    <th style="width:100px">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((l) => html`
                    <tr>
                        <td>${l.id}</td>
                        <td>
                            <a class="lesson-cell-title" href="/lesson.html?id=${l.id}">${l.title}</a>
                            <div class="lesson-cell-meta">Stage ${l.stage} · ${l.courseTitle} · ${l.moduleTitle}</div>
                        </td>
                        <td>
                            <form class="video-form" data-lesson-id="${l.id}">
                                ${l.videoId ? html`<a class="video-link" href="https://www.youtube.com/watch?v=${l.videoId}"
                                    target="_blank" rel="noopener noreferrer" aria-label="Open video on YouTube">
                                    <i class="bi bi-youtube"></i></a>` : ''}
                                <input class="input" name="video" value="${l.videoId || ''}"
                                       placeholder="YouTube URL or ID" aria-label="Video for ${l.title}">
                                <button class="btn btn-secondary btn-sm" type="submit">Save</button>
                            </form>
                        </td>
                        <td>
                            <div class="lesson-actions">
                                <button class="btn btn-outline btn-sm" type="button"
                                        data-edit-lesson="${l.id}" aria-label="Edit ${l.title}">
                                    <i class="bi bi-pencil" aria-hidden="true"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" type="button"
                                        data-delete-lesson="${l.id}" data-lesson-title="${l.title}"
                                        aria-label="Delete ${l.title}">
                                    <i class="bi bi-trash" aria-hidden="true"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`)}
            </tbody>
        </table>`);
}

qs('#lesson-search').addEventListener('input', renderLessons);

/* Video save (existing behaviour) */
qs('#lessons-table').addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-lesson-id]');
    if (!form) return;
    event.preventDefault();
    const id  = Number(form.dataset.lessonId);
    const btn = form.querySelector('button');
    setButtonLoading(btn, true, '');
    try {
        const { lesson } = await api.patch(`/admin/lessons/${id}/video`, { video: form.video.value.trim() });
        lessons = lessons.map((l) => (l.id === id ? { ...l, videoId: lesson.videoId } : l));
        renderLessons();
        toast(lesson.videoId ? 'Video saved.' : 'Video removed.', 'success');
    } catch (err) {
        setButtonLoading(btn, false);
        toast(err.message, 'error');
    }
});

/* Edit button click */
qs('#lessons-table').addEventListener('click', (event) => {
    const editBtn   = event.target.closest('[data-edit-lesson]');
    const deleteBtn = event.target.closest('[data-delete-lesson]');
    if (editBtn)   openLessonModal(Number(editBtn.dataset.editLesson));
    if (deleteBtn) openDeleteModal(Number(deleteBtn.dataset.deleteLesson), deleteBtn.dataset.lessonTitle);
});

/* ================================================================
   LESSON MODAL (create / edit)
   ================================================================ */
const lessonModal  = qs('#lesson-modal');
const lessonForm   = qs('#lesson-form');
const modalSubmit  = qs('#modal-submit');
const moduleSelect = qs('#lf-module');

function populateModuleSelect(selectedId = '') {
    moduleSelect.innerHTML = '<option value="">Select a module…</option>' +
        modules.map((m) =>
            `<option value="${m.id}" ${m.id === Number(selectedId) ? 'selected' : ''}>` +
            `${m.courseTitle} — ${m.title}</option>`
        ).join('');
}

function openLessonModal(lessonId = null) {
    clearFieldErrors(lessonForm);
    showFormAlert('#modal-alert', '');
    lessonForm.reset();
    populateModuleSelect();

    if (lessonId) {
        const l = lessons.find((x) => x.id === lessonId);
        if (!l) return;
        qs('#modal-title').textContent       = 'Edit lesson';
        lessonForm.lessonId.value            = l.id;
        populateModuleSelect(l.moduleId);
        lessonForm.title.value               = l.title       || '';
        lessonForm.summary.value             = l.summary     || '';
        lessonForm.content.value             = l.content     || '';
        lessonForm.tabContent.value          = l.tab_content || '';
        lessonForm.durationMin.value         = l.durationMin  || 10;
        lessonForm.videoUrl.value            = l.videoId ? `https://youtu.be/${l.videoId}` : '';
        // Practice is stored as JSON array — convert to newline-separated text
        try {
            const arr = typeof l.practice === 'string' ? JSON.parse(l.practice) : (l.practice || []);
            lessonForm.practice.value = Array.isArray(arr) ? arr.join('\n') : '';
        } catch { lessonForm.practice.value = ''; }
    } else {
        qs('#modal-title').textContent = 'New lesson';
        lessonForm.lessonId.value      = '';
    }

    lessonModal.hidden = false;
    document.body.style.overflow = 'hidden';
    lessonForm.querySelector('[name="title"]').focus();
}

function closeLessonModal() {
    lessonModal.hidden = true;
    document.body.style.overflow = '';
}

qs('#btn-new-lesson').addEventListener('click', () => openLessonModal());
qs('#modal-close').addEventListener('click',   closeLessonModal);
qs('#modal-cancel').addEventListener('click',  closeLessonModal);
lessonModal.addEventListener('click', (e) => { if (e.target === lessonModal) closeLessonModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lessonModal.hidden) closeLessonModal(); });

lessonForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(lessonForm);
    showFormAlert('#modal-alert', '');

    const values   = formValues(lessonForm);
    const errors   = {};
    if (!values.moduleId) errors.moduleId = 'Please select a module.';
    if (!values.title?.trim()) errors.title = 'Title is required.';
    if (Object.keys(errors).length) { showFieldErrors(lessonForm, errors); return; }

    const payload = {
        moduleId:    Number(values.moduleId),
        title:       values.title.trim(),
        summary:     values.summary     || null,
        content:     values.content     || null,
        tabContent:  values.tabContent  || null,
        practice:    values.practice    || '',   // service splits by newline
        durationMin: Number(values.durationMin) || 10,
        videoUrl:    values.videoUrl    || null,
    };

    setButtonLoading(modalSubmit, true, 'Saving…');
    try {
        const isEdit = Boolean(values.lessonId);
        let saved;
        if (isEdit) {
            const { lesson } = await api.put(`/admin/lessons/${values.lessonId}`, payload);
            saved = lesson;
            lessons = lessons.map((l) => (l.id === saved.id ? { ...l, ...toListLesson(saved) } : l));
            toast('Lesson updated.', 'success');
        } else {
            const { lesson } = await api.post('/admin/lessons', payload);
            saved = lesson;
            lessons.push(toListLesson(saved));
            toast('Lesson created.', 'success');
        }
        renderLessons();
        closeLessonModal();

        // Refresh stats
        const { stats } = await api.get('/admin/stats');
        renderStats(stats);
    } catch (err) {
        if (err.details) showFieldErrors(lessonForm, err.details);
        showFormAlert('#modal-alert', err.message);
    } finally {
        setButtonLoading(modalSubmit, false);
    }
});

/** Map a full lesson object returned by the API to the list shape used for rendering. */
function toListLesson(l) {
    const mod    = modules.find((m) => m.id === (l.module_id || l.moduleId));
    const course = mod ? { title: mod.courseTitle, order_index: 1 } : {};
    return {
        id:          l.id,
        title:       l.title,
        summary:     l.summary,
        content:     l.content,
        tab_content: l.tab_content,
        practice:    l.practice,
        durationMin: l.duration_min || l.durationMin,
        videoId:     l.video_id     || l.videoId     || null,
        moduleId:    l.module_id    || l.moduleId,
        moduleTitle: l.moduleTitle  || mod?.title    || '',
        courseTitle: l.courseTitle  || mod?.courseTitle || '',
        stage:       l.stage        || 1,
    };
}

/* ================================================================
   DELETE MODAL
   ================================================================ */
const deleteModal   = qs('#delete-modal');
const deleteConfirm = qs('#delete-confirm');
let pendingDeleteId = null;

function openDeleteModal(lessonId, title) {
    pendingDeleteId = lessonId;
    qs('#delete-modal-msg').textContent =
        `Are you sure you want to delete "${title}"? This will also remove all student progress for it. This cannot be undone.`;
    deleteModal.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    deleteModal.hidden = true;
    pendingDeleteId    = null;
    document.body.style.overflow = '';
}

qs('#delete-modal-close').addEventListener('click', closeDeleteModal);
qs('#delete-cancel').addEventListener('click',      closeDeleteModal);
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

deleteConfirm.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    setButtonLoading(deleteConfirm, true, 'Deleting…');
    try {
        await api.delete(`/admin/lessons/${pendingDeleteId}`);
        lessons = lessons.filter((l) => l.id !== pendingDeleteId);
        renderLessons();
        closeDeleteModal();
        toast('Lesson deleted.', 'success');

        const { stats } = await api.get('/admin/stats');
        renderStats(stats);
    } catch (err) {
        toast(err.message, 'error');
        setButtonLoading(deleteConfirm, false);
    }
});

/* ================================================================
   BOOT
   ================================================================ */
async function loadAdmin() {
    try {
        const [{ stats }, usersRes, lessonsRes, modulesRes] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/users'),
            api.get('/admin/lessons'),
            api.get('/admin/modules'),
        ]);
        users   = usersRes.users;
        lessons = lessonsRes.lessons;
        modules = modulesRes.modules;

        renderStats(stats);
        renderUsers();
        renderLessons();
    } catch (err) {
        render('#admin-stats',  errorState(err.status === 403 ? 'You do not have permission to view this page.' : err.message));
        render('#users-table',  '');
        render('#lessons-table','');
    }
}

if (admin) loadAdmin();
