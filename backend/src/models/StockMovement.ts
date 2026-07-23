import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface IStockMovement {
  id: number;
  productId: number;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt?: string;
  productName?: string;
}

export interface CreateStockMovementDTO {
  productId: number;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
}

export const createStockMovement = async (
  data: CreateStockMovementDTO,
  connection?: any
): Promise<IStockMovement> => {
  const executor = connection || pool;
  const query = `
    INSERT INTO stock_movements (productId, quantityChanged, movementType, reason, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    data.productId,
    data.quantityChanged,
    data.movementType,
    data.reason,
    data.createdBy,
  ];

  const [result] = await executor.query(query, values);
  return {
    id: (result as ResultSetHeader).insertId,
    ...data,
  };
};

export const getMovementsByProductId = async (productId: number): Promise<IStockMovement[]> => {
  const query = `
    SELECT 
      sm.id,
      sm.productId,
      p.productName,
      sm.quantityChanged,
      sm.movementType,
      sm.reason,
      sm.createdBy,
      sm.createdAt
    FROM stock_movements sm
    JOIN products p ON sm.productId = p.id
    WHERE sm.productId = ?
    ORDER BY sm.id DESC
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query, [productId]);
  return rows as IStockMovement[];
};
