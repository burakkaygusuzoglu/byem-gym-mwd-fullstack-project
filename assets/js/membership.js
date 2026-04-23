/* ============================================================
   BYEM GYM — membership.js — Backend API ile
   ============================================================ */

let isAnnual = false;
let selectedPlan = {};

$(document).ready(async function () {

  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  await loadActiveMembership();

  /* ── Billing Toggle ───────────────────────────────────────── */
  $('#billingToggle').on('click', function () {
    isAnnual = !isAnnual;
    $(this).toggleClass('on');
    $('.price-amount').each(function () {
      $(this).text(isAnnual ? $(this).data('annual') : $(this).data('monthly'));
    });
    $('.price-annual').toggleClass('hidden', !isAnnual);
  });

  /* ── FAQ ──────────────────────────────────────────────────── */
  $('.faq-question').on('click', function () {
    const $item = $(this).closest('.faq-item');
    $('.faq-item').not($item).removeClass('open');
    $item.toggleClass('open');
  });

  /* ── Modal ────────────────────────────────────────────────── */
  $('#modalOverlay, #modalCancel').on('click', closeModal);

  $('#modalConfirm').on('click', async function () {
    const $btn = $(this);
    setLoading($btn, true);

    try {
      await MembershipsAPI.create(selectedPlan.name, isAnnual ? 'annual' : 'monthly');
      closeModal();
      showAlert('.membership-hero', '✅ Plan başarıyla aktifleştirildi!', 'success');
      await loadActiveMembership();
    } catch (err) {
      showAlert('#modalAlert', err.message, 'error');
    }

    setLoading($btn, false);
  });

  /* ── Cancel plan ──────────────────────────────────────────── */
  $(document).on('click', '#cancelPlanBtn', async function () {
    if (!confirm('Planınızı iptal etmek istediğinizden emin misiniz?')) return;
    try {
      await MembershipsAPI.cancel();
      await loadActiveMembership();
    } catch (err) {
      alert(err.message);
    }
  });

});

window.openPlanModal = function (btn) {
  const $card = $(btn).closest('.plan-card');
  selectedPlan = {
    name:  $card.data('plan'),
    price: isAnnual ? $card.data('annual') : $card.data('monthly')
  };
  $('#modalPlanName').text(selectedPlan.name);
  $('#modalPrice').text(selectedPlan.price);
  $('#modalBillingType').text(isAnnual ? 'Yıllık' : 'Aylık');
  $('#modalAlert').hide();
  $('#planModal, #modalOverlay').css('display', 'block');
};

function closeModal() { $('#planModal, #modalOverlay').css('display', 'none'); }

async function loadActiveMembership() {
  try {
    const m = await MembershipsAPI.getMy();
    $('#activePlanBanner').removeClass('hidden');
    $('#activePlanName').text(m.plan_name);
    $('#activePlanDate').text(`${formatDate(m.start_date)} — ${formatDate(m.end_date)}`);
  } catch {
    $('#activePlanBanner').addClass('hidden');
  }
}
