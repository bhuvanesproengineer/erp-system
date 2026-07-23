import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CustomerType, CustomerStatus } from '../types';

export interface ICustomer {
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
  isDeleted?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const initCRMTables = async (): Promise<void> => {
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customerName VARCHAR(255) NOT NULL,
      mobileNumber VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      businessName VARCHAR(255) NOT NULL,
      gstNumber VARCHAR(50) NULL,
      customerType ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL DEFAULT 'Retail',
      address TEXT NOT NULL,
      status ENUM('Lead', 'Active', 'Inactive') NOT NULL DEFAULT 'Lead',
      followUpDate DATE NULL,
      notes TEXT NULL,
      isDeleted TINYINT(1) NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createFollowupsTable = `
    CREATE TABLE IF NOT EXISTS customer_followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customerId INT NOT NULL,
      note TEXT NOT NULL,
      followUpDate DATE NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
    );
  `;

  await pool.query(createCustomersTable);
  await pool.query(createFollowupsTable);
};

export const createCustomer = async (data: Partial<ICustomer>): Promise<ICustomer> => {
  const query = `
    INSERT INTO customers 
    (customerName, mobileNumber, email, businessName, gstNumber, customerType, address, status, followUpDate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.customerName,
    data.mobileNumber,
    data.email,
    data.businessName,
    data.gstNumber || null,
    data.customerType || 'Retail',
    data.address,
    data.status || 'Lead',
    data.followUpDate || null,
    data.notes || null,
  ];

  const [result] = await pool.query<ResultSetHeader>(query, values);
  const inserted = await getCustomerById(result.insertId);
  return inserted!;
};

export const getAllCustomers = async (options?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['isDeleted = 0'];
  const params: any[] = [];

  if (options?.search) {
    conditions.push('(customerName LIKE ? OR mobileNumber LIKE ? OR businessName LIKE ? OR email LIKE ?)');
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }

  if (options?.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  const whereClause = conditions.join(' AND ');
  const countQuery = `SELECT COUNT(*) as total FROM customers WHERE ${whereClause}`;
  const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
  const total = countRows[0].total;

  const dataQuery = `SELECT * FROM customers WHERE ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
  const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

  return {
    data: rows as ICustomer[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCustomerById = async (id: number): Promise<ICustomer | null> => {
  const query = 'SELECT * FROM customers WHERE id = ? AND isDeleted = 0';
  const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
  if (rows.length === 0) return null;
  return rows[0] as ICustomer;
};

export const updateCustomer = async (id: number, data: Partial<ICustomer>): Promise<ICustomer | null> => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.customerName !== undefined) { fields.push('customerName = ?'); values.push(data.customerName); }
  if (data.mobileNumber !== undefined) { fields.push('mobileNumber = ?'); values.push(data.mobileNumber); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.businessName !== undefined) { fields.push('businessName = ?'); values.push(data.businessName); }
  if (data.gstNumber !== undefined) { fields.push('gstNumber = ?'); values.push(data.gstNumber); }
  if (data.customerType !== undefined) { fields.push('customerType = ?'); values.push(data.customerType); }
  if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.followUpDate !== undefined) { fields.push('followUpDate = ?'); values.push(data.followUpDate || null); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes || null); }

  if (fields.length === 0) return getCustomerById(id);

  values.push(id);
  const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ? AND isDeleted = 0`;
  await pool.query(query, values);
  return getCustomerById(id);
};

export const softDeleteCustomer = async (id: number): Promise<boolean> => {
  const query = 'UPDATE customers SET isDeleted = 1 WHERE id = ?';
  const [result] = await pool.query<ResultSetHeader>(query, [id]);
  return result.affectedRows > 0;
};

export const getCustomerDetails = async (id: number) => {
  const customer = await getCustomerById(id);
  if (!customer) return null;

  const queryFollowups = 'SELECT * FROM customer_followups WHERE customerId = ? ORDER BY id DESC';
  const [followups] = await pool.query<RowDataPacket[]>(queryFollowups, [id]);

  return {
    ...customer,
    followups: followups || [],
  };
};

export const addCustomerFollowup = async (customerId: number, note: string, followUpDate?: string) => {
  const query = 'INSERT INTO customer_followups (customerId, note, followUpDate) VALUES (?, ?, ?)';
  const [result] = await pool.query<ResultSetHeader>(query, [customerId, note, followUpDate || null]);

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customer_followups WHERE id = ?', [result.insertId]);
  return rows[0];
};
