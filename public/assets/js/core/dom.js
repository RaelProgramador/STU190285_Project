/* Tiny, dependency-free templating with automatic HTML escaping. */

class SafeHtml {
    constructor(value) { this.value = value; }
    toString() { return this.value; }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function renderValue(value) {
    if (value === null || value === undefined || value === false) return '';
    if (Array.isArray(value)) return value.map(renderValue).join('');
    if (value instanceof SafeHtml) return value.value;
    return escapeHtml(value);
}

/** Tagged template: every interpolated value is escaped unless it is itself `html`. */
export function html(strings, ...values) {
    let out = '';
    strings.forEach((str, i) => {
        out += str;
        if (i < values.length) out += renderValue(values[i]);
    });
    return new SafeHtml(out);
}

export function render(target, content) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.innerHTML = String(content);
    return el;
}

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

export function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}
