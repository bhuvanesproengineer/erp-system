import { Request } from 'express';
import { TokenPayload } from '../utils/jwt';

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
