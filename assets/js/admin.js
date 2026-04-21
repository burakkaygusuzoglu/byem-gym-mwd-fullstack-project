/* ============================================================
   BYEM GYM — admin.js
   Admin panel — sadece admin rolündeki kullanıcılar erişebilir
   
   Admin yapmak için Supabase'de:
   profiles tablosunda role = 'admin' olarak güncelle
   ============================================================ */

let currentUser = null;

$(document).ready(async function () {

  /* ── Auth & Role check ────────────────────────────────────── */
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  currentUser = session.user;

  // Check admin role
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    $('main').html(`
      <div style="text-align:center; padding:5rem 1rem;">
        <i class="fa-solid fa-ban" style="font-size:3rem; color:var(--danger); display:block; margin-bottom:1rem;"></i>
        <h2 style="color:var(--text);">Erişim Reddedildi</h2>
        <p>Bu sayfaya sadece admin rolündeki kullanıcılar erişebilir.</p>
        <a href="dashboard.html" class="btn btn-primary mt-3">Dashboard'a Dön</a>
      </div>
    `);
    return;
  }

  /* ── Navbar ───────────────────────────────────────────────── */
  $('#navActions').html(`
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--danger);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">A</div>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  `);
  $('#logoutBtn').on('click', async () => { await supabaseClient.auth.signOut(); window.location.href = '../index.html'; });

  /* ── Load all data ────────────────────────────────────────── */
  await loadStats();
  await loadClasses();
  await loadUsers();
  await loadMemberships();
  await loadBookings();

  /* ── Tab navigation ───────────────────────────────────────── */
  $('.admin-tab').on('click', function () {
    const tab = $(this).data('tab');
    $('.admin-tab').removeClass('active');
    $(this).addClass('active');
    $('[id^="tab-"]').addClass('hidden');
    $(`#tab-${tab}`).removeClass('hidden');
  });

  /* ── Add class ────────────────────────────────────────────── */
  $('#addClassBtn').on('click', async function () {
    const name       = $('#className').val().trim();
    const instructor = $('#classInstructor').val().trim();
    const capacity   = parseInt($('#classCapacity').val());
    const schedule   = $('#classSchedule').val();
    const $btn       = $(this);

    if (!name || !instructor || !capacity || !schedule) {
      showAlert('#adminAlert', 'Tüm alanları doldurun.', 'error');
      return;
    }

    setLoading($btn, true);

    const { error } = await supabaseClient.from('classes').insert({
      name, instructor, capacity,
      schedule: new Date(schedule).toISOString()
    });

    if (error) {
      showAlert('#adminAlert', 'Hata: ' + error.message, 'error');
    } else {
      showAlert('#adminAlert', '✅ Ders eklendi!', 'success');
      $('#className, #classInstructor, #classCapacity, #classSchedule').val('');
      await loadClasses();
      await loadStats();
    }

    setLoading($btn, false);
  });

});

/* ── Stats ────────────────────────────────────────────────── */
async function loadStats () {
  const [users, memberships, bookings, classes] = await Promise.all([
    supabaseClient.from('profiles').select('id', { count: 'exact' }),
    supabaseClient.from('memberships').select('id', { count: 'exact' }).eq('status', 'active'),
    supabaseClient.from('bookings').select('id', { count: 'exact' }).eq('status', 'confirmed'),
    supabaseClient.from('classes').select('id', { count: 'exact' })
  ]);

  $('#statUsers').text(users.count || 0);
  $('#statActiveMemberships').text(memberships.count || 0);
  $('#statBookings').text(bookings.count || 0);
  $('#statClasses').text(classes.count || 0);
}

/* ── Classes ──────────────────────────────────────────────── */
async function loadClasses () {
  const { data } = await supabaseClient.from('classes').select('*').order('schedule', { ascending: true });
  const { data: bookings } = await supabaseClient.from('bookings').select('class_id').eq('status', 'confirmed');

  const countMap = {};
  (bookings || []).forEach(b => { countMap[b.class_id] = (countMap[b.class_id] || 0) + 1; });

  $('#classesTableBody').empty();

  if (!data || data.length === 0) {
    $('#classesTableBody').html('<tr><td colspan="6" style="text-align:center; color:var(--muted);">Henüz ders eklenmedi.</td></tr>');
    return;
  }

  data.forEach(c => {
    const dt       = new Date(c.schedule);
    const dateStr  = dt.toLocaleString('tr-TR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const booked   = countMap[c.id] || 0;

    $('#classesTableBody').append(`
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.instructor}</td>
        <td>${dateStr}</td>
        <td>${c.capacity}</td>
        <td><span class="badge ${booked >= c.capacity ? 'badge-danger' : 'badge-success'}">${booked}/${c.capacity}</span></td>
        <td>
          <div class="actions">
            <button class="btn btn-danger btn-sm" onclick="deleteClass(${c.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `);
  });
}

/* ── Users ────────────────────────────────────────────────── */
async function loadUsers () {
  const { data } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });

  $('#usersTableBody').empty();

  if (!data || data.length === 0) {
    $('#usersTableBody').html('<tr><td colspan="5" style="text-align:center; color:var(--muted);">Henüz üye yok.</td></tr>');
    return;
  }

  data.forEach(u => {
    const roleLabel = u.role === 'admin' ? '<span class="badge badge-danger">Admin</span>' : '<span class="badge badge-primary">Üye</span>';
    $('#usersTableBody').append(`
      <tr>
        <td><strong>${u.full_name || '—'}</strong></td>
        <td>${u.email || '—'}</td>
        <td>${roleLabel}</td>
        <td>${formatDate(u.created_at)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="makeAdmin('${u.id}', '${u.role}')">
            ${u.role === 'admin' ? 'Üye Yap' : 'Admin Yap'}
          </button>
        </td>
      </tr>
    `);
  });
}

/* ── Memberships ──────────────────────────────────────────── */
async function loadMemberships () {
  const { data } = await supabaseClient
    .from('memberships')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  $('#membershipsTableBody').empty();

  if (!data || data.length === 0) {
    $('#membershipsTableBody').html('<tr><td colspan="5" style="text-align:center; color:var(--muted);">Henüz üyelik yok.</td></tr>');
    return;
  }

  data.forEach(m => {
    const statusBadge = m.status === 'active'
      ? '<span class="badge badge-success">Aktif</span>'
      : '<span class="badge badge-danger">İptal</span>';

    $('#membershipsTableBody').append(`
      <tr>
        <td>${m.profiles?.full_name || m.profiles?.email || '—'}</td>
        <td><strong>${m.plan_name}</strong></td>
        <td>${formatDate(m.start_date)}</td>
        <td>${formatDate(m.end_date)}</td>
        <td>${statusBadge}</td>
      </tr>
    `);
  });
}

/* ── Bookings ─────────────────────────────────────────────── */
async function loadBookings () {
  const { data } = await supabaseClient
    .from('bookings')
    .select('*, profiles(full_name, email), classes(name, schedule)')
    .order('booked_at', { ascending: false })
    .limit(50);

  $('#bookingsTableBody').empty();

  if (!data || data.length === 0) {
    $('#bookingsTableBody').html('<tr><td colspan="5" style="text-align:center; color:var(--muted);">Henüz rezervasyon yok.</td></tr>');
    return;
  }

  data.forEach(b => {
    const statusBadge = b.status === 'confirmed'
      ? '<span class="badge badge-success">Onaylı</span>'
      : '<span class="badge badge-danger">İptal</span>';

    const dt = b.classes?.schedule ? new Date(b.classes.schedule).toLocaleString('tr-TR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';

    $('#bookingsTableBody').append(`
      <tr>
        <td>${b.profiles?.full_name || b.profiles?.email || '—'}</td>
        <td><strong>${b.classes?.name || '—'}</strong></td>
        <td>${dt}</td>
        <td>${statusBadge}</td>
        <td>
          ${b.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="cancelBookingAdmin(${b.id})">İptal Et</button>` : '—'}
        </td>
      </tr>
    `);
  });
}

/* ── Actions ──────────────────────────────────────────────── */
window.deleteClass = async function (classId) {
  if (!confirm('Bu dersi silmek istediğinden emin misin? Tüm rezervasyonlar da silinecek.')) return;

  await supabaseClient.from('bookings').delete().eq('class_id', classId);
  await supabaseClient.from('classes').delete().eq('id', classId);

  showAlert('#adminAlert', 'Ders silindi.', 'info');
  await loadClasses();
  await loadStats();
};

window.makeAdmin = async function (userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'member' : 'admin';
  await supabaseClient.from('profiles').update({ role: newRole }).eq('id', userId);
  showAlert('#adminAlert', `Rol güncellendi: ${newRole}`, 'success');
  await loadUsers();
};

window.cancelBookingAdmin = async function (bookingId) {
  await supabaseClient.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  showAlert('#adminAlert', 'Rezervasyon iptal edildi.', 'info');
  await loadBookings();
  await loadStats();
};
