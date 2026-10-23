import { getToken, clearSession, loginUrl } from './session.js';

export class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`/api${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, 'Network error. Please check your connection and try again.');
    }

    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // An expired/invalid token: drop the session and send the user to log in again.
        if (response.status === 401 && token) {
            clearSession();
            window.location.replace(loginUrl());
        }
        throw new ApiError(response.status, data.error || 'Something went wrong. Please try again.', data.details);
    }
    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body = {}) => request(path, { method: 'POST', body }),
    patch: (path, body = {}) => request(path, { method: 'PATCH', body }),
    put: (path, body = {}) => request(path, { method: 'PUT', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
