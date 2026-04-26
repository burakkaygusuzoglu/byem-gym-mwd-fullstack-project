const express      = require('express');
const supabase     = require('../supabase');
const authMiddle   = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const router       = express.Router();

// GET /api/memberships/all — Tüm üyelikler (admin)
router.get('/all', authMiddle, requireAdmin, async (req, res) => {

  const { data: memberships, error: mError } = await supabase
    .from('memberships')
    .select('*')
    .order('start_date', { ascending: false });

  if (mError) return res.status(500).json({ error: mError.message });

  const userIds = [...new Set((memberships || []).map(m => m.user_id).filter(Boolean))];
  let profileMap = {};

  if (userIds.length > 0) {
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (pError) return res.status(500).json({ error: pError.message });

    profileMap = (profiles || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }

  const result = (memberships || []).map((m) => ({
    ...m,
    profile: profileMap[m.user_id] || null
  }));

  return res.json(result);
});

// GET /api/memberships/me — Aktif üyelik
router.get('/me', authMiddle, async (req, res) => {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .single();

  if (error) return res.status(404).json({ error: 'Aktif üyelik bulunamadı.' });
  return res.json(data);
});

// POST /api/memberships — Üyelik satın al
router.post('/', authMiddle, async (req, res) => {
  const { plan_name, billing } = req.body;

  if (!plan_name) return res.status(400).json({ error: 'plan_name gerekli.' });

  const months    = billing === 'annual' ? 12 : 1;
  const startDate = new Date();
  const endDate   = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  // Mevcut aktif üyeliği iptal et
  await supabase
    .from('memberships')
    .update({ status: 'cancelled' })
    .eq('user_id', req.user.id)
    .eq('status', 'active');

  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id:    req.user.id,
      plan_name,
      start_date: startDate.toISOString().split('T')[0],
      end_date:   endDate.toISOString().split('T')[0],
      status:     'active'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// DELETE /api/memberships/me — Üyelik iptal
router.delete('/me', authMiddle, async (req, res) => {
  const { error } = await supabase
    .from('memberships')
    .update({ status: 'cancelled' })
    .eq('user_id', req.user.id)
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Üyelik iptal edildi.' });
});

module.exports = router;
