/* ============================================================
   BYEM GYM — exercises.js
   API Ninjas Exercise API entegrasyonu
   
   ⚠️  API KEY:
   EXERCISES_API_KEY değişkenine kendi API Ninjas key'ini yaz.
   https://api-ninjas.com/api/exercises
   ============================================================ */

const EXERCISES_API_KEY = 'BCIIqo8AJEdHBJc3ddDiTig3t8W7MwOT97hulZj8'; // ← Buraya key'ini yaz

const MUSCLE_LABELS = {
  chest:'Göğüs', back:'Sırt', shoulders:'Omuzlar',
  upper_arms:'Kollar', upper_legs:'Bacaklar', lower_legs:'Alt Bacak',
  waist:'Bel', cardio:'Kardiyo', abdominals:'Karın', neck:'Boyun'
};

const DIFFICULTY_LABELS = { beginner:'Başlangıç', intermediate:'Orta', expert:'İleri' };

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

  /* ── Navbar ───────────────────────────────────────────────── */
  const initial = (user.full_name || user.email || 'U').charAt(0).toUpperCase();
  $('#navActions').html(`
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">${initial}</div>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  `);
  $('#logoutBtn').on('click', () => { Auth.logout(); });

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
  const url   = `https://api.api-ninjas.com/v1/exercises?${query}`;

  try {
    const response = await $.ajax({
      url,
      headers: { 'X-Api-Key': EXERCISES_API_KEY },
      method: 'GET'
    });

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
  const diffLabel   = DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty;
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
  const diffLabel   = DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty;

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
