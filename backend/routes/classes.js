const express    = require('express');
const supabase   = require('../supabase');
const authMiddle = require('../middleware/auth');
const router     = express.Router();

// GET /api/classes — Tüm dersler (public)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('schedule', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/classes/:id — Tek ders
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Ders bulunamadı.' });
  return res.json(data);
});

// POST /api/classes — Yeni ders ekle (admin)
router.post('/', authMiddle, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler ders ekleyebilir.' });
  }

  const { name, instructor, schedule, capacity } = req.body;

  if (!name || !instructor || !schedule || !capacity) {
    return res.status(400).json({ error: 'Tüm alanlar gerekli.' });
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({ name, instructor, schedule, capacity })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// PUT /api/classes/:id — Ders güncelle (admin)
router.put('/:id', authMiddle, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler ders güncelleyebilir.' });
  }

  const { name, instructor, schedule, capacity } = req.body;

  const { data, error } = await supabase
    .from('classes')
    .update({ name, instructor, schedule, capacity })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// DELETE /api/classes/:id — Ders sil (admin)
router.delete('/:id', authMiddle, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler ders silebilir.' });
  }

  await supabase.from('bookings').delete().eq('class_id', req.params.id);
  const { error } = await supabase.from('classes').delete().eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Ders silindi.' });
});

module.exports = router;
