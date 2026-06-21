import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { specs, swaggerUi } from './docs/swagger.js';
import apiRoutes from './routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- SECURITY ---------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(mongoSanitize());
app.use(hpp());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

/* ---------------- STRIPE WEBHOOK ---------------- */
app.use(
  '/api/v1/payment/webhook',
  express.raw({ type: 'application/json' })
);

/* ---------------- BODY PARSER ---------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/* ---------------- COMPRESSION + LOGGING ---------------- */
app.use(compression());

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

/* ---------------- RATE LIMIT ---------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.',
});

app.use('/api', limiter);

/* ---------------- HEALTH CHECK ---------------- */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- SWAGGER ---------------- */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/* ---------------- STATIC UPLOADS ---------------- */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* ---------------- API ROUTES ---------------- */
app.use('/api/v1', apiRoutes);

/* ---------------- 404 HANDLER ---------------- */
app.use(notFound);

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

export default app;
