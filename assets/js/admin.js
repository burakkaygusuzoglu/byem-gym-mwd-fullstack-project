/* ============================================================
   BYEM GYM — admin.js — Backend API ile
   ============================================================ */

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const cachedUser = (typeof Auth.getUser === 'function') ? Auth.getUser() : null;
  let isAdmin = cachedUser?.role === 'admin';
  try {
    const me = await AuthAPI.me();
    if (me) {
      isAdmin = isAdmin || me.role === 'admin';
      if (typeof Auth.setUser === 'function') {
        Auth.setUser({ ...(cachedUser || {}), ...me });
      }
    }
  } catch {
    // API dogrulamasi gecici olarak basarisiz olsa bile local role admin ise erisimi kesme.
  }

  if (!isAdmin) {
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
    const scheduleRaw = $('#classSchedule').val();

    if (!name || !instructor || Number.isNaN(capacity) || capacity < 1 || !scheduleRaw) {
      showAlert('#adminAlert', 'Tüm alanları doldurun.', 'error');
      return;
    }

    const scheduleDate = new Date(scheduleRaw);
    if (Number.isNaN(scheduleDate.getTime())) {
      showAlert('#adminAlert', 'Geçerli bir tarih/saat seçin.', 'error');
      return;
    }

    setLoading($btn, true);
    try {
      await ClassesAPI.create({ name, instructor, capacity, schedule: scheduleDate.toISOString() });
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
    const [users, classes, memberships, bookings] = await Promise.all([
      UsersAPI.getAll(),
      ClassesAPI.getAll(),
      MembershipsAPI.getAll(),
      BookingsAPI.getAll()
    ]);
    $('#statUsers').text(users.length || 0);
    $('#statClasses').text(classes.length || 0);
    $('#statActiveMemberships').text((memberships || []).filter(m => m.status === 'active').length);
    $('#statBookings').text((bookings || []).filter(b => b.status === 'confirmed').length);
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
    $('#usersTableBody').empty();
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
    const data = await MembershipsAPI.getAll();
    $('#membershipsTableBody').empty();

    if (!data.length) {
      $('#membershipsTableBody').html('<tr><td colspan="5" style="text-align:center;color:var(--muted);">Kayıt bulunamadı.</td></tr>');
      return;
    }

    data.forEach((m) => {
      const userName = m.profile?.full_name || m.profile?.email || '—';
      const statusBadge = m.status === 'active'
        ? '<span class="badge badge-success">Aktif</span>'
        : '<span class="badge badge-danger">Pasif</span>';

      $('#membershipsTableBody').append(`
        <tr>
          <td>${userName}</td>
          <td>${m.plan_name || '—'}</td>
          <td>${formatDate(m.start_date)}</td>
          <td>${formatDate(m.end_date)}</td>
          <td>${statusBadge}</td>
        </tr>
      `);
    });
  } catch {}
}

async function loadBookings() {
  try {
    const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
    const data = await BookingsAPI.getAll();
    $('#bookingsTableBody').empty();

    if (!data.length) {
      $('#bookingsTableBody').html('<tr><td colspan="5" style="text-align:center;color:var(--muted);">Kayıt bulunamadı.</td></tr>');
      return;
    }

    data.forEach((b) => {
      const userName = b.profile?.full_name || b.profile?.email || '—';
      const className = b.classes?.name || '—';
      const dateStr = b.classes?.schedule
        ? new Date(b.classes.schedule).toLocaleString(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';
      const statusBadge = b.status === 'confirmed'
        ? '<span class="badge badge-success">Onaylı</span>'
        : '<span class="badge badge-danger">İptal</span>';

      $('#bookingsTableBody').append(`
        <tr>
          <td>${userName}</td>
          <td>${className}</td>
          <td>${dateStr}</td>
          <td>${statusBadge}</td>
          <td>—</td>
        </tr>
      `);
    });
  } catch {}
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
