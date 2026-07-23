import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface IChallanItem {
  id?: number;
  challanId?: number;
  productId: number;
  productName?: string;
  sku?: string;
  unitPrice?: number;
  quantity: number;
  lineTotal?: number;
}

export interface IChallan {
  id: number;
  challanNumber: string;
  customerId: number;
  customerName?: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  items?: IChallanItem[];
}

export interface CreateChallanDTO {
  customerId: number;
  status: ChallanStatus;
  products: { productId: number; quantity: number }[];
  createdBy: string;
}

export const initChallanTables = async (): Promise<void> => {
  const createChallansTable = `
    CREATE TABLE IF NOT EXISTS sales_challans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      challanNumber VARCHAR(50) NOT NULL UNIQUE,
      customerId INT NOT NULL,
      totalQuantity INT NOT NULL DEFAULT 0,
      totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      status ENUM('Draft', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Draft',
      createdBy VARCHAR(100) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
    );
  `;

  const createChallanItemsTable = `
    CREATE TABLE IF NOT EXISTS sales_challan_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      challanId INT NOT NULL,
      productId INT NOT NULL,
      productName VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL,
      unitPrice DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      lineTotal DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (challanId) REFERENCES sales_challans(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
    );
  `;

  await pool.query(createChallansTable);
  await pool.query(createChallanItemsTable);
};

export const generateChallanNumber = async (connection?: any): Promise<string> => {
  const executor = connection || pool;
  const [rows] = await executor.query('SELECT MAX(id) as maxId FROM sales_challans');
  const nextId = ((rows as any[])[0]?.maxId || 0) + 1;
  return `CH-${String(nextId).padStart(6, '0')}`;
};

export const createChallan = async (dto: CreateChallanDTO): Promise<IChallan> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify Customer
    const [cRows] = await connection.query<RowDataPacket[]>('SELECT customerName FROM customers WHERE id = ? AND isDeleted = 0', [dto.customerId]);
    if (cRows.length === 0) {
      throw new Error(`Customer with ID ${dto.customerId} not found`);
    }

    let totalQuantity = 0;
    let totalAmount = 0;
    const itemsToInsert: {
      productId: number;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    // Verify each product and calculate totals
    for (const item of dto.products) {
      const [pRows] = await connection.query<RowDataPacket[]>('SELECT id, productName, sku, unitPrice, currentStock FROM products WHERE id = ?', [item.productId]);
      if (pRows.length === 0) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const prod = pRows[0];
      const unitPrice = Number(prod.unitPrice);
      const lineTotal = unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      if (dto.status === 'Confirmed' && prod.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product '${prod.productName}'. Available: ${prod.currentStock}, Requested: ${item.quantity}`);
      }

      itemsToInsert.push({
        productId: prod.id,
        productName: prod.productName,
        sku: prod.sku,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const challanNumber = await generateChallanNumber(connection);

    // Insert Challan Header
    const insertChallanQuery = `
      INSERT INTO sales_challans (challanNumber, customerId, totalQuantity, totalAmount, status, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [cResult] = await connection.query<ResultSetHeader>(insertChallanQuery, [
      challanNumber,
      dto.customerId,
      totalQuantity,
      totalAmount,
      dto.status,
      dto.createdBy,
    ]);
    const challanId = cResult.insertId;

    // Insert Items and deduct stock if Confirmed
    for (const item of itemsToInsert) {
      const insertItemQuery = `
        INSERT INTO sales_challan_items (challanId, productId, productName, sku, unitPrice, quantity, lineTotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(insertItemQuery, [
        challanId,
        item.productId,
        item.productName,
        item.sku,
        item.unitPrice,
        item.quantity,
        item.lineTotal,
      ]);

      if (dto.status === 'Confirmed') {
        // Deduct Stock
        await connection.query('UPDATE products SET currentStock = currentStock - ? WHERE id = ?', [item.quantity, item.productId]);
        // Insert Stock Movement
        await connection.query(
          'INSERT INTO stock_movements (productId, quantityChanged, movementType, reason, createdBy) VALUES (?, ?, ?, ?, ?)',
          [item.productId, item.quantity, 'OUT', `Sales Challan ${challanNumber}`, dto.createdBy]
        );
      }
    }

    await connection.commit();
    return (await getChallanById(challanId))!;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllChallans = async (options?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['1=1'];
  const params: any[] = [];

  if (options?.search) {
    conditions.push('(sc.challanNumber LIKE ? OR c.customerName LIKE ?)');
    const term = `%${options.search}%`;
    params.push(term, term);
  }

  if (options?.status) {
    conditions.push('sc.status = ?');
    params.push(options.status);
  }

  const whereClause = conditions.join(' AND ');
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM sales_challans sc 
    JOIN customers c ON sc.customerId = c.id 
    WHERE ${whereClause}
  `;
  const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
  const total = countRows[0].total;

  const dataQuery = `
    SELECT 
      sc.id,
      sc.challanNumber,
      sc.customerId,
      c.customerName,
      sc.totalQuantity,
      sc.totalAmount,
      sc.status,
      sc.createdBy,
      sc.createdAt,
      sc.updatedAt
    FROM sales_challans sc
    JOIN customers c ON sc.customerId = c.id
    WHERE ${whereClause}
    ORDER BY sc.id DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

  // Cast decimal totalAmount to Number
  const formattedRows = rows.map((r: any) => ({
    ...r,
    totalAmount: Number(r.totalAmount || 0),
  }));

  return {
    data: formattedRows as IChallan[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getChallanById = async (id: number): Promise<IChallan | null> => {
  const queryChallan = `
    SELECT 
      sc.id,
      sc.challanNumber,
      sc.customerId,
      c.customerName,
      sc.totalQuantity,
      sc.totalAmount,
      sc.status,
      sc.createdBy,
      sc.createdAt,
      sc.updatedAt
    FROM sales_challans sc
    JOIN customers c ON sc.customerId = c.id
    WHERE sc.id = ?
  `;
  const [rows] = await pool.query<RowDataPacket[]>(queryChallan, [id]);
  if (rows.length === 0) return null;

  const challan = rows[0] as any;
  challan.totalAmount = Number(challan.totalAmount || 0);

  const queryItems = 'SELECT * FROM sales_challan_items WHERE challanId = ?';
  const [items] = await pool.query<RowDataPacket[]>(queryItems, [id]);

  challan.items = (items as any[]).map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice || 0),
    lineTotal: Number(item.lineTotal || 0),
  }));

  return challan as IChallan;
};

export const confirmChallan = async (id: number, confirmedBy: string): Promise<IChallan> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM sales_challans WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) {
      throw new Error(`Sales Challan with ID ${id} not found`);
    }
    const challan = rows[0];

    if (challan.status !== 'Draft') {
      throw new Error(`Cannot confirm challan with status '${challan.status}'. Only Draft challans can be confirmed.`);
    }

    const [items] = await connection.query<RowDataPacket[]>('SELECT * FROM sales_challan_items WHERE challanId = ?', [id]);

    // Check stock & deduct stock for all items
    for (const item of items) {
      const [pRows] = await connection.query<RowDataPacket[]>('SELECT currentStock, productName FROM products WHERE id = ? FOR UPDATE', [item.productId]);
      if (pRows.length === 0) {
        throw new Error(`Product ID ${item.productId} no longer exists`);
      }
      const prod = pRows[0];
      if (prod.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product '${prod.productName}'. Available: ${prod.currentStock}, Required: ${item.quantity}`);
      }

      await connection.query('UPDATE products SET currentStock = currentStock - ? WHERE id = ?', [item.quantity, item.productId]);
      await connection.query(
        'INSERT INTO stock_movements (productId, quantityChanged, movementType, reason, createdBy) VALUES (?, ?, ?, ?, ?)',
        [item.productId, item.quantity, 'OUT', `Confirmed Sales Challan ${challan.challanNumber}`, confirmedBy]
      );
    }

    await connection.query("UPDATE sales_challans SET status = 'Confirmed' WHERE id = ?", [id]);
    await connection.commit();

    return (await getChallanById(id))!;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const cancelChallan = async (id: number, cancelledBy: string): Promise<IChallan> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM sales_challans WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) {
      throw new Error(`Sales Challan with ID ${id} not found`);
    }
    const challan = rows[0];

    if (challan.status === 'Cancelled') {
      throw new Error('Challan is already cancelled');
    }

    const previousStatus = challan.status;

    // If previous status was Confirmed, restore stock
    if (previousStatus === 'Confirmed') {
      const [items] = await connection.query<RowDataPacket[]>('SELECT * FROM sales_challan_items WHERE challanId = ?', [id]);
      for (const item of items) {
        await connection.query('UPDATE products SET currentStock = currentStock + ? WHERE id = ?', [item.quantity, item.productId]);
        await connection.query(
          'INSERT INTO stock_movements (productId, quantityChanged, movementType, reason, createdBy) VALUES (?, ?, ?, ?, ?)',
          [item.productId, item.quantity, 'IN', `Cancelled Sales Challan ${challan.challanNumber}`, cancelledBy]
        );
      }
    }

    await connection.query("UPDATE sales_challans SET status = 'Cancelled' WHERE id = ?", [id]);
    await connection.commit();

    return (await getChallanById(id))!;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
