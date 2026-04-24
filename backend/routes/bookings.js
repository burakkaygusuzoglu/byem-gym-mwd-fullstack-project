const express    = require('express');
const supabase   = require('../supabase');
const authMiddle = require('../middleware/auth');
const router     = express.Router();

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

  // Duplicate kontrol
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('class_id', class_id)
    .eq('status', 'confirmed')
    .single();

  if (existing) return res.status(400).json({ error: 'Bu derse zaten kayıtlısın.' });

  const { data, error } = await supabase
    .from('bookings')
    .insert({ user_id: req.user.id, class_id, status: 'confirmed' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// DELETE /api/bookings/:id — Rezervasyon iptal
router.delete('/:id', authMiddle, async (req, res) => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Rezervasyon iptal edildi.' });
});

module.exports = router;
