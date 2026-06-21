import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
} from '../utils/token.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');

const createOAuthState = (provider) => {
  const payload = JSON.stringify({ provider, timestamp: Date.now() });
  const encodedPayload = base64UrlEncode(payload);
  const signature = crypto
    .createHmac('sha256', config.jwt.accessSecret || 'development-oauth-state')
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
};

const verifyOAuthState = (state, provider) => {
  if (!state || !state.includes('.')) throw new ApiError(400, 'Invalid OAuth state');
  const [encodedPayload, signature] = state.split('.');
  const expected = crypto
    .createHmac('sha256', config.jwt.accessSecret || 'development-oauth-state')
    .update(encodedPayload)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new ApiError(400, 'Invalid OAuth state');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (payload.provider !== provider || Date.now() - payload.timestamp > OAUTH_STATE_MAX_AGE_MS) {
    throw new ApiError(400, 'Expired OAuth state');
  }
};

const redirectOAuthError = (res, message) => {
  const params = new URLSearchParams({ error: message });
  return res.redirect(`${config.clientUrl}/oauth/callback?${params.toString()}`);
};

const finalizeOAuthLogin = async (res, profile) => {
  const { provider, providerId, email, name, avatar } = profile;
  if (!email) throw new ApiError(400, `${provider} account did not provide an email`);

  const socialKey = `socialIds.${provider}`;
  let user = await User.findOne({ $or: [{ email }, { [socialKey]: providerId }] }).select('+refreshToken');

  if (!user) {
    user = await User.create({
      name,
      email,
      authProvider: provider,
      socialIds: { [provider]: providerId },
      avatar: avatar ? { url: avatar } : undefined,
      isVerified: true,
      lastLogin: new Date(),
    });
  } else {
    user.authProvider = user.authProvider === 'local' ? user.authProvider : provider;
    user.socialIds = { ...(user.socialIds?.toObject?.() || user.socialIds || {}), [provider]: providerId };
    user.isVerified = true;
    user.lastLogin = new Date();
    if (avatar && !user.avatar?.url) user.avatar = { url: avatar };
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
  const params = new URLSearchParams({
    accessToken,
    user: base64UrlEncode(JSON.stringify(safeUser)),
  });
  return res.redirect(`${config.clientUrl}/oauth/callback?${params.toString()}`);
};

const assertOAuthConfig = (provider) => {
  const oauth = config.oauth[provider];
  if (provider === 'google' && (!oauth.clientId || !oauth.clientSecret || !oauth.callbackUrl)) {
    throw new ApiError(500, 'Google OAuth is not configured');
  }
  if (provider === 'facebook' && (!oauth.appId || !oauth.appSecret || !oauth.callbackUrl)) {
    throw new ApiError(500, 'Facebook OAuth is not configured');
  }
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, 'Email already registered');

  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  try {
    await sendWelcomeEmail(user);
  } catch (error) {
    logger.warn(`Welcome email failed for ${user.email}: ${error.message}`);
  }

  sendSuccess(res, 201, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  }, 'Registration successful');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  if (!user.active) throw new ApiError(403, 'Account deactivated');

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  sendSuccess(res, 200, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    accessToken,
  }, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;
  if (!token) throw new ApiError(401, 'No refresh token');

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Invalid refresh token');

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, newRefreshToken);
  sendSuccess(res, 200, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    accessToken,
  }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  res.cookie('accessToken', 'loggedout', { maxAge: 10 });
  res.cookie('refreshToken', 'loggedout', { maxAge: 10 });
  sendSuccess(res, 200, null, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'No user with that email');

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  try {
    await sendPasswordResetEmail(user, resetUrl);
    sendSuccess(res, 200, null, 'Reset email sent');
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Email could not be sent');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Token is invalid or expired');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  setTokenCookies(res, accessToken, refreshToken);

  sendSuccess(res, 200, null, 'Password reset successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, user);
});

export const startGoogleOAuth = asyncHandler(async (_req, res) => {
  assertOAuthConfig('google');
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: createOAuthState('google'),
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

export const googleCallback = asyncHandler(async (req, res) => {
  try {
    assertOAuthConfig('google');
    verifyOAuthState(req.query.state, 'google');
    if (!req.query.code) throw new ApiError(400, 'Google authorization code missing');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: config.oauth.google.clientId,
        client_secret: config.oauth.google.clientSecret,
        redirect_uri: config.oauth.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new ApiError(400, tokenData.error_description || 'Google token exchange failed');

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileResponse.json();
    if (!profileResponse.ok) throw new ApiError(400, 'Google profile request failed');

    return finalizeOAuthLogin(res, {
      provider: 'google',
      providerId: profileData.sub,
      email: profileData.email,
      name: profileData.name || profileData.email?.split('@')[0],
      avatar: profileData.picture,
    });
  } catch (error) {
    logger.warn(`Google OAuth failed: ${error.message}`);
    return redirectOAuthError(res, error.message || 'Google sign-in failed');
  }
});

export const startFacebookOAuth = asyncHandler(async (_req, res) => {
  assertOAuthConfig('facebook');
  const params = new URLSearchParams({
    client_id: config.oauth.facebook.appId,
    redirect_uri: config.oauth.facebook.callbackUrl,
    response_type: 'code',
    scope: 'email,public_profile',
    state: createOAuthState('facebook'),
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
});

export const facebookCallback = asyncHandler(async (req, res) => {
  try {
    assertOAuthConfig('facebook');
    verifyOAuthState(req.query.state, 'facebook');
    if (!req.query.code) throw new ApiError(400, 'Facebook authorization code missing');

    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
      client_id: config.oauth.facebook.appId,
      client_secret: config.oauth.facebook.appSecret,
      redirect_uri: config.oauth.facebook.callbackUrl,
      code: req.query.code,
    }).toString()}`);
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new ApiError(400, tokenData.error?.message || 'Facebook token exchange failed');

    const profileResponse = await fetch(`https://graph.facebook.com/me?${new URLSearchParams({
      fields: 'id,name,email,picture.type(large)',
      access_token: tokenData.access_token,
    }).toString()}`);
    const profileData = await profileResponse.json();
    if (!profileResponse.ok) throw new ApiError(400, profileData.error?.message || 'Facebook profile request failed');

    return finalizeOAuthLogin(res, {
      provider: 'facebook',
      providerId: profileData.id,
      email: profileData.email,
      name: profileData.name || profileData.email?.split('@')[0],
      avatar: profileData.picture?.data?.url,
    });
  } catch (error) {
    logger.warn(`Facebook OAuth failed: ${error.message}`);
    return redirectOAuthError(res, error.message || 'Facebook sign-in failed');
  }
});
