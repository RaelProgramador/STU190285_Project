import { initLayout } from '../core/layout.js';
import { api } from '../core/api.js';
import { html, render, qs, qsa } from '../core/dom.js';
import { requireAuth } from '../core/session.js';
import { showFieldErrors, clearFieldErrors, showFormAlert, formValues } from '../core/forms.js';
import { formatDate, progressBar, animateProgress, emptyState, errorState, toast, setButtonLoading } from '../core/ui.js';

const user = requireAuth();
initLayout({ active: 'goals' });

const form = qs('#goal-form');
const submitBtn = qs('#submit-btn');

const PERIOD_LABEL = { daily: 'today', weekly: 'this week', monthly: 'this month', all_time: 'in total' };
const TYPE_ICON = { lessons: 'bi-play-circle', minutes: 'bi-clock', custom: 'bi-check2-square' };
const TYPE_HINT = {
    lessons: 'Counts lessons you complete in the chosen period.',
    minutes: 'Counts the minutes of the lessons you complete in the chosen period.',
    custom: 'A personal milestone you tick off yourself (e.g. "Play Wonderwall for a friend").',
};
const TEMPLATES = {
    daily: { title: 'Complete 1 lesson every day', type: 'lessons', target: 1, period: 'daily' },
    weekly: { title: 'Practise 60 minutes this week', type: 'minutes', target: 60, period: 'weekly' },
    stage: { title: 'Finish my current stage', type: 'custom' },
};

let goals = [];
let filter = 'active';

/* ---------- Form ---------- */
function syncTypeFields() {
    const type = form.type.value;
    qs('#measurable-fields').classList.toggle('hidden', type === 'custom');
    qs('#type-hint').textContent = TYPE_HINT[type];
}

function applyTemplate(key) {
    const t = TEMPLATES[key];
    form.title.value = t.title;
    form.querySelector(`input[name="type"][value="${t.type}"]`).checked = true;
    if (t.target) form.target.value = t.target;
    if (t.period) form.period.value = t.period;
    syncTypeFields();
    form.title.focus();
}

function validate(values) {
    const errors = {};
    const title = values.title.trim();
    if (title.length < 3 || title.length > 100) errors.title = 'Title must be between 3 and 100 characters.';
    if (values.type !== 'custom') {
        const target = Number(values.target);
        if (!Number.isInteger(target) || target < 1 || target > 10000) errors.target = 'Enter a whole number between 1 and 10000.';
    }
    return errors;
}

form.addEventListener('change', (event) => {
    if (event.target.name === 'type') syncTypeFields();
});

document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-template]');
    if (chip) applyTemplate(chip.dataset.template);
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    showFormAlert('#form-alert', '');

    const values = formValues(form);
    const errors = validate(values);
    if (Object.keys(errors).length) return showFieldErrors(form, errors);

    const payload = { title: values.title.trim(), type: values.type, dueDate: values.dueDate || null };
    if (values.type !== 'custom') {
        payload.target = Number(values.target);
        payload.period = values.period;
    }

    setButtonLoading(submitBtn, true, 'Saving...');
    try {
        const { goal } = await api.post('/goals', payload);
        goals.unshift(goal);
        form.reset();
        syncTypeFields();
        setFilter('active');
        toast('Goal created. You got this!', 'success');
    } catch (err) {
        if (err.details) showFieldErrors(form, err.details);
        showFormAlert('#form-alert', err.message);
    } finally {
        setButtonLoading(submitBtn, false);
    }
});

/* ---------- List ---------- */
function goalProgressText(goal) {
    if (goal.type === 'custom') return goal.status === 'completed' ? 'Done!' : 'Not done yet';
    const unit = goal.type === 'minutes' ? 'min' : goal.target === 1 ? 'lesson' : 'lessons';
    return `${goal.current} / ${goal.target} ${unit} ${PERIOD_LABEL[goal.period]}`;
}

function statusBadgeFor(goal) {
    if (goal.status === 'completed') return html`<span class="badge badge-success"><i class="bi bi-trophy-fill" aria-hidden="true"></i> Achieved</span>`;
    if (goal.status === 'overdue') return html`<span class="badge badge-danger"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> Overdue</span>`;
    return html`<span class="badge badge-accent">In progress</span>`;
}

function goalCard(goal) {
    const isCustom = goal.type === 'custom';
    return html`
        <article class="card goal-card is-${goal.status}" data-goal-id="${goal.id}">
            <span class="goal-icon" aria-hidden="true"><i class="bi ${goal.status === 'completed' ? 'bi-trophy-fill' : TYPE_ICON[goal.type]}"></i></span>
            <div class="goal-body">
                <div class="goal-head">
                    <div>
                        <h3 class="goal-title">${goal.title}</h3>
                    </div>
                    <div class="goal-actions">
                        ${isCustom ? html`
                            <button type="button" class="icon-btn" data-action="toggle"
                                    aria-label="${goal.status === 'completed' ? 'Mark as not done' : 'Mark as done'}"
                                    title="${goal.status === 'completed' ? 'Mark as not done' : 'Mark as done'}">
                                <i class="bi ${goal.status === 'completed' ? 'bi-arrow-counterclockwise' : 'bi-check-lg'}" aria-hidden="true"></i>
                            </button>` : ''}
                        <button type="button" class="icon-btn danger" data-action="delete" aria-label="Delete goal" title="Delete goal">
                            <i class="bi bi-trash3" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                ${progressBar(goal.percent, { label: goalProgressText(goal) })}
                <div class="goal-meta">
                    ${statusBadgeFor(goal)}
                    ${goal.dueDate ? html`<span><i class="bi bi-calendar-event" aria-hidden="true"></i>Due ${formatDate(goal.dueDate)}</span>` : ''}
                    <span><i class="bi bi-clock-history" aria-hidden="true"></i>Created ${formatDate(goal.createdAt.slice(0, 10))}</span>
                </div>
            </div>
        </article>`;
}

function renderCounts() {
    const counts = {
        active: goals.filter((g) => g.status !== 'completed').length,
        completed: goals.filter((g) => g.status === 'completed').length,
        all: goals.length,
    };
    qsa('[data-count]').forEach((el) => { el.textContent = `(${counts[el.dataset.count]})`; });
}

function renderList() {
    renderCounts();
    const visible = goals.filter((g) => {
        if (filter === 'active') return g.status !== 'completed';
        if (filter === 'completed') return g.status === 'completed';
        return true;
    });

    if (!visible.length) {
        const messages = {
            active: { icon: '🎯', title: 'No active goals', text: 'Create your first goal on the left — try "1 lesson a day" to build a habit.' },
            completed: { icon: '🏆', title: 'No achieved goals yet', text: 'Complete lessons and your goals will fill up automatically.' },
            all: { icon: '🎯', title: 'No goals yet', text: 'Goals help you practise consistently. Create one to get started.' },
        };
        render('#goal-list', emptyState(messages[filter]));
        return;
    }
    render('#goal-list', html`${visible.map(goalCard)}`);
    animateProgress(qs('#goal-list'));
}

function setFilter(value) {
    filter = value;
    qsa('.filter-btn').forEach((btn) => {
        const active = btn.dataset.filter === value;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
    });
    renderList();
}

qs('.goal-filters').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-filter]');
    if (btn) setFilter(btn.dataset.filter);
});

qs('#goal-list').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.closest('[data-goal-id]').dataset.goalId);
    const goal = goals.find((g) => g.id === id);

    if (btn.dataset.action === 'delete') {
        if (!window.confirm(`Delete the goal "${goal.title}"?`)) return;
        btn.disabled = true;
        try {
            await api.delete(`/goals/${id}`);
            goals = goals.filter((g) => g.id !== id);
            renderList();
            toast('Goal deleted.', 'info');
        } catch (err) {
            btn.disabled = false;
            toast(err.message, 'error');
        }
        return;
    }

    if (btn.dataset.action === 'toggle') {
        btn.disabled = true;
        try {
            const { goal: updated } = await api.patch(`/goals/${id}`, { completed: goal.status !== 'completed' });
            goals = goals.map((g) => (g.id === id ? updated : g));
            renderList();
            if (updated.status === 'completed') toast('Goal achieved! 🎉', 'success');
        } catch (err) {
            btn.disabled = false;
            toast(err.message, 'error');
        }
    }
});

async function loadGoals() {
    try {
        ({ goals } = await api.get('/goals'));
        renderList();
    } catch (err) {
        render('#goal-list', errorState(err.message));
    }
}

if (user) {
    syncTypeFields();
    loadGoals();
}
