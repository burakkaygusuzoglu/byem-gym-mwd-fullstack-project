const express  = require('express');
const jwt      = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../supabase');
const router   = express.Router();
const authMiddle = require('../middleware/auth');

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Tüm alanlar gerekli.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });
  }

  // Supabase Auth ile kayıt
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: `${first_name} ${last_name}`, first_name, last_name, role: 'member' }
    }
  });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json({ message: 'Kayıt başarılı.', user: data.user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli.' });
  }

  // Supabase Auth ile giriş
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: 'Geçersiz email veya şifre.' });

  // Profiles tablosundan güncel rolü al (user_metadata ile senkronizasyon sorunundan kaçınmak için)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  const role     = profile?.role || data.user.user_metadata?.role || 'member';
  const fullName = profile?.full_name || data.user.user_metadata?.full_name;

  // JWT üret
  const token = jwt.sign(
    { id: data.user.id, email: data.user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Giriş başarılı.',
    token,
    user: {
      id:        data.user.id,
      email:     data.user.email,
      full_name: fullName,
      role
    }
  });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  return res.json(data);
});

// PUT /api/auth/password
router.put('/password', authMiddle, async (req, res) => {
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı.' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY eksik.' });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
    password: new_password
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Şifre güncellendi.' });
});

module.exports = router;
