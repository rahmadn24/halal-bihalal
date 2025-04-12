import { useEffect, useState } from 'react';
import axios from 'axios';
import '../index.css';

function SpinPage() {
  const [hadirList, setHadirList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [winners, setWinners] = useState([]);
  const [jumlahPemenang, setJumlahPemenang] = useState(1);
  const [currentName, setCurrentName] = useState('-');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHadirList();
  }, []);

  const fetchHadirList = async () => {
    try {
      const res = await axios.get('/api/anggota');
      const hadir = res.data.filter(a => a.status_hadir && !a.sudah_menang);
      const menang = res.data.filter(a => a.status_hadir && a.sudah_menang);
      setHadirList(hadir);
      setWinners(menang);
    } catch (err) {
      console.error('Gagal fetch daftar hadir', err);
    }
  };

  const spin = async () => {
    if (hadirList.length === 0 || spinning) return;
    const jumlah = Math.min(jumlahPemenang, hadirList.length);
    setSpinning(true);
    setSelectedList([]);
    setCurrentName('-');

    let totalTime = 0;
    const spinDuration = 5000;
    const interval = 100;

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * hadirList.length);
      setCurrentName(hadirList[randomIndex].nama);
      totalTime += interval;

      if (totalTime >= spinDuration) {
        clearInterval(spinInterval);
        axios
          .post(`/api/spin?jumlah=${jumlah}`)
          .then((res) => {
            const winners = res.data.winners;
            if (winners?.length) {
              setSelectedList(winners);
              setCurrentName('-');
              setHistory((prev) => [...prev, winners]); // ⏱️ Simpan history
            }
            fetchHadirList();
            setSpinning(false);
          })
          .catch((err) => {
            console.error('Gagal spin', err);
            setSpinning(false);
          });
      }
    }, interval);
  };

  const resetWinners = async () => {
    const confirmReset = window.confirm('Apakah kamu yakin ingin mereset semua pemenang?');
    if (!confirmReset) return;

    try {
      await axios.post('/api/reset-pemenang');
      setHistory([]); // Kosongkan history juga
      fetchHadirList();
    } catch (err) {
      console.error('Gagal reset pemenang', err);
    }
  };

  return (
    <div className="spin-page">
      <div className="spin-left card">
        <h2 className="spin-title">Spin Doorprize</h2>

        <div className="spin-control">
          <label>Jumlah Pemenang:</label>
          <input
            type="number"
            min="1"
            max={hadirList.length}
            value={jumlahPemenang}
            onChange={(e) => setJumlahPemenang(Number(e.target.value))}
            disabled={spinning}
            className="jumlah-input"
          />
        </div>

        <div className={`spin-box ${spinning ? 'spinning lightning' : ''}`}>
          {spinning ? (
            <h1 className="placeholder">{currentName}</h1>
          ) : selectedList.length > 0 ? (
            selectedList.map((p, i) => (
              <h1 className="winner-name" key={p.id}>
                🎉 {i + 1}. {p.nama}
              </h1>
            ))
          ) : (
            <h1 className="placeholder">-</h1>
          )}
        </div>

        <button onClick={spin} disabled={spinning || hadirList.length === 0} className="spin-button">
          {spinning ? 'Memutar...' : '⚡ Mulai Spin'}
        </button>
        <button onClick={resetWinners} className="reset-button">
          🔁 Reset Pemenang
        </button>
      </div>

      <div className="spin-right card">
        <h3 className="winner-title">🏆 Daftar Pemenang</h3>
        {winners.length === 0 ? (
          <p className="winner-empty">Belum ada pemenang</p>
        ) : (
          <ul className="winner-list">
            {winners.map((w, i) => (
              <li key={w.id} className="winner-item">
                <span>{i + 1}. </span>
                <span>{w.nama}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="spin-history card">
        <h3 className="winner-title">📜 Riwayat Spin</h3>
        {history.length === 0 ? (
          <p className="winner-empty">Belum ada spin dilakukan</p>
        ) : (
          <div className="history-list">
            {history.map((spinGroup, idx) => (
              <div key={idx} className="spin-group">
                <strong>Spin ke-{idx + 1}:</strong>
                <ul>
                  {spinGroup.map((p, i) => (
                    <li key={p.id}>
                      {i + 1}. {p.nama}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpinPage;
