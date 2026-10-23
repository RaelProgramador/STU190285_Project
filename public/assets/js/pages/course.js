import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render, getParam } from '../core/dom.js';
import { getUser, loginUrl } from '../core/session.js';
import {
    formatDuration, plural, progressBar, progressRing, statusIcon, statusBadge, animateProgress, errorState, emptyState,
} from '../core/ui.js';

initLayout({ active: 'path' });

const user = getUser();
const TOTAL_STAGES = 6;

function firstOpenLesson(course) {
    const lessons = course.modules.flatMap((m) => m.lessons);
    return lessons.find((l) => l.status === 'available') || null;
}

function heroActions(course, next) {
    if (!user) {
        return html`
            <a class="btn btn-primary btn-lg" href="/register.html"><i class="bi bi-person-plus" aria-hidden="true"></i> Create free account</a>
            <a class="btn btn-ghost-light btn-lg" href="${loginUrl()}">Log in</a>`;
    }
    if (next) {
        const label = course.progress.completed > 0 ? 'Continue' : 'Start stage';
        return html`<a class="btn btn-primary btn-lg" href="/lesson.html?id=${next.id}"><i class="bi bi-play-fill" aria-hidden="true"></i> ${label}: ${next.title}</a>`;
    }
    if (course.status === 'completed') {
        return course.nextCourse
            ? html`<a class="btn btn-primary btn-lg" href="/course.html?slug=${course.nextCourse.slug}">Next stage <i class="bi bi-arrow-right" aria-hidden="true"></i></a>`
            : html`<a class="btn btn-success btn-lg" href="/dashboard.html"><i class="bi bi-trophy" aria-hidden="true"></i> Path complete!</a>`;
    }
    return html`<span class="badge badge-light"><i class="bi bi-lock-fill" aria-hidden="true"></i> Finish the previous stage to unlock</span>`;
}

function renderHero(course, next) {
    document.title = `${course.title} — FireGuitar`;
    render('#course-hero', html`
        <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/index.html#learning-path">Learning path</a></li>
                <li aria-current="page">Stage ${course.stage}</li>
            </ol>
        </nav>
        <div class="course-hero-grid">
            <div>
                <div class="course-hero-icon" aria-hidden="true">${course.icon}</div>
                <div class="course-hero-meta">
                    <span class="badge badge-light">Stage ${course.stage} of ${TOTAL_STAGES}</span>
                    <span class="badge badge-light">${course.level}</span>
                    ${user ? statusBadge(course.status) : ''}
                </div>
                <h1>${course.title}</h1>
                <p class="lead">${course.description}</p>
                <div class="course-hero-facts">
                    <span><i class="bi bi-collection" aria-hidden="true"></i>${plural(course.modules.length, 'module')}</span>
                    <span><i class="bi bi-play-circle" aria-hidden="true"></i>${plural(course.progress.total, 'lesson')}</span>
                    <span><i class="bi bi-clock" aria-hidden="true"></i>${formatDuration(course.durationMin)}</span>
                    <span><i class="bi bi-calendar-week" aria-hidden="true"></i>~${course.estimatedWeeks} weeks</span>
                </div>
                <div class="course-hero-actions">${heroActions(course, next)}</div>
            </div>
            ${user ? html`<div class="course-hero-ring">${progressRing(course.progress.percent, { size: 140, onDark: true })}</div>` : ''}
        </div>`);
}

function lessonRow(lesson, nextId) {
    const locked = lesson.status === 'locked';
    const classes = `lesson-row ${locked ? 'is-locked' : ''} ${lesson.id === nextId ? 'is-next' : ''}`;
    const inner = html`
        ${statusIcon(lesson.status)}
        <div class="lesson-row-body">
            <div class="lesson-row-title">${lesson.position}. ${lesson.title}</div>
            <div class="lesson-row-summary">${lesson.summary}</div>
        </div>
        <div class="lesson-row-meta">
            ${lesson.id === nextId ? html`<span class="badge badge-accent">Up next</span>` : ''}
            ${lesson.hasVideo ? html`<i class="bi bi-youtube" title="Includes video" aria-label="Includes video"></i>` : ''}
            <span class="duration"><i class="bi bi-clock" aria-hidden="true"></i> ${formatDuration(lesson.durationMin)}</span>
        </div>`;

    if (locked) {
        const reason = user ? 'Complete the previous lesson to unlock' : 'Log in to start learning';
        return html`<li><div class="${classes}" title="${reason}" aria-disabled="true">${inner}</div></li>`;
    }
    return html`<li><a class="${classes}" href="/lesson.html?id=${lesson.id}">${inner}</a></li>`;
}

function moduleCard(module, index, nextId) {
    const complete = user && module.progress.percent === 100;
    return html`
        <article class="card module-card ${complete ? 'is-complete' : ''}">
            <header class="module-head">
                <span class="module-number" aria-hidden="true">${complete ? html`<i class="bi bi-check-lg"></i>` : index + 1}</span>
                <div class="module-head-body">
                    <h2 class="module-title">${module.title}</h2>
                    <p class="module-desc">${module.description}</p>
                    ${user ? html`<div class="module-progress">${progressBar(module.progress.percent, {
                        small: true,
                        label: `${module.progress.completed} / ${module.progress.total} lessons`,
                    })}</div>` : ''}
                </div>
            </header>
            <ul class="lesson-list">${module.lessons.map((l) => lessonRow(l, nextId))}</ul>
        </article>`;
}

function renderAside(course) {
    render('#course-aside', html`
        <div class="card">
            <h2 class="aside-title">What you'll be able to do</h2>
            <ul class="outcome-list">
                ${course.outcomes.map((o) => html`<li><i class="bi bi-check-circle-fill" aria-hidden="true"></i><span>${o}</span></li>`)}
            </ul>
        </div>
        <div class="card tip-card">
            <h2 class="aside-title"><i class="bi bi-lightbulb" aria-hidden="true"></i> How this stage works</h2>
            <p>Lessons unlock one at a time. Watch the video, read the explanation, practise the exercises, then mark the lesson complete to open the next one.</p>
        </div>`);
}

function renderNav(course) {
    const { previousCourse: prev, nextCourse: next } = course;
    render('#course-nav', html`
        <nav class="course-nav" aria-label="Stages">
            ${prev ? html`
                <a class="card card-interactive course-nav-link" href="/course.html?slug=${prev.slug}">
                    <span class="course-nav-label"><i class="bi bi-arrow-left" aria-hidden="true"></i> Previous stage</span>
                    <span class="course-nav-title">${prev.title}</span>
                </a>` : ''}
            ${next ? html`
                <a class="card card-interactive course-nav-link next" href="/course.html?slug=${next.slug}">
                    <span class="course-nav-label">Next stage <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
                    <span class="course-nav-title">${next.title}</span>
                </a>` : ''}
        </nav>`);
}

async function loadCourse() {
    const slug = getParam('slug');
    if (!slug) {
        window.location.replace('/index.html#learning-path');
        return;
    }
    try {
        const { course } = await api.get(`/courses/${encodeURIComponent(slug)}`);
        const next = user ? firstOpenLesson(course) : null;
        renderHero(course, next);
        render('#course-modules', html`${course.modules.map((m, i) => moduleCard(m, i, next?.id))}`);
        renderAside(course);
        renderNav(course);
        animateProgress(document);
    } catch (err) {
        render('#course-hero', html`<h1>Stage not found</h1>`);
        render('#course-modules', err.status === 404
            ? emptyState({ title: 'This stage does not exist', text: 'It may have been moved or renamed.', action: { href: '/index.html#learning-path', label: 'Back to the learning path' } })
            : errorState(err.message));
    }
}

loadCourse();
