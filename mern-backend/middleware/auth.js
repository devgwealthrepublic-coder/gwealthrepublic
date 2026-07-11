const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Verifies JWT from HTTP-Only cookie or Authorization header.
 * Attaches the authenticated user to req.user.
 * Blocks unauthenticated requests with 401.
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header first (Bearer token)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: HTTP-Only cookie (preferred for browser sessions)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised — no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found — token invalid.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorised — token verification failed.' });
  }
};

/**
 * adminOnly — Must come after protect middleware.
 * Blocks non-admin users from admin-only routes.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden — admin access required.' });
  }
  next();
};

/**
 * approvedOnly — Must come after protect middleware.
 * Blocks realtors whose accounts are still pending approval.
 */
const approvedOnly = (req, res, next) => {
  if (req.user?.status !== 'approved' && req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Your account is pending admin approval. Please wait for verification.',
    });
  }
  next();
};

module.exports = { protect, adminOnly, approvedOnly };
