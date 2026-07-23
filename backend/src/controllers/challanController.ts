import { Request, Response } from 'express';
import * as challanService from '../services/challanService';
import { AuthenticatedRequest } from '../types';

const handleError = (res: Response, error: any) => {
  if (error instanceof challanService.ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error instanceof challanService.NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
  console.error('ChallanController Error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

export const createChallan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const createdBy = req.user?.email || 'System';
    const challan = await challanService.createChallan(req.body, createdBy);
    res.status(201).json({
      success: true,
      message: 'Sales Challan created successfully',
      data: challan,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const status = (req.query.status as string) || '';

    const result = await challanService.getAllChallans({ page, limit, search, status });
    res.status(200).json({
      success: true,
      message: 'Sales Challans retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const searchChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = (req.query.q as string) || (req.query.search as string) || '';
    const result = await challanService.searchChallans(keyword);
    res.status(200).json({
      success: true,
      message: 'Sales Challans search completed successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid challan ID' });
      return;
    }
    const challan = await challanService.getChallanById(id);
    res.status(200).json({
      success: true,
      message: 'Sales Challan retrieved successfully',
      data: challan,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const confirmChallan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid challan ID' });
      return;
    }
    const confirmedBy = req.user?.email || 'System';
    const challan = await challanService.confirmChallan(id, confirmedBy);
    res.status(200).json({
      success: true,
      message: 'Sales Challan confirmed successfully',
      data: challan,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const cancelChallan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid challan ID' });
      return;
    }
    const cancelledBy = req.user?.email || 'System';
    const challan = await challanService.cancelChallan(id, cancelledBy);
    res.status(200).json({
      success: true,
      message: 'Sales Challan cancelled successfully',
      data: challan,
    });
  } catch (error) {
    handleError(res, error);
  }
};
