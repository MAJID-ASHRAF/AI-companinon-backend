import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const TaskModel = {
  tableName: 'tasks',

  async create({ decisionId, title, priority, status = 'pending' }) {
    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO ${this.tableName} 
       (id, decision_id, title, priority, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, decisionId, title, priority, status]
    );
    return result.rows[0];
  },

  async createMany(tasks) {
    const results = [];
    for (const task of tasks) {
      const created = await this.create(task);
      results.push(created);
    }
    return results;
  },

  async findById(id) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByDecisionId(decisionId) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE decision_id = $1 
       ORDER BY priority ASC`,
      [decisionId]
    );
    return result.rows;
  },

  async findPendingByUserId(userId) {
    const result = await db.query(
      `SELECT t.* FROM ${this.tableName} t
       JOIN decisions d ON d.id = t.decision_id
       WHERE d.user_id = $1 AND t.status = 'pending'
       ORDER BY t.priority ASC`,
      [userId]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE ${this.tableName} 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async deleteByDecisionId(decisionId) {
    const result = await db.query(
      `DELETE FROM ${this.tableName} WHERE decision_id = $1 RETURNING *`,
      [decisionId]
    );
    return result.rows;
  },
};

