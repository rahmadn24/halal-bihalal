import pool from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let jumlah = parseInt(req.query.jumlah || '1');
  if (isNaN(jumlah) || jumlah < 1) jumlah = 1;

  const result = await pool.query(
    'SELECT * FROM anggota WHERE status_hadir = TRUE AND sudah_menang = FALSE'
  );
  const kandidat = result.rows;
  if (!kandidat.length) return res.status(200).json({ winners: [] });

  const shuffled = kandidat.sort(() => 0.5 - Math.random());
  const winners = shuffled.slice(0, Math.min(jumlah, kandidat.length));
  const ids = winners.map(w => w.id);

  await pool.query('UPDATE anggota SET sudah_menang = TRUE WHERE id = ANY($1::int[])', [ids]);

  res.status(200).json({ winners });
}
