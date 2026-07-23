import dotenv from 'dotenv';
import app from './app';
import pool from './config/db';
import { initUserTable } from './models/User';
import { initProductTables } from './models/Product';
import { initCRMTables } from './models/Customer';
import { initChallanTables } from './models/Challan';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test the database connection pool
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected');
    connection.release();

    // Initialize database tables for all modules
    await initUserTable();
    await initProductTables();
    await initCRMTables();
    await initChallanTables();
    console.log('✅ All Database tables initialized & admin user seeded');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection/initialization failed:', error);
    process.exit(1);
  }
}

startServer();