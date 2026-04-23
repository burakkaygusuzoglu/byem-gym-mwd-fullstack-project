/* ============================================================
   BYEM GYM — booking.js — Backend API ile
   ============================================================ */

let allClasses   = [];
let selectedClass = {};

const DAYS_TR   = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const DAYS_EN   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TYPE_ICONS = { yoga:'fa-spa', crossfit:'fa-dumbbell', spinning:'fa-bicycle', pilates:'fa-person', zumba:'fa-music' };

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  await loadClasses();
  await loadMyBookings();

  $('#filterType, #filterDay').on('change', renderClasses);
  $('#clearFilter').on('click', function () { $('#filterType, #filterDay').val(''); renderClasses(); });
  $('#modalOverlay, #modalCancel').on('click', closeModal);
  $('#modalConfirm').on('click', confirmBooking);
});

async function loadClasses() {
  try {
    const data = await ClassesAPI.getAll();
    allClasses = data.map(c => ({
      ...c,
      type: Object.keys(TYPE_ICONS).find(t => c.name.toLowerCase().includes(t)) || 'crossfit'
    }));
    renderClasses();
  } catch {
    $('#classesGrid').html('<p class="text-muted">Dersler yüklenemedi.</p>');
  }
}

async function renderClasses() {
  const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
  const dayLabels = locale === 'en-US' ? DAYS_EN : DAYS_TR;

  const filterType = $('#filterType').val();
  const filterDay  = $('#filterDay').val();

  let filtered = allClasses.filter(c => {
    const dayName = DAYS_TR[new Date(c.schedule).getDay()];
    return (!filterType || c.type === filterType) && (!filterDay || dayName === filterDay);
  });

  // Booking counts via API
  let bookingCounts = {};
  try {
    const bookings = await BookingsAPI.getMyBookings();
    bookings.forEach(b => { bookingCounts[b.class_id] = (bookingCounts[b.class_id] || 0) + 1; });
  } catch {}

  if (filtered.length === 0) {
    $('#classesGrid').html('<div style="grid-column:1/-1" class="empty-state card"><i class="fa-solid fa-filter"></i><p>Bu filtreye uygun ders bulunamadı.</p></div>');
    return;
  }

  $('#classesGrid').empty();
  filtered.forEach(c => {
    const booked  = bookingCounts[c.id] || 0;
    const left    = c.capacity - booked;
    const isFull  = left <= 0;
    const isLow   = left <= 3 && !isFull;
    const capClass = isFull ? 'capacity-full' : isLow ? 'capacity-low' : 'capacity-ok';
    const capText  = isFull ? 'Dolu' : `${left} yer kaldı`;
    const icon     = TYPE_ICONS[c.type] || 'fa-dumbbell';
    const dt       = new Date(c.schedule);
    const dayName  = dayLabels[dt.getDay()];
    const timeStr  = dt.toLocaleTimeString(locale, { hour:'2-digit', minute:'2-digit' });
    const dateStr  = dt.toLocaleDateString(locale, { day:'2-digit', month:'short' });

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
            <div class="class-meta-item"><i class="fa-solid fa-users"></i>${c.capacity} kişilik</div>
          </div>
          <button class="btn btn-${isFull ? 'ghost' : 'primary'} btn-full btn-sm"
            ${isFull ? 'disabled' : ''}
            onclick="openBookingModal(${JSON.stringify(c).replace(/"/g,'&quot;')})">
            ${isFull ? 'Kontenjan Dolu' : 'Rezervasyon Yap'}
          </button>
        </div>
      </div>
    `);
  });
}

async function loadMyBookings() {
  try {
    const data = await BookingsAPI.getMyBookings();
    if (!data || data.length === 0) return;

    $('#myBookingsList').empty();
    data.forEach(b => {
      const cls = b.classes;
      const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
      const dt  = new Date(cls?.schedule).toLocaleString(locale, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      $('#myBookingsList').append(`
        <div class="my-booking-card">
          <div class="my-booking-info">
            <div class="my-booking-dot"></div>
            <div>
              <span class="my-booking-name">${cls?.name || '—'}</span>
              <span class="my-booking-time">${dt} · ${cls?.instructor || ''}</span>
            </div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">İptal Et</button>
        </div>
      `);
    });
  } catch {}
}

window.openBookingModal = function (cls) {
  selectedClass = cls;
  const locale = (typeof getLocale === 'function') ? getLocale() : 'tr-TR';
  const dt = new Date(cls.schedule).toLocaleString(locale, { day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit' });
  $('#modalClassName').text(cls.name);
  $('#modalInstructor').text(cls.instructor);
  $('#modalSchedule').text(dt);
  $('#modalCapacity').text(cls.capacity + ' kişi');
  $('#modalAlert').hide();
  $('#bookingModal, #modalOverlay').css('display', 'block');
};

function closeModal() { $('#bookingModal, #modalOverlay').css('display', 'none'); }

async function confirmBooking() {
  const $btn = $('#modalConfirm');
  setLoading($btn, true);
  try {
    await BookingsAPI.create(selectedClass.id);
    closeModal();
    showAlert('#bookingAlert', '✅ Rezervasyon başarıyla oluşturuldu!', 'success');
    await loadClasses();
    await loadMyBookings();
  } catch (err) {
    showAlert('#modalAlert', err.message, 'error');
  }
  setLoading($btn, false);
}

window.cancelBooking = async function (bookingId) {
  if (!confirm('Rezervasyonu iptal etmek istediğinden emin misin?')) return;
  try {
    await BookingsAPI.cancel(bookingId);
    showAlert('#bookingAlert', 'Rezervasyon iptal edildi.', 'info');
    await loadClasses();
    await loadMyBookings();
  } catch (err) {
    alert(err.message);
  }
};
