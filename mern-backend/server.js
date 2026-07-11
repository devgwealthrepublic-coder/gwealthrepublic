require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const cron         = require('node-cron');
const connectDB    = require('./config/db');
const { retrySyncPendingProperties } = require('./utils/wpSync');
const Property     = require('./models/Property');

// ---- Connect to MongoDB ----------------------------------------
connectDB();

const app = express();

// ---- Core Middleware -------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- CORS Configuration ----------------------------------------
// Allows requests from WordPress frontend + MERN React portal
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin "${origin}" not allowed.`));
      }
    },
    credentials: true, // Allow cookies to be sent cross-origin
  })
);

// ---- API Routes ------------------------------------------------
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/excursions', require('./routes/excursions'));
app.use('/api/assets',     require('./routes/assets'));
app.use('/api',            require('./routes/messages')); // handles /api/contact and /api/messages
app.use('/api',            require('./routes/subscribers')); // handles /api/subscribers
app.use('/api/visitors',   require('./routes/visitors'));

// ---- Health Check ----------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status:      'ok',
    service:     'GWealth Nation Portal API',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ---- Global Error Handler --------------------------------------
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ---- Cron Job: Retry Failed WordPress Syncs -------------------
// Runs every 30 minutes — prd.md Section 8 Fail-Safe Queue
cron.schedule('*/30 * * * *', async () => {
  console.log('🔄 Cron: Checking for pending WordPress sync jobs...');
  await retrySyncPendingProperties(Property);
});

// ---- Start Server ----------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 GWealth Nation Portal API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   WP Endpoint : ${process.env.WP_BASE_URL}/wp-json/wp/v2/properties`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});
