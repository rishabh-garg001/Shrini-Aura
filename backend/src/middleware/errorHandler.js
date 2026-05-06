const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};

module.exports = errorHandler;
