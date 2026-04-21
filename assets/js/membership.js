/* ============================================================
   BYEM GYM — membership.js
   ============================================================ */

let isAnnual = false;
let selectedPlan = {};
let currentUser = null;

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

  /* ── Load active membership ───────────────────────────────── */
  await loadActiveMembership();

  /* ── Billing Toggle ───────────────────────────────────────── */
  $('#billingToggle').on('click', function () {
    isAnnual = !isAnnual;
    $(this).toggleClass('on');

    $('.price-amount').each(function () {
      const price = isAnnual ? $(this).data('annual') : $(this).data('monthly');
      $(this).text(price);
    });

    $('.price-annual').toggleClass('hidden', !isAnnual);
    $('#modalBillingType').text(isAnnual ? 'Yıllık' : 'Aylık');
  });

  /* ── FAQ Accordion ────────────────────────────────────────── */
  $('.faq-question').on('click', function () {
    const $item = $(this).closest('.faq-item');
    $('.faq-item').not($item).removeClass('open');
    $item.toggleClass('open');
  });

  /* ── Modal close ──────────────────────────────────────────── */
  $('#modalOverlay, #modalCancel').on('click', closeModal);

  /* ── Confirm plan ─────────────────────────────────────────── */
  $('#modalConfirm').on('click', async function () {
    const $btn = $(this);
    setLoading($btn, true);

    const today    = new Date();
    const endDate  = new Date();
    endDate.setMonth(endDate.getMonth() + (isAnnual ? 12 : 1));

    // Cancel existing
    await supabaseClient
      .from('memberships')
      .update({ status: 'cancelled' })
      .eq('user_id', currentUser.id)
      .eq('status', 'active');

    // Insert new
    const { error } = await supabaseClient.from('memberships').insert({
      user_id:    currentUser.id,
      plan_name:  selectedPlan.name,
      start_date: today.toISOString().split('T')[0],
      end_date:   endDate.toISOString().split('T')[0],
      status:     'active'
    });

    if (error) {
      showAlert('#modalAlert', 'Hata: ' + error.message, 'error');
      setLoading($btn, false);
      return;
    }

    // Save to localStorage as cache
    localStorage.setItem('byem_membership', JSON.stringify({
      plan_name: selectedPlan.name,
      end_date: endDate.toISOString().split('T')[0]
    }));

    closeModal();
    showAlert('.membership-hero', '✅ Plan başarıyla aktifleştirildi!', 'success');
    await loadActiveMembership();
    setLoading($btn, false);
  });

});

/* ── Open modal ───────────────────────────────────────────── */
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

function closeModal () {
  $('#planModal, #modalOverlay').css('display', 'none');
}

/* ── Load active membership ───────────────────────────────── */
async function loadActiveMembership () {
  const { data } = await supabaseClient
    .from('memberships')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('status', 'active')
    .single();

  if (data) {
    $('#activePlanBanner').removeClass('hidden');
    $('#activePlanName').text(data.plan_name);
    $('#activePlanDate').text(`${formatDate(data.start_date)} — ${formatDate(data.end_date)}`);
  } else {
    $('#activePlanBanner').addClass('hidden');
  }
}

/* ── Cancel plan ──────────────────────────────────────────── */
$(document).on('click', '#cancelPlanBtn', async function () {
  if (!confirm('Planınızı iptal etmek istediğinizden emin misiniz?')) return;

  await supabaseClient
    .from('memberships')
    .update({ status: 'cancelled' })
    .eq('user_id', currentUser.id)
    .eq('status', 'active');

  localStorage.removeItem('byem_membership');
  await loadActiveMembership();
});
