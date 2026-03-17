/**
 * app.js – InternTrack Shared Utilities
 * Provides API helpers, auth guards, and UI utilities used across all pages.
 */

// ── CONFIGURATION ──────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:5000';

// ── API HELPERS ────────────────────────────────────────────

/** GET request – returns parsed JSON */
async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

/** POST request with JSON body – returns parsed JSON */
async function apiPost(endpoint, body = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

// ── AUTH HELPERS ───────────────────────────────────────────

/** Redirect to login if user is not in sessionStorage or wrong role */
function requireAuth(requiredRole) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) { redirectToLogin(requiredRole); return; }
  const user = JSON.parse(userStr);
  if (user.role !== requiredRole) redirectToLogin(requiredRole);
}

function redirectToLogin(role) {
  window.location.href = role === 'faculty' ? 'teacher_login.html' : 'student_login.html';
}

/** Log out: clear session, call API, go home */
async function logout() {
  try { await apiPost('/api/logout'); } catch (_) {}
  sessionStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ── UI HELPERS ─────────────────────────────────────────────

/** Show an error message inside a Bootstrap alert element */
function showError(el, message) {
  if (!el) return;
  el.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${message}`;
  el.classList.remove('d-none');
}

/** Show a success message inside a Bootstrap alert element */
function showSuccess(el, message) {
  if (!el) return;
  el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
  el.classList.remove('d-none');
}

/**
 * Show a Bootstrap Toast notification.
 * @param {string} message
 * @param {'success'|'danger'|'warning'|'info'} type
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'bi-check-circle-fill',
    danger:  'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info:    'bi-info-circle-fill'
  };
  const icon = icons[type] || icons.info;

  const id   = `toast-${Date.now()}`;
  const html = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0 shadow" role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  container.insertAdjacentHTML('beforeend', html);
  const toastEl = document.getElementById(id);
  const toast   = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ── DATE / STRING UTILITIES ────────────────────────────────

/**
 * Format an ISO date string to a human-readable format.
 * e.g. "2024-06-01" → "Jun 1, 2024"
 */
function formatDate(dateStr) {
  if (!dateStr) return '–';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (_) { return dateStr; }
}

/** Capitalise first letter */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate string with ellipsis */
function truncate(str, maxLen = 100) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

// ── INIT ───────────────────────────────────────────────────
// Ensure toast container exists on every page
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toastContainer')) {
    const div = document.createElement('div');
    div.id = 'toastContainer';
    div.className = 'position-fixed bottom-0 end-0 p-3';
    div.style.zIndex = '1100';
    document.body.appendChild(div);
  }
});
