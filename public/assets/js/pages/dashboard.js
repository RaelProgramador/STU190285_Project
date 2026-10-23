import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render, qs } from '../core/dom.js';
import { requireAuth } from '../core/session.js';
import {
    formatDuration, formatRelative, plural, progressBar, progressRing, statusIcon, animateProgress, errorState,
} from '../core/ui.js';

const user = requireAuth();
initLayout({ active: 'dashboard' });

function greeting() {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${part}, ${user.name.split(' ')[0]}!`;
}

function renderHero(summary) {
    render('#dash-hero', html`
        <div>
            <span class="eyebrow">My dashboard</span>
            <h1>${greeting()}</h1>
            <p class="lead">${summary.overall.completed === 0
                ? 'Your journey starts today. Take the first lesson — it only takes a few minutes.'
                : `You've completed ${summary.overall.completed} of ${summary.overall.total} lessons. Keep going!`}</p>
        </div>
        ${progressRing(summary.overall.percent, { size: 130, onDark: true, caption: 'of the path' })}`);
}

function statCard(icon, tone, value, label) {
    return html`
        <div class="card stat-card">
            <span class="stat-card-icon ${tone}" aria-hidden="true"><i class="bi ${icon}"></i></span>
            <div>
                <div class="stat-card-value">${value}</div>
                <div class="stat-card-label">${label}</div>
            </div>
        </div>`;
}

function renderStats(summary) {
    render('#stat-cards', html`
        ${statCard('bi-pie-chart-fill', '', `${summary.overall.percent}%`, 'Path complete')}
        ${statCard('bi-check2-circle', 'green', summary.overall.completed, 'Lessons done')}
        ${statCard('bi-clock-history', 'navy', formatDuration(summary.minutesPracticed), 'Time practised')}
        ${statCard('bi-fire', 'amber', plural(summary.streakDays, 'day'), 'Current streak')}`);
}

function renderContinue(summary) {
    const next = summary.nextLesson;
    if (!next) {
        render('#continue-card', html`
            <section class="card continue-card">
                <div class="continue-card-body">
                    <span class="eyebrow">Path complete</span>
                    <h2>🏆 You finished every lesson!</h2>
                    <p>Revisit any stage to polish your skills, or set a new goal to keep your practice consistent.</p>
                    <a class="btn btn-primary" href="/goals.html">Set a new goal</a>
                </div>
            </section>`);
        return;
    }
    render('#continue-card', html`
        <section class="card continue-card">
            <div class="continue-card-body">
                <span class="eyebrow">${summary.overall.completed === 0 ? 'Start here' : 'Continue where you left off'}</span>
                <h2>${next.title}</h2>
                <p>${next.summary}</p>
                <div class="continue-meta">
                    <span class="badge badge-light">${next.courseTitle}</span>
                    <span class="badge badge-light">${next.moduleTitle}</span>
                    <span class="badge badge-light"><i class="bi bi-clock" aria-hidden="true"></i> ${formatDuration(next.durationMin)}</span>
                </div>
                <a class="btn btn-primary" href="/lesson.html?id=${next.id}"><i class="bi bi-play-fill" aria-hidden="true"></i> ${summary.overall.completed === 0 ? 'Start first lesson' : 'Continue lesson'}</a>
            </div>
        </section>`);
}

function renderStages(summary) {
    const activeId = summary.currentCourse?.id;
    render('#stage-list', html`${summary.courses.map((c, i) => {
        const done = c.percent === 100;
        const active = c.id === activeId && !done;
        return html`
            <a class="stage-progress-item ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}" href="/course.html?slug=${c.slug}">
                <span class="stage-progress-num" aria-hidden="true">${done ? html`<i class="bi bi-check-lg"></i>` : i + 1}</span>
                <div class="stage-progress-body">
                    ${progressBar(c.percent, { small: true, label: `${c.title} · ${c.completed}/${c.total}` })}
                </div>
            </a>`;
    })}`);
}

function renderWeekly(summary) {
    const days = summary.weeklyActivity;
    const max = Math.max(1, ...days.map((d) => d.minutes));
    const totalLessons = days.reduce((s, d) => s + d.lessons, 0);
    const todayKey = new Date().toISOString().slice(0, 10);
    qs('#week-total').textContent = plural(totalLessons, 'lesson');
    render('#weekly-chart', html`${days.map((d) => {
        const label = new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
        return html`
            <div class="bar-col ${d.date === todayKey ? 'is-today' : ''}" title="${label}: ${plural(d.lessons, 'lesson')}, ${formatDuration(d.minutes)}">
                <div class="bar-track"><div class="bar-fill" data-height="${Math.round((d.minutes / max) * 100)}"></div></div>
                <span class="bar-day">${label.slice(0, 2)}</span>
            </div>`;
    })}`);
    requestAnimationFrame(() => {
        document.querySelectorAll('.bar-fill[data-height]').forEach((el) => { el.style.height = `${el.dataset.height}%`; });
    });
}

function renderRecent(summary) {
    if (!summary.recent.length) {
        render('#recent-list', html`<p class="small-empty">Nothing yet — your completed lessons will show up here.</p>`);
        return;
    }
    render('#recent-list', html`
        <ul class="recent-list">
            ${summary.recent.map((r) => html`
                <li class="recent-item">
                    ${statusIcon('completed')}
                    <div class="recent-item-body">
                        <a class="recent-item-title" href="/lesson.html?id=${r.id}">${r.title}</a>
                        <div class="recent-item-meta">${r.courseTitle} · ${formatRelative(r.completedAt)}</div>
                    </div>
                </li>`)}
        </ul>`);
}

function renderGoals(goals) {
    const active = goals.filter((g) => g.status !== 'completed').slice(0, 3);
    if (!active.length) {
        render('#goals-preview', html`
            <p class="small-empty">${goals.length ? 'All your goals are completed. 🎉' : 'No goals yet. Set one to stay consistent.'}</p>
            <a class="btn btn-outline btn-sm btn-block" href="/goals.html"><i class="bi bi-plus-lg" aria-hidden="true"></i> New goal</a>`);
        return;
    }
    render('#goals-preview', html`${active.map((g) => html`
        <div class="goal-mini">
            <div class="goal-mini-title"><span>${g.title}</span>${g.status === 'overdue' ? html`<span class="badge badge-danger">Overdue</span>` : ''}</div>
            ${progressBar(g.percent, { small: true })}
            <div class="goal-mini-meta">${g.type === 'custom' ? 'Personal goal' : `${g.current} / ${g.target} ${g.type}`} · ${g.percent}%</div>
        </div>`)}`);
}

async function loadDashboard() {
    qs('#greeting').textContent = greeting();
    try {
        const [summary, { goals }] = await Promise.all([api.get('/progress/summary'), api.get('/goals')]);
        renderHero(summary);
        renderStats(summary);
        renderContinue(summary);
        renderStages(summary);
        renderWeekly(summary);
        renderRecent(summary);
        renderGoals(goals);
        animateProgress(document);
    } catch (err) {
        render('#stat-cards', '');
        render('#continue-card', errorState(err.message));
    }
}

if (user) loadDashboard();
