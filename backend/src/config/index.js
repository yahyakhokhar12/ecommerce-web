import dotenv from 'dotenv';
dotenv.config();

const requiredByEnv = {
  production: ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'],
  development: ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'],
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
  },

  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
    },
  },
};

export const validateEnv = () => {
  if (config.env === 'test') return;

  const required = requiredByEnv[config.env] || requiredByEnv.development;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.env === 'production') {
    const weakSecrets = [
      ['JWT_ACCESS_SECRET', config.jwt.accessSecret],
      ['JWT_REFRESH_SECRET', config.jwt.refreshSecret],
    ].filter(([, value]) => value && value.length < 32);

    if (weakSecrets.length) {
      throw new Error(`JWT secrets must be at least 32 characters in production: ${weakSecrets.map(([key]) => key).join(', ')}`);
    }
  }
};
