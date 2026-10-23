import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render } from '../core/dom.js';
import { getUser } from '../core/session.js';
import { formatDuration, plural, progressBar, statusBadge, animateProgress, errorState } from '../core/ui.js';

initLayout({ active: 'path' });

const user = getUser();

function stageCta(course) {
    if (!user) return 'Log in to start';
    switch (course.status) {
        case 'completed': return 'Review stage';
        case 'in_progress': return 'Continue';
        case 'available': return 'Start stage';
        default: return 'View content';
    }
}

function stageItem(course) {
    return html`
        <li class="stage is-${course.status}">
            <div class="stage-node" aria-hidden="true">${course.icon}</div>
            <a class="card card-interactive stage-card" href="/course.html?slug=${course.slug}">
                <div class="stage-meta">
                    <span class="stage-number">Stage ${course.stage}</span>
                    <span class="badge badge-accent">${course.level}</span>
                    ${user ? statusBadge(course.status) : ''}
                </div>
                <h3 class="stage-title">${course.title}</h3>
                <p class="stage-subtitle">${course.subtitle}</p>
                <p class="stage-desc">${course.description}</p>
                <div class="stage-facts">
                    <span><i class="bi bi-collection" aria-hidden="true"></i>${plural(course.moduleCount, 'module')}</span>
                    <span><i class="bi bi-play-circle" aria-hidden="true"></i>${plural(course.lessonCount, 'lesson')}</span>
                    <span><i class="bi bi-clock" aria-hidden="true"></i>${formatDuration(course.durationMin)}</span>
                    <span><i class="bi bi-calendar-week" aria-hidden="true"></i>~${course.estimatedWeeks} weeks</span>
                </div>
                <div class="stage-footer">
                    ${user ? html`<div class="stage-progress">${progressBar(course.progress.percent, { small: true })}</div>` : ''}
                    <span class="stage-cta">${stageCta(course)} <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
                </div>
            </a>
        </li>`;
}

function renderStats(courses) {
    const lessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
    const minutes = courses.reduce((sum, c) => sum + c.durationMin, 0);
    render('#stats-grid', html`
        <div class="stat"><span class="stat-value">${courses.length}</span><span class="stat-label">Stages</span></div>
        <div class="stat"><span class="stat-value">${lessons}</span><span class="stat-label">Lessons</span></div>
        <div class="stat"><span class="stat-value">${Math.round(minutes / 60)}h+</span><span class="stat-label">Of guided practice</span></div>
        <div class="stat"><span class="stat-value">100%</span><span class="stat-label">Structured</span></div>`);
}

function renderPathStatus(courses) {
    if (!user) {
        render('#path-status', html`
            <div class="alert alert-info"><i class="bi bi-info-circle-fill" aria-hidden="true"></i>
            <span>Browse the full curriculum freely. <a class="text-accent" href="/register.html"><strong>Create a free account</strong></a> to unlock lessons and track your progress.</span></div>`);
        return;
    }
    const total = courses.reduce((s, c) => s + c.progress.total, 0);
    const done = courses.reduce((s, c) => s + c.progress.completed, 0);
    const percent = total ? Math.round((done / total) * 100) : 0;
    render('#path-status', html`<div class="card">${progressBar(percent, { label: `Your journey: ${done} of ${total} lessons` })}</div>`);
}

function renderHeroForUser() {
    if (!user) return;
    render('#hero-actions', html`
        <a href="/dashboard.html" class="btn btn-primary btn-lg"><i class="bi bi-play-fill" aria-hidden="true"></i> Continue learning</a>
        <a href="#learning-path" class="btn btn-ghost-light btn-lg"><i class="bi bi-signpost-split" aria-hidden="true"></i> My path</a>`);
    render('#cta-banner', html`
        <div>
            <h2>Keep the momentum going, ${user.name.split(' ')[0]}!</h2>
            <p>Set a weekly goal — small, consistent practice beats long, rare sessions.</p>
        </div>
        <a href="/goals.html" class="btn btn-primary btn-lg">Set a goal</a>`);
}

async function loadPath() {
    try {
        const { courses } = await api.get('/courses');
        renderStats(courses);
        renderPathStatus(courses);
        render('#roadmap', html`${courses.map(stageItem)}`);
        animateProgress(document.getElementById('learning-path'));
    } catch (err) {
        render('#roadmap', errorState(err.message));
    }
}

renderHeroForUser();
loadPath();
