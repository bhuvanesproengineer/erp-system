import pool from '../config/db';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export const initUserTable = async (): Promise<void> => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Sales', 'Warehouse', 'Accounts') NOT NULL DEFAULT 'Sales',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createUsersTable);
  await seedDefaultUsers();
};

export const seedDefaultUsers = async (): Promise<void> => {
  try {
    const defaultUsers = [
      { name: 'System Admin', email: 'admin@minierp.com', role: 'Admin' as UserRole },
      { name: 'Sales Representative', email: 'sales@minierp.com', role: 'Sales' as UserRole },
      { name: 'Warehouse Manager', email: 'warehouse@minierp.com', role: 'Warehouse' as UserRole },
      { name: 'Accounts Officer', email: 'accounts@minierp.com', role: 'Accounts' as UserRole },
    ];

    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const user of defaultUsers) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [user.email]);
      if (rows.length === 0) {
        await pool.query<ResultSetHeader>(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role]
        );
        console.log(`✅ Default ${user.role} user seeded: ${user.email} / password123`);
      }
    }
  } catch (error) {
    console.error('Error seeding default users:', error);
  }
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [email]);
  if (rows.length === 0) return null;
  return rows[0] as IUser;
};

export const findUserById = async (id: number): Promise<IUser | null> => {
  const query = 'SELECT id, name, email, role, createdAt FROM users WHERE id = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
  if (rows.length === 0) return null;
  return rows[0] as IUser;
};
