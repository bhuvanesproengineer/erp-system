export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts' | 'user';

export interface User {
  id: number;
  username?: string;
  name?: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
