import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import challanRoutes from './routes/challanRoutes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Active Status Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'active',
    message: 'MiniERP Backend API Service is running',
    timestamp: new Date().toISOString(),
  });
});

// Health Checks
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'active',
    message: 'Server is healthy and active',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'active',
    message: 'MiniERP API v1 Root Endpoint',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      customers: '/api/customers',
      challans: '/api/challans',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'active',
    message: 'API Service is healthy and active',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/challans', challanRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
