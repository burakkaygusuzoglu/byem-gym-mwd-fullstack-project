/* ============================================================
   BYEM GYM — dashboard.js
   ============================================================ */

$(document).ready(async function () {

  /* ── Date ─────────────────────────────────────────────────── */
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#dashDate').text(dateStr);

  /* ── Auth check ───────────────────────────────────────────── */
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  const user = session.user;

  /* ── Navbar logout ────────────────────────────────────────── */
  const initial = (user.user_metadata?.full_name || user.email).charAt(0).toUpperCase();
  $('#navActions').html(`
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.95rem;">${initial}</div>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  `);

  $('#logoutBtn').on('click', async function () {
    await supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });

  /* ── Profile ──────────────────────────────────────────────── */
  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  $('#userName').text(fullName);
  $('#profileEmail').text(user.email);
  $('#profileCreated').text(formatDate(user.created_at));

  /* ── Fetch profile from DB ────────────────────────────────── */
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    const role = profile.role === 'admin' ? 'Admin' : 'Üye';
    $('#profileRole').text(role);
    
    // Member since in months
    const created = new Date(profile.created_at);
    const months = Math.max(1, Math.round((now - created) / (1000 * 60 * 60 * 24 * 30)));
    $('#memberSince').text(months);
  }

  /* ── Fetch membership ─────────────────────────────────────── */
  const { data: membership } = await supabaseClient
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

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
  const { data: bookings } = await supabaseClient
    .from('bookings')
    .select('*, classes(*)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .order('booked_at', { ascending: false })
    .limit(3);

  $('#totalBookings').text(bookings?.length || 0);

  if (bookings && bookings.length > 0) {
    $('#bookingList').empty();
    bookings.forEach(b => {
      const cls = b.classes;
      const scheduleStr = cls?.schedule ? new Date(cls.schedule).toLocaleString('tr-TR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
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
