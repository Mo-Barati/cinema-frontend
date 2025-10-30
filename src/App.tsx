import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>🎬 Cinema Ticket Booking</h1>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Frontend — Phase 1.1</span>
        </div>
        <NavBar />
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
