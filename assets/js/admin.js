/* ============================================================
   BYEM GYM — admin.js — Backend API ile
   ============================================================ */

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();
  if (user?.role !== 'admin') {
    $('main').html(`
      <div style="text-align:center; padding:5rem 1rem;">
        <i class="fa-solid fa-ban" style="font-size:3rem; color:var(--danger); display:block; margin-bottom:1rem;"></i>
        <h2>Erişim Reddedildi</h2>
        <p>Bu sayfaya sadece admin rolündeki kullanıcılar erişebilir.</p>
        <a href="dashboard.html" class="btn btn-primary mt-3">Dashboard'a Dön</a>
      </div>
    `);
    return;
  }

  await loadStats();
  await loadClasses();
  await loadUsers();
  await loadMemberships();
  await loadBookings();

  /* ── Tabs ─────────────────────────────────────────────────── */
  $('.admin-tab').on('click', function () {
    const tab = $(this).data('tab');
    $('.admin-tab').removeClass('active');
    $(this).addClass('active');
    $('[id^="tab-"]').addClass('hidden');
    $(`#tab-${tab}`).removeClass('hidden');
  });

  /* ── Add class ────────────────────────────────────────────── */
  $('#addClassBtn').on('click', async function () {
    const $btn = $(this);
    const name       = $('#className').val().trim();
    const instructor = $('#classInstructor').val().trim();
    const capacity   = parseInt($('#classCapacity').val());
    const schedule   = $('#classSchedule').val();

    if (!name || !instructor || !capacity || !schedule) {
      showAlert('#adminAlert', 'Tüm alanları doldurun.', 'error');
      return;
    }

    setLoading($btn, true);
    try {
      await ClassesAPI.create({ name, instructor, capacity, schedule: new Date(schedule).toISOString() });
      showAlert('#adminAlert', '✅ Ders eklendi!', 'success');
      $('#className, #classInstructor, #classCapacity, #classSchedule').val('');
      await loadClasses();
      await loadStats();
    } catch (err) {
      showAlert('#adminAlert', err.message, 'error');
    }
    setLoading($btn, false);
  });

});

async function loadStats() {
  try {
    const [users, classes] = await Promise.all([UsersAPI.getAll(), ClassesAPI.getAll()]);
    $('#statUsers').text(users.length || 0);
    $('#statClasses').text(classes.length || 0);
  } catch {}
}

async function loadClasses() {
  try {
    const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
    const data = await ClassesAPI.getAll();
    $('#classesTableBody').empty();

    if (!data.length) {
      $('#classesTableBody').html('<tr><td colspan="6" style="text-align:center;color:var(--muted);">Henüz ders eklenmedi.</td></tr>');
      return;
    }

    data.forEach(c => {
      const dt = new Date(c.schedule).toLocaleString(locale, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
      $('#classesTableBody').append(`
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.instructor}</td>
          <td>${dt}</td>
          <td>${c.capacity}</td>
          <td>—</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteClass(${c.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
      `);
    });
  } catch {}
}

async function loadUsers() {
  try {
    const data = await UsersAPI.getAll();
    $('#usersTableBody, #statUsers').empty && $('#usersTableBody').empty();
    $('#statUsers').text(data.length);

    data.forEach(u => {
      const roleLabel = u.role === 'admin' ? '<span class="badge badge-danger">Admin</span>' : '<span class="badge badge-primary">Üye</span>';
      $('#usersTableBody').append(`
        <tr>
          <td><strong>${u.full_name || '—'}</strong></td>
          <td>${u.email || '—'}</td>
          <td>${roleLabel}</td>
          <td>${formatDate(u.created_at)}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="changeRole('${u.id}','${u.role}')">${u.role === 'admin' ? 'Üye Yap' : 'Admin Yap'}</button></td>
        </tr>
      `);
    });
  } catch {}
}

async function loadMemberships() {
  try {
    const { data } = await fetch('http://localhost:3000/api/memberships/all', {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    // Supabase'den direkt çek
    $('#membershipsTableBody').html('<tr><td colspan="5" style="text-align:center;color:var(--muted);">Üyelikler yükleniyor...</td></tr>');
  } catch {}
}

async function loadBookings() {
  $('#bookingsTableBody').html('<tr><td colspan="5" style="text-align:center;color:var(--muted);">Rezervasyonlar backend üzerinden yükleniyor...</td></tr>');
}

window.deleteClass = async function (id) {
  if (!confirm('Bu dersi silmek istediğinden emin misin?')) return;
  try {
    await ClassesAPI.delete(id);
    showAlert('#adminAlert', 'Ders silindi.', 'info');
    await loadClasses();
    await loadStats();
  } catch (err) { alert(err.message); }
};

window.changeRole = async function (id, currentRole) {
  const newRole = currentRole === 'admin' ? 'member' : 'admin';
  try {
    await UsersAPI.changeRole(id, newRole);
    showAlert('#adminAlert', `Rol güncellendi: ${newRole}`, 'success');
    await loadUsers();
  } catch (err) { alert(err.message); }
};
