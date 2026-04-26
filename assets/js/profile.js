/* ============================================================
   BYEM GYM — profile.js — Backend API ile
   ============================================================ */

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();

  /* ── Load profile ─────────────────────────────────────────── */
  await loadProfile(user);
  refreshLanguageToggle();

  $('#languageToggleBtn').on('click', function () {
    const nextLang = (typeof getLang === 'function' && getLang() === 'en') ? 'tr' : 'en';
    if (typeof setLang === 'function') {
      setLang(nextLang);
    }
  });

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
    try {
      const fullName = `${firstName} ${lastName}`;
      await UsersAPI.updateMe(fullName);

      // Update local storage
      const updatedUser = { ...Auth.getUser(), full_name: fullName };
      Auth.setUser(updatedUser);

      showAlert('#profileAlert', '✅ Profil güncellendi!', 'success');
      $('#sidebarName').text(fullName);
      $('#avatarInitial').text(firstName.charAt(0).toUpperCase());
    } catch (err) {
      showAlert('#profileAlert', err.message, 'error');
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
    try {
      await AuthAPI.changePassword(newPass);
      showAlert('#profileAlert', '✅ Şifre başarıyla güncellendi!', 'success');
      $('#newPassword, #confirmPassword').val('');
    } catch (err) {
      showAlert('#profileAlert', err.message || 'Şifre güncellenemedi.', 'error');
    }
    setLoading($btn, false);
  });

  /* ── Sign out all ─────────────────────────────────────────── */
  $('#signOutAllBtn').on('click', function () { Auth.logout(); });

});

function refreshLanguageToggle() {
  if (typeof getLang !== 'function') return;

  const lang = getLang();
  if (lang === 'en') {
    $('#languageCurrentLabel').text('Current language: English');
    $('#languageToggleBtn').text('Switch to Turkish');
  } else {
    $('#languageCurrentLabel').text('Mevcut dil: Türkçe');
    $('#languageToggleBtn').text('Switch to English');
  }
}

async function loadProfile(user) {
  const fullName  = user?.full_name || user?.email?.split('@')[0] || '';
  const firstName = fullName.split(' ')[0] || '';
  const lastName  = fullName.split(' ').slice(1).join(' ') || '';

  $('#avatarInitial').text(fullName.charAt(0).toUpperCase());
  $('#sidebarName').text(fullName);
  $('#sidebarEmail').text(user?.email || '—');
  $('#firstName').val(firstName);
  $('#lastName').val(lastName);
  $('#emailInput').val(user?.email || '—');

  try {
    const profile = await UsersAPI.getMe();
    $('#sidebarRole').text(profile.role === 'admin' ? 'Admin' : t('Üye'));

    const created = new Date(profile.created_at);
    const now     = new Date();
    const months  = Math.max(1, Math.round((now - created) / (1000 * 60 * 60 * 24 * 30)));
    $('#statMonths').text(months);
    $('#profileCreated').text(formatDate(profile.created_at));
  } catch {}

  try {
    const m = await MembershipsAPI.getMy();
    const end      = new Date(m.end_date);
    const daysLeft = Math.max(0, Math.round((end - new Date()) / (1000 * 60 * 60 * 24)));
    $('#mPlan').text(m.plan_name);
    $('#mStatus').html('<span class="badge badge-success">Aktif</span>');
    $('#mStart').text(formatDate(m.start_date));
    $('#mEnd').text(formatDate(m.end_date));
    $('#mDaysLeft').text(daysLeft + (getLang() === 'en' ? ' days' : ' gün'));
    $('#statDaysLeft').text(daysLeft);
  } catch {
    $('#mStatus').html('<span class="badge badge-danger">Pasif</span>');
  }

  try {
    const bookings = await BookingsAPI.getMyBookings();
    $('#statBookings').text(bookings?.length || 0);
  } catch {}
}
