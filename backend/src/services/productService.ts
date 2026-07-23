import * as ProductModel from '../models/Product';
import * as StockMovementModel from '../models/StockMovement';
import pool from '../config/db';

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

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

export const createProduct = async (data: ProductModel.CreateProductDTO) => {
  // Field Validation
  if (!data.productName || data.productName.trim() === '') {
    throw new ValidationError('Product name is required');
  }
  if (!data.sku || data.sku.trim() === '') {
    throw new ValidationError('SKU is required');
  }
  if (!data.category || data.category.trim() === '') {
    throw new ValidationError('Category is required');
  }
  if (data.unitPrice === undefined || data.unitPrice <= 0) {
    throw new ValidationError('Unit price must be greater than 0');
  }
  if (data.currentStock === undefined || data.currentStock < 0) {
    throw new ValidationError('Current stock must be greater than or equal to 0');
  }
  if (data.minimumStockAlertQuantity === undefined || data.minimumStockAlertQuantity < 0) {
    throw new ValidationError('Minimum stock alert quantity must be greater than or equal to 0');
  }
  if (!data.warehouseLocation || data.warehouseLocation.trim() === '') {
    throw new ValidationError('Warehouse location is required');
  }

  // Check unique SKU
  const existingSku = await ProductModel.getProductBySKU(data.sku.trim());
  if (existingSku) {
    throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
  }

  return await ProductModel.createProduct({
    ...data,
    productName: data.productName.trim(),
    sku: data.sku.trim(),
    category: data.category.trim(),
    warehouseLocation: data.warehouseLocation.trim(),
  });
};

export const getAllProducts = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => {
  return await ProductModel.getAllProducts(options);
};

export const getProductById = async (id: number) => {
  const product = await ProductModel.getProductById(id);
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  return product;
};

export const updateProduct = async (id: number, data: ProductModel.UpdateProductDTO) => {
  const existingProduct = await ProductModel.getProductById(id);
  if (!existingProduct) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }

  if (data.productName !== undefined && data.productName.trim() === '') {
    throw new ValidationError('Product name cannot be empty');
  }
  if (data.sku !== undefined && data.sku.trim() === '') {
    throw new ValidationError('SKU cannot be empty');
  }
  if (data.category !== undefined && data.category.trim() === '') {
    throw new ValidationError('Category cannot be empty');
  }
  if (data.unitPrice !== undefined && data.unitPrice <= 0) {
    throw new ValidationError('Unit price must be greater than 0');
  }
  if (data.currentStock !== undefined && data.currentStock < 0) {
    throw new ValidationError('Current stock must be greater than or equal to 0');
  }
  if (data.minimumStockAlertQuantity !== undefined && data.minimumStockAlertQuantity < 0) {
    throw new ValidationError('Minimum stock alert quantity must be greater than or equal to 0');
  }
  if (data.warehouseLocation !== undefined && data.warehouseLocation.trim() === '') {
    throw new ValidationError('Warehouse location cannot be empty');
  }

  if (data.sku && data.sku.trim() !== existingProduct.sku) {
    const skuOwner = await ProductModel.getProductBySKU(data.sku.trim());
    if (skuOwner && skuOwner.id !== id) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
    }
  }

  return await ProductModel.updateProduct(id, data);
};

export const deleteProduct = async (id: number) => {
  const existingProduct = await ProductModel.getProductById(id);
  if (!existingProduct) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  return await ProductModel.deleteProduct(id);
};

export const searchProducts = async (keyword: string) => {
  if (!keyword || keyword.trim() === '') {
    return await ProductModel.getAllProducts();
  }
  return await ProductModel.searchProducts(keyword.trim());
};

export const getLowStockProducts = async () => {
  return await ProductModel.getLowStockProducts();
};

export const addStockMovement = async (
  productId: number,
  dto: {
    quantityChanged: number;
    movementType: 'IN' | 'OUT';
    reason: string;
    createdBy: string;
  }
) => {
  if (!dto.quantityChanged || dto.quantityChanged <= 0) {
    throw new ValidationError('Quantity changed must be greater than 0');
  }
  if (!['IN', 'OUT'].includes(dto.movementType)) {
    throw new ValidationError("Movement type must be 'IN' or 'OUT'");
  }
  if (!dto.reason || dto.reason.trim() === '') {
    throw new ValidationError('Reason is required');
  }
  if (!dto.createdBy || dto.createdBy.trim() === '') {
    throw new ValidationError('Created by is required');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock row for update
    const [rows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if ((rows as any[]).length === 0) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    const product = (rows as any[])[0];
    let newStock = product.currentStock;

    if (dto.movementType === 'IN') {
      newStock += dto.quantityChanged;
    } else {
      if (product.currentStock < dto.quantityChanged) {
        throw new ValidationError(`Insufficient stock. Current stock is ${product.currentStock}, cannot reduce by ${dto.quantityChanged}`);
      }
      newStock -= dto.quantityChanged;
    }

    // Update stock in products table
    await connection.query('UPDATE products SET currentStock = ? WHERE id = ?', [newStock, productId]);

    // Record stock movement
    await StockMovementModel.createStockMovement(
      {
        productId,
        quantityChanged: dto.quantityChanged,
        movementType: dto.movementType,
        reason: dto.reason.trim(),
        createdBy: dto.createdBy.trim(),
      },
      connection
    );

    await connection.commit();

    const updatedProduct = await ProductModel.getProductById(productId);
    return {
      product: updatedProduct,
      movement: {
        productId,
        quantityChanged: dto.quantityChanged,
        movementType: dto.movementType,
        reason: dto.reason.trim(),
        createdBy: dto.createdBy.trim(),
        newStock,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getStockMovements = async (productId: number) => {
  const product = await ProductModel.getProductById(productId);
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }
  return await StockMovementModel.getMovementsByProductId(productId);
};
