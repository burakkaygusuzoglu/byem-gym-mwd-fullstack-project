const express = require('express');
const authMiddle = require('../middleware/auth');

const router = express.Router();

// GET /api/exercises — API Ninjas proxy (auth required)
router.get('/', authMiddle, async (req, res) => {
  const apiKey = process.env.EXERCISES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'EXERCISES_API_KEY eksik.' });
  }

  const allowedKeys = ['name', 'muscle', 'difficulty', 'type', 'offset', 'limit'];
  const params = new URLSearchParams();

  allowedKeys.forEach((key) => {
    const value = req.query[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value));
    }
  });

  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/exercises?${params.toString()}`, {
      headers: { 'X-Api-Key': apiKey }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || 'Egzersiz servisi hatası.'
      });
    }

    return res.json(data);
  } catch {
    return res.status(502).json({ error: 'Egzersiz servisine baglanilamadi.' });
  }
});

module.exports = router;
