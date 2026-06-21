import app from './app.js';
import { connectDB } from './config/db.js';
import { config, validateEnv } from './config/index.js';
import { logger } from './utils/logger.js';
import './jobs/cron.js';

const PORT = config.port;

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  process.exit(1);
});

startServer();
