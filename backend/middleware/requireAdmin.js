module.exports = function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler bu işlemi yapabilir.' });
  }
  next();
};
