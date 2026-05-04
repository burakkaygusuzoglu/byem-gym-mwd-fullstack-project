/* ============================================================
   BYEM GYM — dashboard.js
   ============================================================ */

$(document).ready(async function () {

  const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';

  /* ── Date ─────────────────────────────────────────────────── */
  const now = new Date();
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#dashDate').text(dateStr);

  /* ── Auth check ───────────────────────────────────────────── */
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();
  if (!user) { Auth.logout(); return; }

  /* ── Profile ──────────────────────────────────────────────── */
  const fullName = user.full_name || user.email.split('@')[0];
  $('#userName').text(fullName);
  $('#profileEmail').text(user.email);
  $('#profileCreated').text('—');

  /* ── Fetch profile from DB ────────────────────────────────── */
  try {
    const profile = await UsersAPI.getMe();
    const role = profile.role === 'admin' ? 'Admin' : 'Üye';
    $('#profileRole').text(role);
    $('#profileCreated').text(formatDate(profile.created_at));

    if (profile.role === 'admin' && $('.quick-links a[href="admin.html"]').length === 0) {
      $('.quick-links').append(`
        <a href="admin.html" class="quick-link">
          <i class="fa-solid fa-shield-halved"></i> Admin Paneli
        </a>
      `);
    }
    
    // Member since in months
    const created = new Date(profile.created_at);
    const months = Math.max(1, Math.round((now - created) / (1000 * 60 * 60 * 24 * 30)));
    $('#memberSince').text(months);
  } catch {}

  /* ── Fetch membership ─────────────────────────────────────── */
  let membership = null;
  try {
    membership = await MembershipsAPI.getMy();
  } catch {}

  if (membership) {
    $('#planName').text(membership.plan_name);
    $('#startDate').text(formatDate(membership.start_date));
    $('#endDate').text(formatDate(membership.end_date));

    const start    = new Date(membership.start_date);
    const end      = new Date(membership.end_date);
    const total    = end - start;
    const elapsed  = now - start;
    const pct      = Math.min(100, Math.round((elapsed / total) * 100));
    const daysLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));

    $('#progressFill').css('width', pct + '%');
    $('#progressPct').text(pct + '%');
    $('#daysLeft').text(daysLeft);

    if (daysLeft < 7) {
      $('#membershipStatus').removeClass('badge-success').addClass('badge-danger').text('Sona Eriyor');
    }
  } else {
    $('#planName').text('Üyelik Yok');
    $('#membershipStatus').removeClass('badge-success').addClass('badge-danger').text('Pasif');
    $('#daysLeft').text('0');
  }

  /* ── Fetch bookings ───────────────────────────────────────── */
  let bookings = [];
  try {
    const allBookings = await BookingsAPI.getMyBookings();
    bookings = (allBookings || []).slice(0, 3);
  } catch {}

  $('#totalBookings').text(bookings?.length || 0);

  if (bookings && bookings.length > 0) {
    $('#bookingList').empty();
    bookings.forEach(b => {
      const cls = b.classes;
      const scheduleStr = cls?.schedule ? new Date(cls.schedule).toLocaleString(locale, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
      $('#bookingList').append(`
        <div class="booking-item">
          <div class="booking-dot"></div>
          <div class="booking-info">
            <span class="booking-name">${cls?.name || 'Ders'}</span>
            <span class="booking-time">${scheduleStr} · ${cls?.instructor || ''}</span>
          </div>
          <span class="badge badge-success">Onaylı</span>
        </div>
      `);
    });
  }

});
