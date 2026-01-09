import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const DecisionModel = {
  tableName: 'decisions',

  async create({ userId, userInput, decision, reasoning, confidenceScore }) {
    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO ${this.tableName} 
       (id, user_id, user_input, decision, reasoning, confidence_score, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, userId, userInput, decision, reasoning, confidenceScore]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByUserId(userId, limit = 10) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async findRecent(userId, limit = 5) {
    const result = await db.query(
      `SELECT d.*, 
              json_agg(json_build_object('id', t.id, 'title', t.title, 'priority', t.priority, 'status', t.status)) as tasks
       FROM ${this.tableName} d
       LEFT JOIN tasks t ON t.decision_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
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
};

