import bcrypt from 'bcrypt';
import pool from '../config/db';
import { generateToken, TokenPayload } from '../utils/jwt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: UserRegistrationData) => {
  const { username, email, password, role = 'user' } = data;

  // Check if user already exists
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role]
  );

  const userId = result.insertId;
  const token = generateToken({ userId, email, role });

  return {
    user: { id: userId, username, email, role },
    token,
  };
};

export const loginUser = async (data: UserLoginData) => {
  // Step 1: Receive email & password
  const { email, password } = data;

  // Step 2: Find user by email
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  // Step 3: User exists? No -> Throw Error
  if (rows.length === 0) {
    throw new Error('User not found');
  }

  const user = rows[0] as RowDataPacket;

  // Step 4: bcrypt.compare()
  const isMatch = await bcrypt.compare(password, user.password);

  // Step 5: Password Correct? No -> Throw Error
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  // Step 6: Generate JWT
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  // Step 7: Return token + user
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserById = async (userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  return rows[0];
};
