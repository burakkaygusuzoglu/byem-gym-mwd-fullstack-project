/* ============================================================
   BYEM GYM — exercises.js
  Egzersiz arama (backend proxy üzerinden)
   ============================================================ */

const MUSCLE_LABELS = {
  chest:'Göğüs', back:'Sırt', shoulders:'Omuzlar',
  upper_arms:'Kollar', upper_legs:'Bacaklar', lower_legs:'Alt Bacak',
  waist:'Bel', cardio:'Kardiyo', abdominals:'Karın', neck:'Boyun'
};

const DIFFICULTY_LABELS_TR = { beginner:'Başlangıç', intermediate:'Orta', expert:'İleri' };
const DIFFICULTY_LABELS_EN = { beginner:'Beginner', intermediate:'Intermediate', expert:'Advanced' };

const MUSCLE_ICONS = {
  chest:'fa-heart-pulse', back:'fa-arrows-up-down', shoulders:'fa-child-reaching',
  upper_arms:'fa-dumbbell', upper_legs:'fa-person-walking', lower_legs:'fa-shoe-prints',
  waist:'fa-circle-dot', cardio:'fa-heart', abdominals:'fa-circle-dot', neck:'fa-circle'
};

let offset = 0;
const LIMIT = 12;
let currentParams = {};

$(document).ready(async function () {

  /* ── Auth ─────────────────────────────────────────────────── */
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }
  const user = Auth.getUser();
  if (!user) { Auth.logout(); return; }

  /* ── Initial load ─────────────────────────────────────────── */
  await fetchExercises({}, true);

  /* ── Search button ────────────────────────────────────────── */
  $('#searchBtn').on('click', doSearch);
  $('#searchInput').on('keydown', function (e) { if (e.key === 'Enter') doSearch(); });

  /* ── Load more ────────────────────────────────────────────── */
  $('#loadMoreBtn').on('click', async function () {
    offset += LIMIT;
    await fetchExercises(currentParams, false);
  });

  /* ── Modal close ──────────────────────────────────────────── */
  $('#modalOverlay, #modalClose').on('click', function () {
    $('#exerciseModal, #modalOverlay').css('display', 'none');
  });
});

function doSearch () {
  const name       = $('#searchInput').val().trim();
  const muscle     = $('#filterMuscle').val();
  const difficulty = $('#filterDifficulty').val();

  currentParams = {};
  if (name)       currentParams.name       = name;
  if (muscle)     currentParams.muscle     = muscle;
  if (difficulty) currentParams.difficulty = difficulty;

  offset = 0;
  fetchExercises(currentParams, true);
}

async function fetchExercises (params, reset) {
  if (reset) {
    $('#exercisesGrid').html(
      Array(6).fill('<div class="skeleton-card skeleton"></div>').join('')
    );
    $('#loadMoreWrap').addClass('hidden');
  }

  // Build query string
  const query = new URLSearchParams({ limit: LIMIT, offset, ...params }).toString();

  try {
    const response = await apiFetch(`/exercises?${query}`);

    if (reset) $('#exercisesGrid').empty();

    if (!response || response.length === 0) {
      if (reset) {
        $('#exercisesGrid').html('<div style="grid-column:1/-1" class="empty-state card"><i class="fa-solid fa-magnifying-glass"></i><p>Sonuç bulunamadı. Farklı bir arama deneyin.</p></div>');
      }
      $('#loadMoreWrap').addClass('hidden');
      return;
    }

    response.forEach(ex => renderExerciseCard(ex));

    if (response.length === LIMIT) {
      $('#loadMoreWrap').removeClass('hidden');
    } else {
      $('#loadMoreWrap').addClass('hidden');
    }

  } catch (err) {
    $('#exercisesGrid').html('<div style="grid-column:1/-1" class="empty-state card"><i class="fa-solid fa-triangle-exclamation"></i><p>API bağlantısı kurulamadı. API key\'ini kontrol et.</p></div>');
  }
}

function renderExerciseCard (ex) {
  const muscleLabel = MUSCLE_LABELS[ex.muscle] || ex.muscle;
  const diffMap = (typeof getLang === 'function' && getLang() === 'en') ? DIFFICULTY_LABELS_EN : DIFFICULTY_LABELS_TR;
  const diffLabel   = diffMap[ex.difficulty] || ex.difficulty;
  const icon        = MUSCLE_ICONS[ex.muscle] || 'fa-dumbbell';
  const instructions = ex.instructions || 'Detay bilgisi mevcut değil.';

  const cardData = JSON.stringify(ex).replace(/"/g, '&quot;');

  $('#exercisesGrid').append(`
    <div class="exercise-card" onclick="openExerciseModal(${cardData})">
      <div class="exercise-card-header">
        <div class="exercise-muscle-icon"><i class="fa-solid ${icon}"></i></div>
        <span class="exercise-name">${ex.name}</span>
      </div>
      <div class="exercise-card-body">
        <div class="exercise-tags">
          <span class="exercise-tag tag-muscle">${muscleLabel}</span>
          <span class="exercise-tag tag-equipment">${ex.equipment || 'Ekipsiz'}</span>
          <span class="exercise-tag tag-difficulty">${diffLabel}</span>
        </div>
        <p class="exercise-instructions">${instructions}</p>
      </div>
    </div>
  `);
}

window.openExerciseModal = function (ex) {
  const muscleLabel = MUSCLE_LABELS[ex.muscle] || ex.muscle;
  const diffMap = (typeof getLang === 'function' && getLang() === 'en') ? DIFFICULTY_LABELS_EN : DIFFICULTY_LABELS_TR;
  const diffLabel   = diffMap[ex.difficulty] || ex.difficulty;

  $('#modalName').text(ex.name);
  $('#modalTags').html(`
    <span class="exercise-tag tag-muscle">${muscleLabel}</span>
    <span class="exercise-tag tag-equipment">${ex.equipment || 'Ekipsiz'}</span>
    <span class="exercise-tag tag-difficulty">${diffLabel}</span>
    ${ex.type ? `<span class="exercise-tag tag-muscle">${ex.type}</span>` : ''}
  `);
  $('#modalInstructions').text(ex.instructions || 'Detay bilgisi mevcut değil.');
  $('#exerciseModal, #modalOverlay').css('display', 'block');
};

/* ============================================================
   �rnek Egzersizler (40 Adet - Lokal Resim Ba�lant�l�)
   ============================================================ */
const exampleExercises = [
  { name: 'Bench Press', file: 'bench-press.jpg' },
  { name: 'Squat', file: 'squat.jpg' },
  { name: 'Deadlift', file: 'deadlift.jpg' },
  { name: 'Pull Up', file: 'pull-up.jpg' },
  { name: 'Push Up', file: 'push-up.jpg' },
  { name: 'Dumbbell Curl', file: 'dumbbell-curl.jpg' },
  { name: 'Shoulder Press', file: 'shoulder-press.jpg' },
  { name: 'Leg Press', file: 'leg-press.jpg' },
  { name: 'Lunge', file: 'lunge.jpg' },
  { name: 'Plank', file: 'plank.jpg' },
  { name: 'Barbell Row', file: 'barbell-row.jpg' },
  { name: 'Tricep Extension', file: 'tricep-extension.jpg' },
  { name: 'Lat Pulldown', file: 'lat-pulldown.jpg' },
  { name: 'Leg Curl', file: 'leg-curl.jpg' },
  { name: 'Leg Extension', file: 'leg-extension.jpg' },
  { name: 'Calf Raise', file: 'calf-raise.jpg' },
  { name: 'Crunch', file: 'crunch.jpg' },
  { name: 'Russian Twist', file: 'russian-twist.jpg' },
  { name: 'Burpee', file: 'burpee.jpg' },
  { name: 'Mountain Climber', file: 'mountain-climber.jpg' },
  { name: 'Kettlebell Swing', file: 'kettlebell-swing.jpg' },
  { name: 'Box Jump', file: 'box-jump.jpg' },
  { name: 'Wall Sit', file: 'wall-sit.jpg' },
  { name: 'High Knees', file: 'high-knees.jpg' },
  { name: 'Jumping Jack', file: 'jumping-jack.jpg' },
  { name: 'Front Squat', file: 'front-squat.jpg' },
  { name: 'Incline Bench Press', file: 'incline-bench-press.jpg' },
  { name: 'Decline Bench Press', file: 'decline-bench-press.jpg' },
  { name: 'Chest Fly', file: 'chest-fly.jpg' },
  { name: 'Dumbbell Row', file: 'dumbbell-row.jpg' },
  { name: 'Upright Row', file: 'upright-row.jpg' },
  { name: 'Lateral Raise', file: 'lateral-raise.jpg' },
  { name: 'Front Raise', file: 'front-raise.jpg' },
  { name: 'Shrug', file: 'shrug.jpg' },
  { name: 'Hammer Curl', file: 'hammer-curl.jpg' },
  { name: 'Preacher Curl', file: 'preacher-curl.jpg' },
  { name: 'Skull Crusher', file: 'skull-crusher.jpg' },
  { name: 'Dumbbell Pullover', file: 'dumbbell-pullover.jpg' },
  { name: 'Cable Crossover', file: 'cable-crossover.jpg' },
  { name: 'Pec Deck', file: 'pec-deck.jpg' }
];

$(document).ready(function() {
  const gallery = $('#exampleGallery');
  if (gallery.length > 0) {
    let html = '';
    exampleExercises.forEach(ex => {
      // Projedeki assets/images/exercises klas�r�nden ger�ek foto�raflar� �a��r�yoruz.
      // E�er foto�raf klas�rde hen�z yoksa, �irkin rastgele manzara ��kmas�n diye temaya uygun ��k bir "Harf logolu turuncu-siyah ikon" ��kacak.
      const imgUrl = `../assets/images/exercises/${ex.file}`;
      const fallbackUrl = `https://ui-avatars.com/api/?name=${ex.name.replace(/ /g, '+')}&background=1a1a1a&color=f97316&size=300&font-size=0.4`;
      
      html += `<div class="example-item">
        <img src="${imgUrl}" onerror="this.onerror=null;this.src='${fallbackUrl}';" alt="${ex.name}" loading="lazy" />
        <p>${ex.name}</p>
      </div>`;
    });
    gallery.html(html);
  }
});
