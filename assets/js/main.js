/* ============================================================
   BYEM GYM — main.js
   Global: navbar, auth guard, shared utilities
   ============================================================ */

$(document).ready(function () {

  if (typeof applyI18n === 'function') {
    applyI18n();
  }

  /* ── Navbar: hamburger toggle ────────────────────────────── */
  const $hamburger  = $('.hamburger');
  const $mobileMenu = $('.mobile-menu');

  $hamburger.on('click', function () {
    $(this).toggleClass('open');
    $mobileMenu.toggleClass('open');
  });

  $mobileMenu.find('a').on('click', function () {
    $hamburger.removeClass('open');
    $mobileMenu.removeClass('open');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.hamburger, .mobile-menu').length) {
      $hamburger.removeClass('open');
      $mobileMenu.removeClass('open');
    }
  });

  /* ── Active nav link ─────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop();
  $('.navbar-link').each(function () {
    const href = $(this).attr('href');
    if (href && href.includes(currentPage)) $(this).addClass('active');
  });

  /* ── Scroll: navbar shadow ───────────────────────────────── */
  $(window).on('scroll', function () {
    $('.navbar').css('box-shadow', $(this).scrollTop() > 10 ? '0 4px 24px rgba(0,0,0,0.5)' : 'none');
  });

  /* ── Auth guard ──────────────────────────────────────────── */
  const hasAuth = typeof Auth !== 'undefined';
  const protectedPages = ['dashboard.html', 'profile.html', 'booking.html', 'membership.html', 'exercises.html', 'admin.html'];
  const authPages      = ['login.html', 'register.html'];
  const isProtected    = protectedPages.some(p => currentPage.includes(p));
  const isAuthPage     = authPages.some(p => currentPage.includes(p));

  if (hasAuth && isProtected && !Auth.isLoggedIn()) {
    window.location.href = '../pages/login.html';
    return;
  }

  if (hasAuth && isAuthPage && Auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  /* ── Navbar: logged-in state ─────────────────────────────── */
  if (hasAuth && Auth.isLoggedIn()) {
    const user    = Auth.getUser();
    const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();
    const logoutText = (typeof t === 'function') ? t('Çıkış') : 'Çıkış';

    if (user?.role === 'admin') {
      if ($('.navbar-menu a[href="admin.html"]').length === 0) {
        $('.navbar-menu').append('<li><a href="admin.html" class="navbar-link">Admin</a></li>');
      }
      if ($('.mobile-menu a[href="admin.html"]').length === 0) {
        $('.mobile-menu').append('<a href="admin.html" class="navbar-link">Admin</a>');
      }
    }

    $('#navActions').html(`
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.95rem;">${initial}</div>
        <button class="btn btn-ghost btn-sm" id="logoutBtn">${logoutText}</button>
      </div>
    `);

    $('#logoutBtn').on('click', function () {
      Auth.logout();
    });
  }

});

/* ── Alert helper ─────────────────────────────────────────── */
window.showAlert = function (selector, message, type = 'info') {
  const $alert = $(selector);
  $alert.removeClass('alert-success alert-error alert-info')
    .addClass(`alert-${type}`)
    .text(message)
    .slideDown(200);

  if (type !== 'error') setTimeout(() => $alert.slideUp(300), 4000);
};

/* ── Loading button ───────────────────────────────────────── */
window.setLoading = function ($btn, loading) {
  if (loading) {
    $btn.data('original-text', $btn.html());
    $btn.html('<span class="spinner"></span>').prop('disabled', true);
  } else {
    $btn.html($btn.data('original-text')).prop('disabled', false);
  }
};

/* ── Format date ──────────────────────────────────────────── */
window.formatDate = function (dateStr) {
  if (!dateStr) return '—';
  const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
  return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
};
