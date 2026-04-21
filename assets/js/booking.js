/* ============================================================
   BYEM GYM — booking.js
   ============================================================ */

let currentUser = null;
let allClasses  = [];
let selectedClass = {};

// Static demo classes (seeded into Supabase on first load)
const DEMO_CLASSES = [
  { name:'Yoga', instructor:'Ayşe Kaya',    schedule:'2026-04-22T09:00:00', capacity:15, type:'yoga' },
  { name:'CrossFit', instructor:'Mehmet Can', schedule:'2026-04-22T11:00:00', capacity:20, type:'crossfit' },
  { name:'Spinning', instructor:'Elif Yıldız', schedule:'2026-04-23T08:00:00', capacity:18, type:'spinning' },
  { name:'Pilates', instructor:'Selin Demir', schedule:'2026-04-23T10:00:00', capacity:12, type:'pilates' },
  { name:'Zumba', instructor:'Ali Çelik',   schedule:'2026-04-24T18:00:00', capacity:25, type:'zumba' },
  { name:'CrossFit', instructor:'Mehmet Can', schedule:'2026-04-24T07:00:00', capacity:20, type:'crossfit' },
  { name:'Yoga', instructor:'Ayşe Kaya',    schedule:'2026-04-25T09:00:00', capacity:15, type:'yoga' },
  { name:'Spinning', instructor:'Elif Yıldız', schedule:'2026-04-26T08:00:00', capacity:18, type:'spinning' },
];

const TYPE_ICONS = {
  yoga:'fa-spa', crossfit:'fa-dumbbell',
  spinning:'fa-bicycle', pilates:'fa-person', zumba:'fa-music'
};

const DAYS_TR = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

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

  /* ── Load classes ─────────────────────────────────────────── */
  await seedClasses();
  await loadClasses();
  await loadMyBookings();

  /* ── Filters ──────────────────────────────────────────────── */
  $('#filterType, #filterDay').on('change', renderClasses);
  $('#clearFilter').on('click', function () {
    $('#filterType, #filterDay').val('');
    renderClasses();
  });

  /* ── Modal ────────────────────────────────────────────────── */
  $('#modalOverlay, #modalCancel').on('click', closeModal);
  $('#modalConfirm').on('click', confirmBooking);
});

/* ── Seed demo classes ────────────────────────────────────── */
async function seedClasses () {
  const { data } = await supabaseClient.from('classes').select('id').limit(1);
  if (data && data.length > 0) return; // already seeded

  await supabaseClient.from('classes').insert(
    DEMO_CLASSES.map(c => ({ name: c.name, instructor: c.instructor, schedule: c.schedule, capacity: c.capacity }))
  );
}

/* ── Load classes from Supabase ───────────────────────────── */
async function loadClasses () {
  const { data, error } = await supabaseClient
    .from('classes')
    .select('*')
    .order('schedule', { ascending: true });

  if (error || !data) { $('#classesGrid').html('<p class="text-muted">Dersler yüklenemedi.</p>'); return; }

  // Add type from name match
  allClasses = data.map(c => ({
    ...c,
    type: Object.keys(TYPE_ICONS).find(t => c.name.toLowerCase().includes(t)) || 'crossfit'
  }));

  renderClasses();
}

/* ── Render classes ───────────────────────────────────────── */
async function renderClasses () {
  const filterType = $('#filterType').val();
  const filterDay  = $('#filterDay').val();

  let filtered = allClasses.filter(c => {
    const dayName = DAYS_TR[new Date(c.schedule).getDay()];
    return (!filterType || c.type === filterType) && (!filterDay || dayName === filterDay);
  });

  // Get booking counts
  const { data: bookingCounts } = await supabaseClient
    .from('bookings')
    .select('class_id')
    .eq('status', 'confirmed');

  const countMap = {};
  (bookingCounts || []).forEach(b => { countMap[b.class_id] = (countMap[b.class_id] || 0) + 1; });

  if (filtered.length === 0) {
    $('#classesGrid').html('<div style="grid-column:1/-1" class="empty-state card"><i class="fa-solid fa-filter"></i><p>Bu filtreye uygun ders bulunamadı.</p></div>');
    return;
  }

  $('#classesGrid').empty();
  filtered.forEach(c => {
    const booked   = countMap[c.id] || 0;
    const left     = c.capacity - booked;
    const isFull   = left <= 0;
    const isLow    = left <= 3 && !isFull;
    const capClass = isFull ? 'capacity-full' : isLow ? 'capacity-low' : 'capacity-ok';
    const capText  = isFull ? 'Dolu' : `${left} yer kaldı`;
    const icon     = TYPE_ICONS[c.type] || 'fa-dumbbell';
    const dt       = new Date(c.schedule);
    const dayName  = DAYS_TR[dt.getDay()];
    const timeStr  = dt.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
    const dateStr  = dt.toLocaleDateString('tr-TR', { day:'2-digit', month:'short' });

    $('#classesGrid').append(`
      <div class="class-card">
        <div class="class-card-top">
          <div>
            <div class="class-type-icon"><i class="fa-solid ${icon}"></i></div>
            <span class="class-name">${c.name}</span>
            <span class="class-instructor">${c.instructor}</span>
          </div>
          <span class="capacity-badge ${capClass}">${capText}</span>
        </div>
        <div class="class-card-body">
          <div class="class-meta">
            <div class="class-meta-item"><i class="fa-solid fa-calendar"></i>${dayName}, ${dateStr}</div>
            <div class="class-meta-item"><i class="fa-solid fa-clock"></i>${timeStr}</div>
            <div class="class-meta-item"><i class="fa-solid fa-users"></i>${c.capacity} kişilik kapasite</div>
          </div>
          <button class="btn btn-${isFull ? 'ghost' : 'primary'} btn-full btn-sm"
            ${isFull ? 'disabled' : ''}
            onclick="openBookingModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            ${isFull ? 'Kontenjan Dolu' : 'Rezervasyon Yap'}
          </button>
        </div>
      </div>
    `);
  });
}

/* ── Load my bookings ─────────────────────────────────────── */
async function loadMyBookings () {
  const { data } = await supabaseClient
    .from('bookings')
    .select('*, classes(*)')
    .eq('user_id', currentUser.id)
    .eq('status', 'confirmed')
    .order('booked_at', { ascending: false });

  if (!data || data.length === 0) return;

  $('#myBookingsList').empty();
  data.forEach(b => {
    const cls = b.classes;
    const dt  = new Date(cls?.schedule);
    const str = dt.toLocaleString('tr-TR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    $('#myBookingsList').append(`
      <div class="my-booking-card">
        <div class="my-booking-info">
          <div class="my-booking-dot"></div>
          <div>
            <span class="my-booking-name">${cls?.name || '—'}</span>
            <span class="my-booking-time">${str} · ${cls?.instructor || ''}</span>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">İptal Et</button>
      </div>
    `);
  });
}

/* ── Open modal ───────────────────────────────────────────── */
window.openBookingModal = function (cls) {
  selectedClass = cls;
  const dt  = new Date(cls.schedule);
  const str = dt.toLocaleString('tr-TR', { day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit' });

  $('#modalClassName').text(cls.name);
  $('#modalInstructor').text(cls.instructor);
  $('#modalSchedule').text(str);
  $('#modalCapacity').text(cls.capacity + ' kişi');
  $('#modalAlert').hide();
  $('#bookingModal, #modalOverlay').css('display', 'block');
};

function closeModal () { $('#bookingModal, #modalOverlay').css('display', 'none'); }

/* ── Confirm booking ──────────────────────────────────────── */
async function confirmBooking () {
  const $btn = $('#modalConfirm');
  setLoading($btn, true);

  // Check duplicate
  const { data: existing } = await supabaseClient
    .from('bookings')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('class_id', selectedClass.id)
    .eq('status', 'confirmed')
    .single();

  if (existing) {
    showAlert('#modalAlert', 'Bu derse zaten kayıtlısın!', 'error');
    setLoading($btn, false);
    return;
  }

  const { error } = await supabaseClient.from('bookings').insert({
    user_id:  currentUser.id,
    class_id: selectedClass.id,
    status:   'confirmed'
  });

  if (error) { showAlert('#modalAlert', 'Hata: ' + error.message, 'error'); setLoading($btn, false); return; }

  closeModal();
  showAlert('#bookingAlert', '✅ Rezervasyon başarıyla oluşturuldu!', 'success');
  await loadClasses();
  await loadMyBookings();
  setLoading($btn, false);
}

/* ── Cancel booking ───────────────────────────────────────── */
window.cancelBooking = async function (bookingId) {
  if (!confirm('Rezervasyonu iptal etmek istediğinden emin misin?')) return;

  await supabaseClient.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  showAlert('#bookingAlert', 'Rezervasyon iptal edildi.', 'info');
  await loadClasses();
  await loadMyBookings();
};
