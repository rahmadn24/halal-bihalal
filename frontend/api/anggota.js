import pool from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const result = await pool.query('SELECT * FROM anggota ORDER BY id');
  res.status(200).json(result.rows);
}
