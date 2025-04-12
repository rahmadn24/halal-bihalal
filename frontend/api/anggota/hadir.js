import pool from '../../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.query;
  await pool.query('UPDATE anggota SET status_hadir = TRUE WHERE id = $1', [id]);
  res.status(200).json({ success: true });
}
