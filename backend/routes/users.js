const express    = require('express');
const { createClient } = require('@supabase/supabase-js');
const supabase   = require('../supabase');
const authMiddle = require('../middleware/auth');
const router     = express.Router();

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/users — Tüm kullanıcılar (admin)
router.get('/', authMiddle, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler kullanıcıları görebilir.' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/users/me — Kendi profili
router.get('/me', authMiddle, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Profil bulunamadı.' });
  return res.json(data);
});

// PUT /api/users/me — Profil güncelle
router.put('/me', authMiddle, async (req, res) => {
  const { full_name } = req.body;

  if (!full_name) return res.status(400).json({ error: 'full_name gerekli.' });

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// PUT /api/users/:id/role — Rol değiştir (admin)
router.put('/:id/role', authMiddle, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler rol değiştirebilir.' });
  }

  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Geçersiz rol.' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY eksik.' });
  }

  const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(req.params.id);
  if (authUserError || !authUserData?.user) {
    return res.status(500).json({ error: authUserError?.message || 'Auth kullanıcısı bulunamadı.' });
  }

  const mergedMetadata = {
    ...(authUserData.user.user_metadata || {}),
    role
  };

  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, {
    user_metadata: mergedMetadata
  });

  if (authUpdateError) {
    return res.status(500).json({ error: authUpdateError.message });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

module.exports = router;
