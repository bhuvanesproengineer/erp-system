import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. User context missing.',
      });
      return;
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Access denied for your role.',
      });
      return;
    }

    next();
  };
};
