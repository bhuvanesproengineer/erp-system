import { Request, Response } from 'express';
import * as customerService from '../services/customerService';
import { AuthenticatedRequest } from '../types';

const handleError = (res: Response, error: any) => {
  if (error instanceof customerService.ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error instanceof customerService.NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
  console.error('CustomerController Error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const status = (req.query.status as string) || '';

    const result = await customerService.getAllCustomers({ page, limit, search, status });
    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const searchCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = (req.query.q as string) || (req.query.search as string) || '';
    const result = await customerService.searchCustomers(keyword);
    res.status(200).json({
      success: true,
      message: 'Customer search completed successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid customer ID' });
      return;
    }
    const customer = await customerService.getCustomerById(id);
    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: customer,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid customer ID' });
      return;
    }
    const details = await customerService.getCustomerDetails(id);
    res.status(200).json({
      success: true,
      message: 'Customer details retrieved successfully',
      data: details,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid customer ID' });
      return;
    }
    const updated = await customerService.updateCustomer(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updated,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid customer ID' });
      return;
    }
    await customerService.deleteCustomer(id);
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: null,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const addFollowup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid customer ID' });
      return;
    }
    const followup = await customerService.addCustomerFollowup(id, req.body);
    res.status(201).json({
      success: true,
      message: 'Follow-up note added successfully',
      data: followup,
    });
  } catch (error) {
    handleError(res, error);
  }
};
