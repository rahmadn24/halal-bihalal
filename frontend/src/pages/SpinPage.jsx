import { useEffect, useState } from 'react';
import axios from 'axios';
import '../index.css';

function SpinPage() {
  const [hadirList, setHadirList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [winners, setWinners] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHadirList();
  }, []);

  const fetchHadirList = async () => {
    try {
      const res = await axios.get('/api/anggota');
      const hadir = res.data.filter(a => a.status_hadir && !a.sudah_menang);
      setHadirList(hadir);
    } catch (err) {
      console.error('Gagal fetch daftar hadir', err);
    }
  };

  const spin = async () => {
    if (hadirList.length === 0 || spinning) return;
    setSpinning(true);
    const spinDuration = 5000;
    const interval = 100;
    let totalTime = 0;

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * hadirList.length);
      setSelected(hadirList[randomIndex]);
      totalTime += interval;
      if (totalTime >= spinDuration) {
        clearInterval(spinInterval);
        setSpinning(false);
        axios.post('/api/spin?jumlah=1')
          .then(res => {
            const winner = res.data.winners?.[0];
            const newHistory = res.data.history;
            if (winner) setSelected(winner);
            setWinners(newHistory);
            setHistory(newHistory);  // Update riwayat
            fetchHadirList();
          })
          .catch(err => console.error('Gagal spin', err));
      }
    }, interval);
  };

  const getWinnerClass = (winner) => {
    // Jika pemenang ada di top 10 (nomor urut 1-10), beri animasi khusus
    if (winner.pemenang_ke >= 1 && winner.pemenang_ke <= 10) {
      return 'winner-highlight';
    }
    return '';
  };

  return (
    <div className="spin-page">
      <div className="spin-left card">
        <h2 className="spin-title">Spin Doorprize</h2>
        <div className={`spin-box ${spinning ? 'spinning lightning' : ''}`}>
          {selected ? <h1 className={`winner-name ${getWinnerClass(selected)}`}>{selected.nama}</h1> : <h1 className="placeholder">-</h1>}
        </div>
        <button onClick={spin} disabled={spinning} className="spin-button">
          {spinning ? 'Memutar...' : '⚡ Mulai Spin'}
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
                <span>{w.nama} (Pemenang Ke-{w.pemenang_ke})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="history-card card">
        <h3 className="history-title">📝 Riwayat Pemenang</h3>
        {history.length === 0 ? (
          <p className="history-empty">Belum ada riwayat pemenang</p>
        ) : (
          <ul className="history-list">
            {history.map((h, i) => (
              <li key={h.id} className={`history-item ${getWinnerClass(h)}`}>
                <span>{i + 1}. </span>
                <span>{h.nama}</span> - Pemenang Ke-{h.pemenang_ke}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SpinPage;
