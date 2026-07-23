import { Request, Response } from 'express';
import * as productService from '../services/productService';
import { AuthenticatedRequest } from '../types';

const handleError = (res: Response, error: any) => {
  if (error instanceof productService.ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error instanceof productService.NotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
  if (error instanceof productService.ConflictError) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }
  console.error('ProductController Error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const category = (req.query.category as string) || '';

    const result = await productService.getAllProducts({ page, limit, search, category });
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = (req.query.q as string) || (req.query.search as string) || '';
    const products = await productService.searchProducts(keyword);
    res.status(200).json({
      success: true,
      message: 'Products search completed successfully',
      data: Array.isArray(products) ? products : (products as any).data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getLowStockProducts();
    res.status(200).json({
      success: true,
      message: 'Low stock products retrieved successfully',
      data: products,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    const product = await productService.getProductById(id);
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    await productService.deleteProduct(id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const addStockMovement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    
    const createdBy = req.body.createdBy || req.user?.email || 'System';
    const movement = await productService.addStockMovement(id, {
      ...req.body,
      createdBy,
    });

    res.status(200).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: movement,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    const movements = await productService.getStockMovements(id);
    res.status(200).json({
      success: true,
      message: 'Stock movements retrieved successfully',
      data: movements,
    });
  } catch (error) {
    handleError(res, error);
  }
};
