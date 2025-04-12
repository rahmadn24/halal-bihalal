import pool from '../../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nama } = req.body;
  const result = await pool.query(
    'INSERT INTO anggota (nama, status_hadir) VALUES ($1, TRUE) RETURNING *',
    [nama]
  );
  res.status(200).json(result.rows[0]);
}
