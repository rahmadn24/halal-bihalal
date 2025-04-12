import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpinPage from "./pages/SpinPage";
import "./index.css";

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <h2>Halal Bihalal</h2>
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>Daftar Hadir</Link>
      <Link to="/spin" className={location.pathname === "/spin" ? "active" : ""}>Spin Dorprize</Link>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/spin" element={<SpinPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;