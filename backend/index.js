const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { Pool } = require('pg');
require('dotenv').config(); // load .env

const fastify = Fastify();
fastify.register(cors);

// Pool koneksi PostgreSQL dari Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// GET semua anggota
fastify.get('/anggota', async () => {
  const res = await pool.query('SELECT * FROM anggota ORDER BY id');
  return res.rows;
});

// Tandai hadir
fastify.post('/hadir/:id', async (req, reply) => {
  await pool.query('UPDATE anggota SET status_hadir = TRUE WHERE id = $1', [req.params.id]);
  reply.send({ success: true });
});

// Tambah anggota baru
fastify.post('/anggota', async (req, reply) => {
  const { nama } = req.body;
  const res = await pool.query('INSERT INTO anggota (nama, status_hadir) VALUES ($1, TRUE) RETURNING *', [nama]);
  reply.send(res.rows[0]);
});

// Spin doorprize
fastify.post('/spin', async (req, reply) => {
  let { jumlah } = req.query;
  jumlah = parseInt(jumlah);
  if (isNaN(jumlah) || jumlah < 1) jumlah = 1;

  const res = await pool.query('SELECT * FROM anggota WHERE status_hadir = TRUE AND sudah_menang = FALSE');
  const kandidat = res.rows;
  if (!kandidat.length) return reply.send({ winners: [] });

  const shuffled = kandidat.sort(() => 0.5 - Math.random());
  const winners = shuffled.slice(0, Math.min(jumlah, kandidat.length));
  const ids = winners.map(w => w.id);

  await pool.query('UPDATE anggota SET sudah_menang = TRUE WHERE id = ANY($1::int[])', [ids]);

  reply.send({ winners });
});

// Reset status pemenang
fastify.post('/reset-pemenang', async (req, reply) => {
  await pool.query('UPDATE anggota SET sudah_menang = FALSE');
  reply.send({ success: true });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' }); // host penting untuk Railway
    console.log('Server running on port', process.env.PORT || 3001);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
