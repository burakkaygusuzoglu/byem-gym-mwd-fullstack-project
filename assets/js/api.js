/* ============================================================
   BYEM GYM — api.js
   Backend API ile iletişim katmanı
   Tüm fetch/AJAX çağrıları buradan yapılır
   ============================================================ */

const API_BASE = 'http://localhost:3000/api';

/* ── Token yönetimi ───────────────────────────────────────── */
const Auth = {
  getToken:    ()        => localStorage.getItem('byem_token'),
  setToken:    (token)   => localStorage.setItem('byem_token', token),
  removeToken: ()        => localStorage.removeItem('byem_token'),
  getUser:     ()        => JSON.parse(localStorage.getItem('byem_user') || 'null'),
  setUser:     (user)    => localStorage.setItem('byem_user', JSON.stringify(user)),
  removeUser:  ()        => localStorage.removeItem('byem_user'),
  isLoggedIn:  ()        => !!localStorage.getItem('byem_token'),
  logout:      ()        => {
    localStorage.removeItem('byem_token');
    localStorage.removeItem('byem_user');
    localStorage.removeItem('byem_membership');
    window.location.href = '../pages/login.html';
  }
};

/* ── Base fetch ───────────────────────────────────────────── */
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu.');
    }

    return data;
  } catch (err) {
    throw err;
  }
}

/* ── Auth API ─────────────────────────────────────────────── */
const AuthAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (first_name, last_name, email, password) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ first_name, last_name, email, password })
    }),

  me: () => apiFetch('/auth/me')
};

/* ── Classes API ──────────────────────────────────────────── */
const ClassesAPI = {
  getAll: () => apiFetch('/classes'),

  getOne: (id) => apiFetch(`/classes/${id}`),

  create: (data) => apiFetch('/classes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiFetch(`/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiFetch(`/classes/${id}`, { method: 'DELETE' })
};

/* ── Bookings API ─────────────────────────────────────────── */
const BookingsAPI = {
  getMyBookings: () => apiFetch('/bookings'),

  create: (class_id) => apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify({ class_id })
  }),

  cancel: (id) => apiFetch(`/bookings/${id}`, { method: 'DELETE' })
};

/* ── Memberships API ──────────────────────────────────────── */
const MembershipsAPI = {
  getMy: () => apiFetch('/memberships/me'),

  create: (plan_name, billing) => apiFetch('/memberships', {
    method: 'POST',
    body: JSON.stringify({ plan_name, billing })
  }),

  cancel: () => apiFetch('/memberships/me', { method: 'DELETE' })
};

/* ── Users API ────────────────────────────────────────────── */
const UsersAPI = {
  getAll: () => apiFetch('/users'),

  getMe: () => apiFetch('/users/me'),

  updateMe: (full_name) => apiFetch('/users/me', {
    method: 'PUT',
    body: JSON.stringify({ full_name })
  }),

  changeRole: (id, role) => apiFetch(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  })
};
