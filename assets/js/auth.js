/* ============================================================
   BYEM GYM — auth.js
   Login & Register logic (Supabase Auth)
   ============================================================ */

$(document).ready(function () {

  /* ── Toggle password visibility ──────────────────────────── */
  $('.toggle-pw').on('click', function () {
    const $input = $(this).siblings('.form-input');
    const $icon  = $(this).find('i');
    const isHidden = $input.attr('type') === 'password';

    $input.attr('type', isHidden ? 'text' : 'password');
    $icon.toggleClass('fa-eye fa-eye-slash');
  });

  /* ── LOGIN ───────────────────────────────────────────────── */
  $('#loginForm').on('submit', async function (e) {
    e.preventDefault();

    const email    = $('#email').val().trim();
    const password = $('#password').val();
    const $btn     = $('#loginBtn');

    if (!email || !password) {
      showAlert('#loginAlert', 'E-posta ve şifre gereklidir.', 'error');
      return;
    }

    setLoading($btn, true);

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      showAlert('#loginAlert', 'Giriş başarısız: ' + error.message, 'error');
      setLoading($btn, false);
      return;
    }

    showAlert('#loginAlert', 'Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  });

  /* ── REGISTER ────────────────────────────────────────────── */
  $('#registerForm').on('submit', async function (e) {
    e.preventDefault();

    const firstName       = $('#firstName').val().trim();
    const lastName        = $('#lastName').val().trim();
    const email           = $('#email').val().trim();
    const password        = $('#password').val();
    const passwordConfirm = $('#passwordConfirm').val();
    const $btn            = $('#registerBtn');

    // Validation
    if (!firstName || !lastName || !email || !password) {
      showAlert('#registerAlert', 'Tüm alanları doldurun.', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert('#registerAlert', 'Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showAlert('#registerAlert', 'Şifreler eşleşmiyor.', 'error');
      return;
    }

    setLoading($btn, true);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          role: 'member'
        }
      }
    });

    if (error) {
      showAlert('#registerAlert', 'Kayıt başarısız: ' + error.message, 'error');
      setLoading($btn, false);
      return;
    }

    // Save initial profile to localStorage as cache
    const profile = {
      id: data.user?.id,
      full_name: `${firstName} ${lastName}`,
      email,
      role: 'member',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('byem_user_profile', JSON.stringify(profile));

    showAlert('#registerAlert', 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  });

});
