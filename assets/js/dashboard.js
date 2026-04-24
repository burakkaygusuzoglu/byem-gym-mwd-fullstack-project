/* ============================================================
   BYEM GYM — dashboard.js — Backend API ile
   ============================================================ */

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();

  /* ── Date ─────────────────────────────────────────────────── */
  const now = new Date();
  const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
  $('#dashDate').text(now.toLocaleDateString(locale, { weekday:'long', day:'numeric', month:'long', year:'numeric' }));

  /* ── User info ────────────────────────────────────────────── */
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  $('#userName').text(fullName);
  $('#profileEmail').text(user?.email || '—');
  $('#profileCreated').text(formatDate(user?.created_at));
  $('#profileRole').text(user?.role === 'admin' ? 'Admin' : 'Üye');

  /* ── Membership ───────────────────────────────────────────── */
  try {
    const membership = await MembershipsAPI.getMy();

    $('#planName').text(membership.plan_name);
    $('#startDate').text(formatDate(membership.start_date));
    $('#endDate').text(formatDate(membership.end_date));

    const start    = new Date(membership.start_date);
    const end      = new Date(membership.end_date);
    const pct      = Math.min(100, Math.round(((now - start) / (end - start)) * 100));
    const daysLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));

    $('#progressFill').css('width', pct + '%');
    $('#progressPct').text(pct + '%');
    $('#daysLeft').text(daysLeft);

    if (daysLeft < 7) {
      $('#membershipStatus').removeClass('badge-success').addClass('badge-danger').text('Sona Eriyor');
    }
  } catch {
    $('#planName').text('Üyelik Yok');
    $('#membershipStatus').removeClass('badge-success').addClass('badge-danger').text('Pasif');
    $('#daysLeft').text('0');
  }

  /* ── Bookings ─────────────────────────────────────────────── */
  try {
    const bookings = await BookingsAPI.getMyBookings();
    $('#totalBookings').text(bookings.length || 0);

    if (bookings.length > 0) {
      $('#bookingList').empty();
      bookings.slice(0, 3).forEach(b => {
        const cls = b.classes;
        const dt  = cls?.schedule ? new Date(cls.schedule).toLocaleString(locale, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
        $('#bookingList').append(`
          <div class="booking-item">
            <div class="booking-dot"></div>
            <div class="booking-info">
              <span class="booking-name">${cls?.name || 'Ders'}</span>
              <span class="booking-time">${dt} · ${cls?.instructor || ''}</span>
            </div>
            <span class="badge badge-success">Onaylı</span>
          </div>
        `);
      });
    }
  } catch {
    $('#totalBookings').text('0');
  }

  /* ── Profile from API ─────────────────────────────────────── */
  try {
    const profile = await UsersAPI.getMe();
    const created = new Date(profile.created_at);
    const months  = Math.max(1, Math.round((now - created) / (1000 * 60 * 60 * 24 * 30)));
    $('#memberSince').text(months);
    $('#profileRole').text(profile.role === 'admin' ? 'Admin' : 'Üye');
  } catch {}

});
