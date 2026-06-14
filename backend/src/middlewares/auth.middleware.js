import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) throw new ApiError(401, 'Please log in to access this resource');

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.active) throw new ApiError(401, 'User no longer exists');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Role '${req.user.role}' is not authorized`));
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.active) req.user = user;
    }
  } catch {
    // ignore
  }
  next();
};
