import pool from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let jumlah = parseInt(req.query.jumlah || '1');
  if (isNaN(jumlah) || jumlah < 1) jumlah = 1;

  try {
    // Ambil kandidat yang hadir dan belum menang
    const result = await pool.query(
      'SELECT * FROM anggota WHERE status_hadir = TRUE AND sudah_menang = FALSE'
    );
    const kandidat = result.rows;
    if (!kandidat.length) return res.status(200).json({ winners: [] });

    // Kocok dan ambil sejumlah pemenang
    const shuffled = kandidat.sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, Math.min(jumlah, kandidat.length));

    // Ambil pemenang_ke terakhir yang ada
    const lastWinner = await pool.query(
      'SELECT MAX(pemenang_ke) as max FROM anggota WHERE sudah_menang = TRUE'
    );
    let nextIndex = (lastWinner.rows[0].max || 51) - 1;  // Mulai dari 50 ke bawah

    // Update tiap pemenang dengan sudah_menang dan pemenang_ke
    for (const winner of winners) {
      await pool.query(
        'UPDATE anggota SET sudah_menang = TRUE, pemenang_ke = $1 WHERE id = $2',
        [nextIndex--, winner.id]
      );
    }

    // Ambil riwayat pemenang terbaru, urutkan dari yang terakhir menang
    const history = await pool.query(
      'SELECT id, nama, pemenang_ke FROM anggota WHERE sudah_menang = TRUE ORDER BY pemenang_ke DESC LIMIT 50'
    );

    // Ambil data pemenang terbaru yang menang saat itu
    const updatedIds = winners.map(w => w.id);
    const updated = await pool.query(
      'SELECT id, nama, pemenang_ke FROM anggota WHERE id = ANY($1::int[]) ORDER BY pemenang_ke DESC',
      [updatedIds]
    );

    res.status(200).json({ winners: updated.rows, history: history.rows });
  } catch (err) {
    console.error('Gagal spin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
