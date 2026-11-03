import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './seed/seedData.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import survivalRoutes from './routes/survivalRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for evidence images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check & API root
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'VanaTrack — Environmental Impact Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demoCredentials: {
      admin: { email: 'admin@vanatrack.org', password: 'Admin@123', role: 'admin' },
      manager: { email: 'manager@vanatrack.org', password: 'Manager@123', role: 'project_manager' },
      viewer: { email: 'viewer@vanatrack.org', password: 'Viewer@123', role: 'viewer' },
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/survival', survivalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/audit', auditRoutes);

// Serve static frontend build if client/dist exists (Production / Unified server mode)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌿 Database is empty. Auto-seeding initial benchmark projects & test scenario...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 VanaTrack REST API Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error);
    process.exit(1);
  }
};

startServer();
