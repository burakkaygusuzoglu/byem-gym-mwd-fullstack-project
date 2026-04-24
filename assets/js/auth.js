/* ============================================================
   BYEM GYM — auth.js
   Login & Register — Backend API ile
   ============================================================ */

$(document).ready(function () {

  /* ── Zaten giriş yaptıysa yönlendir ──────────────────────── */
  if (Auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  /* ── Toggle password visibility ──────────────────────────── */
  $('.toggle-pw').on('click', function () {
    const $input = $(this).siblings('.form-input');
    const $icon  = $(this).find('i');
    $input.attr('type', $input.attr('type') === 'password' ? 'text' : 'password');
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

    try {
      const data = await AuthAPI.login(email, password);

      // Token ve kullanıcı bilgisini kaydet
      Auth.setToken(data.token);
      Auth.setUser(data.user);

      showAlert('#loginAlert', 'Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);

    } catch (err) {
      showAlert('#loginAlert', err.message || 'Giriş başarısız.', 'error');
      setLoading($btn, false);
    }
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

    try {
      await AuthAPI.register(firstName, lastName, email, password);
      showAlert('#registerAlert', 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);

    } catch (err) {
      showAlert('#registerAlert', err.message || 'Kayıt başarısız.', 'error');
      setLoading($btn, false);
    }
  });

});
