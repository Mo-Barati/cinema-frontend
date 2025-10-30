import { NavLink } from "react-router-dom";

const link: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, textDecoration: "none", color: "inherit" };
const active: React.CSSProperties = { background: "#e5e7eb" };

export default function NavBar() {
    return (
        <nav style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", background: "white", position: "sticky", top: 0, zIndex: 10 }}>
            <NavLink to="/" style={({ isActive }) => ({ ...link, ...(isActive ? active : {}) })}>Home</NavLink>
            <NavLink to="/showtimes" style={({ isActive }) => ({ ...link, ...(isActive ? active : {}) })}>Showtimes</NavLink>
            <NavLink to="/cinemas" style={({ isActive }) => ({ ...link, ...(isActive ? active : {}) })}>Cinemas</NavLink>
        </nav>
    );
}
