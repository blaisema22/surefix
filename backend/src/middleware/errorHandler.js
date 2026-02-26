// ── Global Error Handler ─────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Record already exists (duplicate entry)' });
  }

  // MySQL FK constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced record not found' });
  }

  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal server error';
  res.status(status).json({ success: false, message });
};

// ── 404 handler ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
