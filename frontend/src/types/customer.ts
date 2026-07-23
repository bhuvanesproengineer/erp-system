export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface Customer {
  id: number;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFollowup {
  id: number;
  customerId: number;
  note: string;
  followUpDate?: string | null;
  createdAt?: string;
}

export interface CustomerDetailsResponse extends Customer {
  followups: CustomerFollowup[];
}
