const express      = require('express');
const { createClient } = require('@supabase/supabase-js');
const supabase     = require('../supabase');
const authMiddle   = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const router       = express.Router();

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/bookings/all — Tüm rezervasyonlar (admin)
router.get('/all', authMiddle, requireAdmin, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY eksik.' });
  }

  const { data: bookings, error: bError } = await supabaseAdmin
    .from('bookings')
    .select('*, classes(*)')
    .order('booked_at', { ascending: false });

  if (bError) return res.status(500).json({ error: bError.message });

  const userIds = [...new Set((bookings || []).map(b => b.user_id).filter(Boolean))];
  let profileMap = {};

  if (userIds.length > 0) {
    const { data: profiles, error: pError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (pError) return res.status(500).json({ error: pError.message });

    profileMap = (profiles || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }

  return res.json(
    (bookings || []).map(b => ({ ...b, profile: profileMap[b.user_id] || null }))
  );
});

// GET /api/bookings — Kullanıcının rezervasyonları
router.get('/', authMiddle, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, classes(*)')
    .eq('user_id', req.user.id)
    .eq('status', 'confirmed')
    .order('booked_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// POST /api/bookings — Rezervasyon yap
router.post('/', authMiddle, async (req, res) => {
  const { class_id } = req.body;

  if (!class_id) return res.status(400).json({ error: 'class_id gerekli.' });

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('class_id', class_id)
    .eq('status', 'confirmed')
    .maybeSingle();

  if (existing) return res.status(400).json({ error: 'Bu derse zaten kayıtlısın.' });

  const { data, error } = await supabase
    .from('bookings')
    .insert({ user_id: req.user.id, class_id, status: 'confirmed' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// DELETE /api/bookings/:id — Kullanıcının kendi rezervasyonunu iptal etmesi
router.delete('/:id', authMiddle, async (req, res) => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Rezervasyon iptal edildi.' });
});

// DELETE /api/bookings/:id/admin — Admin herhangi bir rezervasyonu iptal eder
router.delete('/:id/admin', authMiddle, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Rezervasyon iptal edildi.' });
});

module.exports = router;
