/* ============================================================
   BYEM GYM — admin.js
   ============================================================ */

const LOCALE = typeof getLocale === 'function' ? getLocale() : 'tr-TR';

async function renderTable(tbodyId, fetchFn, { colspan, emptyMsg, errorMsg, rowBuilder }) {
  const $tbody = $(`#${tbodyId}`).empty();
  try {
    const data = await fetchFn();
    if (!data.length) {
      $tbody.html(`<tr><td colspan="${colspan}" style="text-align:center;color:var(--muted);">${emptyMsg}</td></tr>`);
      return;
    }
    data.forEach(item => $tbody.append(rowBuilder(item)));
  } catch (err) {
    console.error(`${tbodyId}:`, err.message);
    $tbody.html(`<tr><td colspan="${colspan}" style="text-align:center;color:var(--danger);">${errorMsg}</td></tr>`);
  }
}

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  let isAdmin = false;
  try {
    const me = await AuthAPI.me();
    isAdmin = me?.role === 'admin';
    Auth.setUser(me);
  } catch (err) {
    const localUser = Auth.getUser();
    if (localUser && localUser.role === 'admin') {
      isAdmin = true;
    } else {
      Auth.logout();
      return;
    }
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

  await Promise.all([loadStats(), loadClasses(), loadUsers(), loadMemberships(), loadBookings()]);

  $('.admin-tab').on('click', function () {
    const tab = $(this).data('tab');
    $('.admin-tab').removeClass('active');
    $(this).addClass('active');
    $('[id^="tab-"]').addClass('hidden');
    $(`#tab-${tab}`).removeClass('hidden');
  });

  $('#addClassBtn').on('click', async function () {
    const $btn        = $(this);
    const name        = $('#className').val().trim();
    const instructor  = $('#classInstructor').val().trim();
    const capacity    = parseInt($('#classCapacity').val());
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
      showAlert('#adminAlert', 'Ders eklendi!', 'success');
      $('#className, #classInstructor, #classCapacity, #classSchedule').val('');
      await Promise.all([loadClasses(), loadStats()]);
    } catch (err) {
      showAlert('#adminAlert', err.message, 'error');
    }
    setLoading($btn, false);
  });

});

async function loadStats() {
  try {
    const s = await AdminAPI.stats();
    $('#statUsers').text(s.users);
    $('#statClasses').text(s.classes);
    $('#statActiveMemberships').text(s.activeMemberships);
    $('#statBookings').text(s.confirmedBookings);
  } catch (err) {
    console.error('loadStats:', err.message);
  }
}

async function loadClasses() {
  await renderTable('classesTableBody', ClassesAPI.getAll, {
    colspan:  6,
    emptyMsg: 'Henüz ders eklenmedi.',
    errorMsg: 'Dersler yüklenemedi.',
    rowBuilder: c => {
      const dt     = new Date(c.schedule).toLocaleString(LOCALE, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
      const booked = c.booked_count || 0;
      return $('<tr>').append(
        $('<td>').append($('<strong>').text(c.name)),
        $('<td>').text(c.instructor),
        $('<td>').text(dt),
        $('<td>').text(c.capacity),
        $('<td>').html(`<span class="badge ${booked >= c.capacity ? 'badge-danger' : 'badge-success'}">${booked}/${c.capacity}</span>`),
        $('<td>').html(`<button class="btn btn-danger btn-sm" onclick="deleteClass(${c.id})"><i class="fa-solid fa-trash"></i></button>`)
      );
    }
  });
}

async function loadUsers() {
  await renderTable('usersTableBody', UsersAPI.getAll, {
    colspan:  5,
    emptyMsg: 'Henüz üye yok.',
    errorMsg: 'Kullanıcılar yüklenemedi.',
    rowBuilder: u => {
      const roleBadge = u.role === 'admin'
        ? '<span class="badge badge-danger">Admin</span>'
        : '<span class="badge badge-primary">Üye</span>';
      return $('<tr>').append(
        $('<td>').append($('<strong>').text(u.full_name || '—')),
        $('<td>').text(u.email || '—'),
        $('<td>').html(roleBadge),
        $('<td>').text(formatDate(u.created_at)),
        $('<td>').html(`<button class="btn btn-ghost btn-sm" onclick="changeRole('${u.id}','${u.role}')">${u.role === 'admin' ? 'Üye Yap' : 'Admin Yap'}</button>`)
      );
    }
  });
}

async function loadMemberships() {
  await renderTable('membershipsTableBody', MembershipsAPI.getAll, {
    colspan:  5,
    emptyMsg: 'Kayıt bulunamadı.',
    errorMsg: 'Üyelikler yüklenemedi.',
    rowBuilder: m => {
      const statusBadge = m.status === 'active'
        ? '<span class="badge badge-success">Aktif</span>'
        : '<span class="badge badge-danger">Pasif</span>';
      return $('<tr>').append(
        $('<td>').text(m.profile?.full_name || m.profile?.email || '—'),
        $('<td>').text(m.plan_name || '—'),
        $('<td>').text(formatDate(m.start_date)),
        $('<td>').text(formatDate(m.end_date)),
        $('<td>').html(statusBadge)
      );
    }
  });
}

async function loadBookings() {
  await renderTable('bookingsTableBody', BookingsAPI.getAll, {
    colspan:  5,
    emptyMsg: 'Kayıt bulunamadı.',
    errorMsg: 'Rezervasyonlar yüklenemedi.',
    rowBuilder: b => {
      const dateStr = b.classes?.schedule
        ? new Date(b.classes.schedule).toLocaleString(LOCALE, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
        : '—';
      const statusBadge = b.status === 'confirmed'
        ? '<span class="badge badge-success">Onaylı</span>'
        : '<span class="badge badge-danger">İptal</span>';
      const actionBtn = b.status === 'confirmed'
        ? `<button class="btn btn-danger btn-sm" onclick="cancelBookingAdmin(${b.id})">İptal Et</button>`
        : '—';
      return $('<tr>').append(
        $('<td>').text(b.profile?.full_name || b.profile?.email || '—'),
        $('<td>').text(b.classes?.name || '—'),
        $('<td>').text(dateStr),
        $('<td>').html(statusBadge),
        $('<td>').html(actionBtn)
      );
    }
  });
}

window.deleteClass = async function (id) {
  if (!confirm('Bu dersi silmek istediğinden emin misin?')) return;
  try {
    await ClassesAPI.delete(id);
    showAlert('#adminAlert', 'Ders silindi.', 'info');
    await Promise.all([loadClasses(), loadStats()]);
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

window.cancelBookingAdmin = async function (id) {
  if (!confirm('Bu rezervasyonu iptal etmek istediğinden emin misin?')) return;
  try {
    await BookingsAPI.cancelAdmin(id);
    showAlert('#adminAlert', 'Rezervasyon iptal edildi.', 'info');
    await Promise.all([loadBookings(), loadStats()]);
  } catch (err) { alert(err.message); }
};
