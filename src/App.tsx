import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import "./App.css";
import ShowtimeSeats from './pages/ShowtimeSeats';


export default function App() {
  return (
    <div className="app-container">
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>🎬 Cinema Ticket Booking</h1>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Frontend — Phase 1.1</span>
        </div>
        <NavBar />
      </header>

      {/* FULL WIDTH */}
      <main style={{ padding: "24px 16px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
