import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface IProduct {
  id: number;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
}

export interface UpdateProductDTO {
  productName?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  currentStock?: number;
  minimumStockAlertQuantity?: number;
  warehouseLocation?: string;
}

const formatProductRow = (row: any): IProduct => ({
  ...row,
  unitPrice: Number(row.unitPrice || 0),
});

export const initProductTables = async (): Promise<void> => {
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productName VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      unitPrice DECIMAL(10, 2) NOT NULL,
      currentStock INT NOT NULL DEFAULT 0,
      minimumStockAlertQuantity INT NOT NULL DEFAULT 0,
      warehouseLocation VARCHAR(255) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createStockMovementsTable = `
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      quantityChanged INT NOT NULL,
      movementType ENUM('IN', 'OUT') NOT NULL,
      reason VARCHAR(255) NOT NULL,
      createdBy VARCHAR(100) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `;

  await pool.query(createProductsTable);
  await pool.query(createStockMovementsTable);
};

export const createProduct = async (data: CreateProductDTO): Promise<IProduct> => {
  const query = `
    INSERT INTO products 
    (productName, sku, category, unitPrice, currentStock, minimumStockAlertQuantity, warehouseLocation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.productName,
    data.sku,
    data.category,
    data.unitPrice,
    data.currentStock,
    data.minimumStockAlertQuantity,
    data.warehouseLocation,
  ];

  const [result] = await pool.query<ResultSetHeader>(query, values);
  const inserted = await getProductById(result.insertId);
  if (!inserted) {
    throw new Error('Failed to retrieve product after insertion');
  }
  return inserted;
};

export const getAllProducts = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['1=1'];
  const params: any[] = [];

  if (options?.search) {
    conditions.push('(productName LIKE ? OR sku LIKE ? OR category LIKE ?)');
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  if (options?.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }

  const whereClause = conditions.join(' AND ');
  const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
  const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
  const total = countRows[0].total;

  const dataQuery = `SELECT * FROM products WHERE ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
  const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

  return {
    data: rows.map(formatProductRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getProductById = async (id: number): Promise<IProduct | null> => {
  const query = 'SELECT * FROM products WHERE id = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
  if (rows.length === 0) return null;
  return formatProductRow(rows[0]);
};

export const getProductBySKU = async (sku: string): Promise<IProduct | null> => {
  const query = 'SELECT * FROM products WHERE sku = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [sku]);
  if (rows.length === 0) return null;
  return formatProductRow(rows[0]);
};

export const updateProduct = async (id: number, data: UpdateProductDTO): Promise<IProduct | null> => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.productName !== undefined) {
    fields.push('productName = ?');
    values.push(data.productName);
  }
  if (data.sku !== undefined) {
    fields.push('sku = ?');
    values.push(data.sku);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    values.push(data.category);
  }
  if (data.unitPrice !== undefined) {
    fields.push('unitPrice = ?');
    values.push(data.unitPrice);
  }
  if (data.currentStock !== undefined) {
    fields.push('currentStock = ?');
    values.push(data.currentStock);
  }
  if (data.minimumStockAlertQuantity !== undefined) {
    fields.push('minimumStockAlertQuantity = ?');
    values.push(data.minimumStockAlertQuantity);
  }
  if (data.warehouseLocation !== undefined) {
    fields.push('warehouseLocation = ?');
    values.push(data.warehouseLocation);
  }

  if (fields.length === 0) {
    return getProductById(id);
  }

  values.push(id);
  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query(query, values);
  return getProductById(id);
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM products WHERE id = ?';
  const [result] = await pool.query<ResultSetHeader>(query, [id]);
  return result.affectedRows > 0;
};

export const searchProducts = async (keyword: string): Promise<IProduct[]> => {
  const query = `
    SELECT * FROM products 
    WHERE productName LIKE ? OR sku LIKE ? OR category LIKE ?
    ORDER BY id DESC
  `;
  const searchTerm = `%${keyword}%`;
  const [rows] = await pool.query<RowDataPacket[]>(query, [searchTerm, searchTerm, searchTerm]);
  return rows.map(formatProductRow);
};

export const getLowStockProducts = async (): Promise<IProduct[]> => {
  const query = 'SELECT * FROM products WHERE currentStock <= minimumStockAlertQuantity ORDER BY currentStock ASC';
  const [rows] = await pool.query<RowDataPacket[]>(query);
  return rows.map(formatProductRow);
};
