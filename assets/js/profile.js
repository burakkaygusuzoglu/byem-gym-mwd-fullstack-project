/* ============================================================
   BYEM GYM — profile.js
   ============================================================ */

let currentUser = null;

$(document).ready(async function () {

  /* ── Auth ─────────────────────────────────────────────────── */
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  currentUser = session.user;

  /* ── Navbar ───────────────────────────────────────────────── */
  const initial = (currentUser.user_metadata?.full_name || currentUser.email).charAt(0).toUpperCase();
  $('#navActions').html(`
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">${initial}</div>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  `);
  $('#logoutBtn').on('click', async () => { await supabaseClient.auth.signOut(); window.location.href = '../index.html'; });

  /* ── Load profile ─────────────────────────────────────────── */
  await loadProfile();

  /* ── Tab navigation ───────────────────────────────────────── */
  $('.profile-nav-item').on('click', function () {
    const tab = $(this).data('tab');
    $('.profile-nav-item').removeClass('active');
    $(this).addClass('active');
    $('.profile-section[id^="tab-"]').addClass('hidden');
    $(`#tab-${tab}`).removeClass('hidden');
  });

  /* ── Save info ────────────────────────────────────────────── */
  $('#saveInfoBtn').on('click', async function () {
    const $btn      = $(this);
    const firstName = $('#firstName').val().trim();
    const lastName  = $('#lastName').val().trim();

    if (!firstName || !lastName) {
      showAlert('#profileAlert', 'Ad ve soyad boş bırakılamaz.', 'error');
      return;
    }

    setLoading($btn, true);

    const fullName = `${firstName} ${lastName}`;

    // Update Supabase auth metadata
    await supabaseClient.auth.updateUser({ data: { full_name: fullName, first_name: firstName, last_name: lastName } });

    // Update profiles table
    const { error } = await supabaseClient
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', currentUser.id);

    if (error) {
      showAlert('#profileAlert', 'Güncelleme başarısız: ' + error.message, 'error');
    } else {
      showAlert('#profileAlert', '✅ Profil güncellendi!', 'success');
      $('#sidebarName').text(fullName);
      $('#avatarInitial').text(firstName.charAt(0).toUpperCase());
      localStorage.setItem('byem_user_profile', JSON.stringify({ full_name: fullName }));
    }

    setLoading($btn, false);
  });

  /* ── Change password ──────────────────────────────────────── */
  $('#changePasswordBtn').on('click', async function () {
    const $btn    = $(this);
    const newPass = $('#newPassword').val();
    const confirm = $('#confirmPassword').val();

    if (!newPass || newPass.length < 6) {
      showAlert('#profileAlert', 'Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (newPass !== confirm) {
      showAlert('#profileAlert', 'Şifreler eşleşmiyor.', 'error');
      return;
    }

    setLoading($btn, true);

    const { error } = await supabaseClient.auth.updateUser({ password: newPass });

    if (error) {
      showAlert('#profileAlert', 'Şifre güncellenemedi: ' + error.message, 'error');
    } else {
      showAlert('#profileAlert', '✅ Şifre başarıyla güncellendi!', 'success');
      $('#newPassword, #confirmPassword').val('');
    }

    setLoading($btn, false);
  });

  /* ── Sign out all ─────────────────────────────────────────── */
  $('#signOutAllBtn').on('click', async function () {
    await supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });

});

/* ── Load profile data ────────────────────────────────────── */
async function loadProfile () {
  const user = currentUser;
  const fullName  = user.user_metadata?.full_name || user.email.split('@')[0];
  const firstName = user.user_metadata?.first_name || fullName.split(' ')[0] || '';
  const lastName  = user.user_metadata?.last_name  || fullName.split(' ')[1] || '';

  // Sidebar
  $('#avatarInitial').text(fullName.charAt(0).toUpperCase());
  $('#sidebarName').text(fullName);
  $('#sidebarEmail').text(user.email);

  // Form
  $('#firstName').val(firstName);
  $('#lastName').val(lastName);
  $('#emailInput').val(user.email);

  // Fetch profile from DB
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    const role = profile.role === 'admin' ? 'Admin' : 'Üye';
    $('#sidebarRole').text(role);

    const created = new Date(profile.created_at);
    const now     = new Date();
    const months  = Math.max(1, Math.round((now - created) / (1000 * 60 * 60 * 24 * 30)));
    $('#statMonths').text(months);
  }

  // Fetch membership
  const { data: membership } = await supabaseClient
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (membership) {
    const end      = new Date(membership.end_date);
    const now      = new Date();
    const daysLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));

    $('#mPlan').text(membership.plan_name);
    $('#mStatus').html('<span class="badge badge-success">Aktif</span>');
    $('#mStart').text(formatDate(membership.start_date));
    $('#mEnd').text(formatDate(membership.end_date));
    $('#mDaysLeft').text(daysLeft + ' gün');
    $('#statDaysLeft').text(daysLeft);
  } else {
    $('#mPlan').text('—');
    $('#mStatus').html('<span class="badge badge-danger">Pasif</span>');
    $('#mStart, #mEnd, #mDaysLeft').text('—');
  }

  // Fetch booking count
  const { data: bookings } = await supabaseClient
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'confirmed');

  $('#statBookings').text(bookings?.length || 0);
}
