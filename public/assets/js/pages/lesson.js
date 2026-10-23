import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render, qs, getParam } from '../core/dom.js';
import { requireAuth } from '../core/session.js';
import {
    formatDuration, progressBar, statusIcon, statusBadge, animateProgress, errorState, emptyState, toast, setButtonLoading,
} from '../core/ui.js';

const user = requireAuth();
const lessonId = Number.parseInt(getParam('id'), 10);

initLayout({ active: 'path' });

/* ---------- Practice checklist (stored per user + lesson, device only) ---------- */
const practiceKey = () => `fg_practice_${user.id}_${lessonId}`;

function loadChecks() {
    try { return JSON.parse(localStorage.getItem(practiceKey())) || []; } catch { return []; }
}

function saveChecks(checks) {
    localStorage.setItem(practiceKey(), JSON.stringify(checks));
}

/* ---------- Render helpers ---------- */
function paragraphs(text = '') {
    return text.split(/\n{2,}/).map((p) => html`<p>${p}</p>`);
}

function renderTopbar(lesson) {
    document.title = `${lesson.title} — FireGuitar`;
    render('#lesson-topbar', html`
        <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
                <li><a href="/index.html#learning-path">Learning path</a></li>
                <li><a href="/course.html?slug=${lesson.course.slug}">${lesson.course.title}</a></li>
                <li aria-current="page">${lesson.module.title}</li>
            </ol>
        </nav>
        <div class="lesson-topbar-meta">
            <span class="badge badge-light">Lesson ${lesson.position} of ${lesson.totalLessons}</span>
            <span class="badge badge-light"><i class="bi bi-clock" aria-hidden="true"></i> ${formatDuration(lesson.durationMin)}</span>
            ${statusBadge(lesson.status)}
        </div>
        <h1>${lesson.title}</h1>
        <p class="lead">${lesson.summary}</p>`);
}

function videoBlock(lesson) {
    if (!lesson.videoId) {
        return html`
            <div class="video-placeholder">
                <div class="video-placeholder-bg" aria-hidden="true"></div>
                <div class="video-placeholder-content">
                    <div class="video-placeholder-icon" aria-hidden="true">🎸</div>
                    <div class="video-placeholder-text">
                        <strong>Practice &amp; reading lesson</strong>
                        <span>No video for this lesson — work through the steps below at your own pace.</span>
                    </div>
                </div>
                <ul class="video-placeholder-tips">
                    <li><i class="bi bi-music-note-beamed" aria-hidden="true"></i> Read the theory carefully before picking up your guitar</li>
                    <li><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Repeat each exercise slowly until it feels natural</li>
                    <li><i class="bi bi-check2-circle" aria-hidden="true"></i> Tick off all practice items before marking complete</li>
                </ul>
            </div>`;
    }
    return html`
        <div class="video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/${lesson.videoId}?rel=0"
                    title="${lesson.title} — video lesson" loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>`;
}

function step(number, title, body) {
    return html`
        <section class="card step">
            <span class="step-marker" aria-hidden="true">${number}</span>
            <div class="step-body">
                <h2 class="step-title">${title}</h2>
                ${body}
            </div>
        </section>`;
}

function checklist(practice) {
    const checks = loadChecks();
    const done = practice.filter((_, i) => checks[i]).length;
    return html`
        <ul class="checklist" id="practice-list">
            ${practice.map((item, i) => html`
                <li><label class="check-item ${checks[i] ? 'is-checked' : ''}">
                    <input type="checkbox" data-check="${i}" ${checks[i] ? 'checked' : ''}>
                    <span>${item}</span>
                </label></li>`)}
        </ul>
        <p class="checklist-progress" id="practice-progress">${done} of ${practice.length} exercises done</p>`;
}

function completeCard(lesson) {
    if (lesson.status === 'completed') {
        return html`
            <section class="card complete-card is-done" id="complete-section">
                <div>
                    <h2><i class="bi bi-check-circle-fill text-accent" aria-hidden="true"></i> Lesson completed</h2>
                    <p>Nice work! Feel free to revisit this lesson any time.</p>
                </div>
                ${lesson.next ? html`<a class="btn btn-secondary" href="/lesson.html?id=${lesson.next.id}">Next lesson <i class="bi bi-arrow-right" aria-hidden="true"></i></a>` : ''}
            </section>`;
    }
    return html`
        <section class="card complete-card" id="complete-section">
            <div>
                <h2>Finished practising?</h2>
                <p>Mark this lesson as complete to unlock the next one.</p>
            </div>
            <button class="btn btn-primary" type="button" id="complete-btn"><i class="bi bi-check2-circle" aria-hidden="true"></i> Mark as complete</button>
        </section>`;
}

function pager(lesson) {
    const link = (item, dir) => {
        if (!item) return html`<span></span>`;
        const label = dir === 'prev'
            ? html`<i class="bi bi-arrow-left" aria-hidden="true"></i> Previous`
            : html`Next <i class="bi bi-arrow-right" aria-hidden="true"></i>`;
        if (item.status === 'locked') {
            return html`<span class="btn btn-outline" aria-disabled="true" title="Complete this lesson to unlock"><i class="bi bi-lock-fill" aria-hidden="true"></i> ${dir === 'prev' ? 'Previous' : 'Next'}</span>`;
        }
        return html`<a class="btn btn-outline" href="/lesson.html?id=${item.id}" title="${item.title}">${label}</a>`;
    };
    return html`<nav class="lesson-pager" aria-label="Lessons">${link(lesson.previous, 'prev')}${link(lesson.next, 'next')}</nav>`;
}

function renderMain(lesson) {
    const steps = [];
    let n = 1;
    steps.push(step(n++, 'Understand', html`<div class="step-text">${paragraphs(lesson.content)}</div>`));
    if (lesson.tab) {
        steps.push(step(n++, 'Read the TAB', html`
            <pre class="tab-block">${lesson.tab}</pre>
            <p class="tab-help">Each line is a string (thinnest on top). Numbers are frets; 0 means open string.</p>`));
    }
    if (lesson.practice.length) {
        steps.push(step(n++, 'Practise', checklist(lesson.practice)));
    }

    render('#lesson-main', html`
        ${videoBlock(lesson)}
        ${steps}
        ${completeCard(lesson)}
        <div id="lesson-pager">${pager(lesson)}</div>`);
}

function renderAside(lesson) {
    const { course, module } = lesson;
    render('#lesson-aside', html`
        <div class="card">
            <h2 class="aside-title">Stage progress</h2>
            <p class="card-title aside-course-title">${course.title}</p>
            ${progressBar(course.progress.percent, { label: `${course.progress.completed} / ${course.progress.total} lessons` })}
            <a class="link-btn aside-link" href="/course.html?slug=${course.slug}">View all modules <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="card">
            <h2 class="aside-title">${module.title}</h2>
            <ul class="module-lessons">
                ${module.lessons.map((l) => {
                    const current = l.id === lesson.id;
                    const inner = html`
                        ${statusIcon(l.status)}
                        <span class="module-lesson-title">${l.title}</span>
                        <span class="module-lesson-time">${l.durationMin}m</span>`;
                    if (l.status === 'locked') return html`<li><div class="module-lesson is-locked" aria-disabled="true">${inner}</div></li>`;
                    return html`<li><a class="module-lesson ${current ? 'is-current' : ''}" href="/lesson.html?id=${l.id}" ${current ? html`aria-current="page"` : ''}>${inner}</a></li>`;
                })}
            </ul>
        </div>`);
}

function renderCelebration(result, lesson) {
    const { nextLesson, overall, courseCompleted, pathCompleted } = result;
    let icon = '🎉';
    let title = 'Lesson complete!';
    let text = 'Great job — the next lesson is now unlocked.';
    if (pathCompleted) {
        icon = '🏆'; title = 'You finished the whole path!'; text = 'From zero to professional — that is a huge achievement. Keep playing every day.';
    } else if (courseCompleted) {
        icon = '🔥'; title = `Stage complete: ${lesson.course.title}`; text = 'You have unlocked the next stage of your journey.';
    }

    const primary = nextLesson
        ? html`<a class="btn btn-primary" href="/lesson.html?id=${nextLesson.id}"><i class="bi bi-play-fill" aria-hidden="true"></i> Next: ${nextLesson.title}</a>`
        : html`<a class="btn btn-primary" href="/dashboard.html">Go to dashboard</a>`;

    render('#complete-section', html`
        <div class="celebrate">
            <div class="celebrate-icon" aria-hidden="true">${icon}</div>
            <h2>${title}</h2>
            <p>${text}</p>
            <div class="celebrate-progress">${progressBar(overall.percent, { label: `Overall journey · ${overall.completed} / ${overall.total} lessons` })}</div>
            <div class="celebrate-actions">
                ${primary}
                <a class="btn btn-outline" href="/course.html?slug=${lesson.course.slug}">Back to stage</a>
            </div>
        </div>`);
    qs('#complete-section').className = 'card celebrate-card';
    animateProgress(qs('#complete-section'));
}

/* ---------- Events ---------- */
function bindEvents(lesson) {
    const main = qs('#lesson-main');

    main.addEventListener('change', (event) => {
        const box = event.target.closest('[data-check]');
        if (!box) return;
        const checks = loadChecks();
        checks[Number(box.dataset.check)] = box.checked;
        saveChecks(checks);
        box.closest('.check-item').classList.toggle('is-checked', box.checked);
        const done = lesson.practice.filter((_, i) => checks[i]).length;
        qs('#practice-progress').textContent = `${done} of ${lesson.practice.length} exercises done`;
    });

    main.addEventListener('click', async (event) => {
        const btn = event.target.closest('#complete-btn');
        if (!btn) return;
        setButtonLoading(btn, true, 'Saving...');
        try {
            const result = await api.post(`/lessons/${lesson.id}/complete`);
            toast('Lesson marked as complete!', 'success');
            const { lesson: fresh } = await api.get(`/lessons/${lesson.id}`);
            renderTopbar(fresh);
            renderAside(fresh);
            render('#lesson-pager', pager(fresh));
            renderCelebration(result, fresh);
            animateProgress(qs('#lesson-aside'));
        } catch (err) {
            setButtonLoading(btn, false);
            toast(err.message, 'error');
        }
    });
}

/* ---------- Boot ---------- */
function renderLocked(message) {
    render('#lesson-topbar', html`<h1>Lesson locked</h1>`);
    render('#lesson-main', html`
        <div class="card locked-state">
            ${statusIcon('locked')}
            <h2>Not so fast!</h2>
            <p>${message} Every lesson builds on the one before it.</p>
            <a class="btn btn-primary" href="/dashboard.html"><i class="bi bi-play-fill" aria-hidden="true"></i> Go to my next lesson</a>
        </div>`);
    render('#lesson-aside', '');
}

async function loadLesson() {
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
        window.location.replace('/dashboard.html');
        return;
    }
    try {
        const { lesson } = await api.get(`/lessons/${lessonId}`);
        renderTopbar(lesson);
        renderMain(lesson);
        renderAside(lesson);
        bindEvents(lesson);
        animateProgress(document);
    } catch (err) {
        if (err.status === 403) return renderLocked(err.message);
        render('#lesson-topbar', html`<h1>Lesson unavailable</h1>`);
        render('#lesson-aside', '');
        render('#lesson-main', err.status === 404
            ? emptyState({ title: 'Lesson not found', text: 'This lesson does not exist.', action: { href: '/dashboard.html', label: 'Back to dashboard' } })
            : errorState(err.message));
    }
}

if (user) loadLesson();
