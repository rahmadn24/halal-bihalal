import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpinPage from "./pages/SpinPage";
import "./index.css";

const PASSWORD = "halalbihalal2025"; // Ganti dengan password sesuai keinginan

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <h2>Halal Bihalal</h2>
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Daftar Hadir
      </Link>
      <Link
        to="/spin"
        className={location.pathname === "/spin" ? "active" : ""}
      >
        Spin Dorprize
      </Link>
    </div>
  );
};

const AuthGate = ({ onAuthenticated }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      onAuthenticated(true);
    } else {
      alert("Password salah!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Masukkan Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Masuk</button>
      </form>
    </div>
  );
};

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) return <AuthGate onAuthenticated={setAuthenticated} />;

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
