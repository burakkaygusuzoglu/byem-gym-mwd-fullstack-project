const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const supabase = require('../supabase');
const router   = express.Router();

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

  // JWT üret
  const token = jwt.sign(
    { id: data.user.id, email: data.user.email, role: data.user.user_metadata?.role || 'member' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Giriş başarılı.',
    token,
    user: {
      id:        data.user.id,
      email:     data.user.email,
      full_name: data.user.user_metadata?.full_name,
      role:      data.user.user_metadata?.role || 'member'
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

module.exports = router;
