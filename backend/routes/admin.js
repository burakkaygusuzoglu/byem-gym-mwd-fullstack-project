const express      = require('express');
const supabase     = require('../supabase');
const authMiddle   = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const router       = express.Router();

// GET /api/admin/stats — Verimli COUNT sorguları
router.get('/stats', authMiddle, requireAdmin, async (req, res) => {
  const [u, c, m, b] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('classes').select('id', { count: 'exact', head: true }),
    supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed')
  ]);

  if (u.error || c.error || m.error || b.error) {
    return res.status(500).json({ error: 'İstatistikler alınamadı.' });
  }

  return res.json({
    users:             u.count || 0,
    classes:           c.count || 0,
    activeMemberships: m.count || 0,
    confirmedBookings: b.count || 0
  });
});

module.exports = router;
