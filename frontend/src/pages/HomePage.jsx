import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const HomePage = () => {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await axios.get("/api/anggota");
      setParticipants(res.data);
    } catch (err) {
      console.error("Gagal ambil data peserta", err);
    }
  };

  const handleAdd = async () => {
    const nama = prompt("Nama peserta:");
    if (!nama) return;
    try {
      await axios.post("/api/anggota/tambah", { nama });
      fetchParticipants();
    } catch (err) {
      console.error("Gagal tambah peserta", err);
    }
  };

  const handleMarkHadir = async (id) => {
    try {
      await axios.post(`/api/anggota/hadir?id=${id}`);
      fetchParticipants();
    } catch (err) {
      console.error("Gagal tandai hadir", err);
    }
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Nama",
      selector: (row) => row.nama,
      sortable: true,
    },
    {
      name: "Status Hadir",
      cell: (row) =>
        row.status_hadir ? (
          "Hadir"
        ) : (
          <button onClick={() => handleMarkHadir(row.id)}>Tandai Hadir</button>
        ),
      sortable: true,
    },
  ];

  const filteredData = participants.filter((p) =>
    p.nama?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Daftar Hadir</h1>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleAdd}>Tambah Anggota</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
};

export default HomePage;
