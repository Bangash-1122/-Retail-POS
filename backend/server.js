import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './src/data/dbStore.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import settingRoutes from './src/routes/settingRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Retail POS API', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Retail POS Backend running on port ${PORT}`);
    console.log(` http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}).catch(err => {
  console.error("Failed to initialize server:", err);
});
