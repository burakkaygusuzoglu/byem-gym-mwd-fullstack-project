/* ============================================================
   BYEM GYM — main.js
   Global: navbar, auth state check, shared utilities
   ============================================================ */

$(document).ready(function () {

  /* ── Navbar: hamburger toggle ────────────────────────────── */
  const $hamburger   = $('.hamburger');
  const $mobileMenu  = $('.mobile-menu');

  $hamburger.on('click', function () {
    $(this).toggleClass('open');
    $mobileMenu.toggleClass('open');
  });

  // Close mobile menu on link click
  $mobileMenu.find('a').on('click', function () {
    $hamburger.removeClass('open');
    $mobileMenu.removeClass('open');
  });

  // Close on outside click
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
    if (href && href.includes(currentPage)) {
      $(this).addClass('active');
    }
  });

  /* ── Scroll: navbar shadow ───────────────────────────────── */
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 10) {
      $('.navbar').css('box-shadow', '0 4px 24px rgba(0,0,0,0.5)');
    } else {
      $('.navbar').css('box-shadow', 'none');
    }
  });

  /* ── Auth state guard ────────────────────────────────────── */
  // Pages that require login
  const protectedPages = [
    'dashboard.html', 'profile.html',
    'booking.html', 'membership.html',
    'exercises.html', 'admin.html'
  ];

  // Pages that should redirect if already logged in
  const authPages = ['login.html', 'register.html'];

  const isProtected = protectedPages.some(p => currentPage.includes(p));
  const isAuthPage  = authPages.some(p => currentPage.includes(p));

  // We check Supabase session (supabase-config.js must load first)
  if (typeof supabaseClient !== 'undefined') {
    supabaseClient.auth.getSession().then(({ data }) => {
      const session = data?.session;

      if (isProtected && !session) {
        // Not logged in, redirect to login
        window.location.href = '../pages/login.html';
      }

      if (isAuthPage && session) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
      }

      // Update navbar for logged-in state
      if (session) {
        updateNavbarLoggedIn(session.user);
      }
    });
  }

  /* ── Navbar: logged-in state ─────────────────────────────── */
  function updateNavbarLoggedIn(user) {
    const email = user?.email || '';
    const initial = email.charAt(0).toUpperCase();

    // Replace Login/Register buttons with user avatar + logout
    const $actions = $('.navbar-actions');
    $actions.html(`
      <div class="nav-user">
        <div class="nav-avatar" title="${email}">${initial}</div>
        <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
      </div>
    `);

    $('#logoutBtn').on('click', async function () {
      await supabaseClient.auth.signOut();
      window.location.href = '../index.html';
    });
  }

  /* ── Alert helper ────────────────────────────────────────── */
  window.showAlert = function (selector, message, type = 'info') {
    const $alert = $(selector);
    $alert
      .removeClass('alert-success alert-error alert-info')
      .addClass(`alert-${type}`)
      .text(message)
      .slideDown(200);

    if (type !== 'error') {
      setTimeout(() => $alert.slideUp(300), 4000);
    }
  };

  /* ── Loading button state ─────────────────────────────────── */
  window.setLoading = function ($btn, loading, text = '') {
    if (loading) {
      $btn.data('original-text', $btn.html());
      $btn.html('<span class="spinner"></span>').prop('disabled', true);
    } else {
      $btn.html($btn.data('original-text') || text).prop('disabled', false);
    }
  };

  /* ── Format date helper ──────────────────────────────────── */
  window.formatDate = function (dateStr) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

});
