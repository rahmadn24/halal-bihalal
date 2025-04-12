import pool from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await pool.query('UPDATE anggota SET sudah_menang = FALSE, pemenang_ke = null');
  res.status(200).json({ success: true });
}
