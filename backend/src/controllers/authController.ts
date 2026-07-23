import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required.' });
      return;
    }

    const result = await authService.registerUser({ username, email, password, role });
    res.status(201).json({ message: 'User registered successfully', ...result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const result = await authService.loginUser({ email, password });
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Authentication failed' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await authService.getUserById(req.user.userId);
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'User not found' });
  }
};
