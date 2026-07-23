import * as CustomerModel from '../models/Customer';
import { ICustomer } from '../models/Customer';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const createCustomer = async (data: Partial<ICustomer>) => {
  if (!data.customerName || data.customerName.trim() === '') {
    throw new ValidationError('Customer name is required');
  }
  if (!data.mobileNumber || data.mobileNumber.trim() === '') {
    throw new ValidationError('Mobile number is required');
  }
  if (!data.email || data.email.trim() === '') {
    throw new ValidationError('Email address is required');
  }
  if (!data.businessName || data.businessName.trim() === '') {
    throw new ValidationError('Business name is required');
  }
  if (!data.address || data.address.trim() === '') {
    throw new ValidationError('Address is required');
  }

  // Sanitize empty strings to null for optional date/text fields
  const cleanData: Partial<ICustomer> = {
    ...data,
    customerName: data.customerName.trim(),
    mobileNumber: data.mobileNumber.trim(),
    email: data.email.trim(),
    businessName: data.businessName.trim(),
    gstNumber: data.gstNumber && data.gstNumber.trim() ? data.gstNumber.trim() : null,
    address: data.address.trim(),
    followUpDate: data.followUpDate && data.followUpDate.trim() ? data.followUpDate.trim() : null,
    notes: data.notes && data.notes.trim() ? data.notes.trim() : null,
  };

  return await CustomerModel.createCustomer(cleanData);
};

export const getAllCustomers = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return await CustomerModel.getAllCustomers(options);
};

export const getCustomerById = async (id: number) => {
  const customer = await CustomerModel.getCustomerById(id);
  if (!customer) {
    throw new NotFoundError(`Customer with ID ${id} not found`);
  }
  return customer;
};

export const getCustomerDetails = async (id: number) => {
  const details = await CustomerModel.getCustomerDetails(id);
  if (!details) {
    throw new NotFoundError(`Customer with ID ${id} not found`);
  }
  return details;
};

export const updateCustomer = async (id: number, data: Partial<ICustomer>) => {
  const existing = await CustomerModel.getCustomerById(id);
  if (!existing) {
    throw new NotFoundError(`Customer with ID ${id} not found`);
  }

  if (data.customerName !== undefined && data.customerName.trim() === '') {
    throw new ValidationError('Customer name cannot be empty');
  }
  if (data.mobileNumber !== undefined && data.mobileNumber.trim() === '') {
    throw new ValidationError('Mobile number cannot be empty');
  }
  if (data.email !== undefined && data.email.trim() === '') {
    throw new ValidationError('Email address cannot be empty');
  }
  if (data.businessName !== undefined && data.businessName.trim() === '') {
    throw new ValidationError('Business name cannot be empty');
  }
  if (data.address !== undefined && data.address.trim() === '') {
    throw new ValidationError('Address cannot be empty');
  }

  const cleanData: Partial<ICustomer> = {
    ...data,
  };
  if (data.customerName) cleanData.customerName = data.customerName.trim();
  if (data.mobileNumber) cleanData.mobileNumber = data.mobileNumber.trim();
  if (data.email) cleanData.email = data.email.trim();
  if (data.businessName) cleanData.businessName = data.businessName.trim();
  if (data.address) cleanData.address = data.address.trim();
  if (data.gstNumber !== undefined) cleanData.gstNumber = data.gstNumber && data.gstNumber.trim() ? data.gstNumber.trim() : null;
  if (data.followUpDate !== undefined) cleanData.followUpDate = data.followUpDate && data.followUpDate.trim() ? data.followUpDate.trim() : null;
  if (data.notes !== undefined) cleanData.notes = data.notes && data.notes.trim() ? data.notes.trim() : null;

  return await CustomerModel.updateCustomer(id, cleanData);
};

export const deleteCustomer = async (id: number) => {
  const existing = await CustomerModel.getCustomerById(id);
  if (!existing) {
    throw new NotFoundError(`Customer with ID ${id} not found`);
  }
  return await CustomerModel.softDeleteCustomer(id);
};

export const addCustomerFollowup = async (
  customerId: number,
  dto: { note: string; followUpDate?: string }
) => {
  const existing = await CustomerModel.getCustomerById(customerId);
  if (!existing) {
    throw new NotFoundError(`Customer with ID ${customerId} not found`);
  }
  if (!dto.note || dto.note.trim() === '') {
    throw new ValidationError('Follow-up note cannot be empty');
  }

  const cleanFollowUpDate = dto.followUpDate && dto.followUpDate.trim() ? dto.followUpDate.trim() : undefined;
  return await CustomerModel.addCustomerFollowup(customerId, dto.note.trim(), cleanFollowUpDate);
};

export const searchCustomers = async (keyword: string) => {
  return await CustomerModel.getAllCustomers({ search: keyword });
};
