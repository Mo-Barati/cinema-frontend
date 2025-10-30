import { useEffect, useMemo, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Showtime {
  id?: number;
  movieTitle: string;
  screenNumber: number;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  language?: string;
  format?: string;
  cinemaId: number;
  createdAt?: string;
  updatedAt?: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      const msg = data?.message || text || `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

function toIso(dtLocal: string): string {
  if (!dtLocal) return "";
  const d = new Date(dtLocal.replace(" ", "T"));
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  ).toISOString();
}

export default function Showtimes() {
  const [cinemaId, setCinemaId] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Showtime[]>([]);

  const [form, setForm] = useState<Showtime>({
    movieTitle: "",
    screenNumber: 1,
    startTime: "",
    endTime: "",
    ticketPrice: 10,
    language: "EN",
    format: "2D",
    cinemaId: 1,
  });

  const canSearchByCinema = useMemo(() => /^\d+$/.test(cinemaId), [cinemaId]);
  const canCreate = useMemo(() => {
    return (
      form.movieTitle.trim().length > 0 &&
      form.screenNumber > 0 &&
      !!form.startTime &&
      !!form.endTime &&
      form.ticketPrice >= 0 &&
      form.cinemaId > 0
    );
  }, [form]);

  const fetchByCinema = async () => {
    if (!canSearchByCinema) return;
    setLoading(true); setError(null);
    try {
      const data = await api<Showtime[]>(`/api/showtimes/by-cinema/${cinemaId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const fetchByQuery = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const data = await api<Showtime[]>(`/api/showtimes/search?q=${encodeURIComponent(query.trim())}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const createShowtime = async () => {
    if (!canCreate) return;
    setLoading(true); setError(null);
    try {
      const payload = {
        movieTitle: form.movieTitle.trim(),
        screenNumber: form.screenNumber,
        startTime: toIso(form.startTime),
        endTime: toIso(form.endTime),
        ticketPrice: form.ticketPrice,
        language: form.language || undefined,
        format: form.format || undefined,
        cinemaId: form.cinemaId,
      };
      const created = await api<Showtime>(`/api/showtimes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setRows(r => [created, ...r]);
      setForm(f => ({ ...f, movieTitle: "", startTime: "", endTime: "" }));
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const removeShowtime = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this showtime?")) return;
    setLoading(true); setError(null);
    try {
      await api<void>(`/api/showtimes/${id}`, { method: "DELETE" });
      setRows(r => r.filter(x => x.id !== id));
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ position: "sticky", top: 0, background: "white", padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>🎬 Cinema Ticket Booking — Frontend (Phase 1)</h1>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Backend: {BASE_URL}</span>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
        {/* Search by cinema */}
        <section style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Find Showtimes by Cinema</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Cinema ID (e.g., 1)"
              value={cinemaId}
              onChange={e => setCinemaId(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }}
            />
            <button onClick={fetchByCinema} disabled={!canSearchByCinema || loading} style={{ padding: "8px 12px", borderRadius: 12 }}>
              Load
            </button>
          </div>
        </section>

        {/* Search by title */}
        <section style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Search by Movie Title</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="e.g., Batman"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }}
            />
            <button onClick={fetchByQuery} disabled={!query.trim() || loading} style={{ padding: "8px 12px", borderRadius: 12 }}>
              Search
            </button>
          </div>
        </section>

        {/* Create showtime */}
        <section style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Create Showtime</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            <input placeholder="Movie Title" value={form.movieTitle} onChange={e => setForm({ ...form, movieTitle: e.target.value })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Screen #" value={form.screenNumber} onChange={e => setForm({ ...form, screenNumber: Number(e.target.value) })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Ticket Price" value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: Number(e.target.value) })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <input placeholder="Language" value={form.language || ""} onChange={e => setForm({ ...form, language: e.target.value })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <input placeholder="Format (2D/3D)" value={form.format || ""} onChange={e => setForm({ ...form, format: e.target.value })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Cinema ID" value={form.cinemaId} onChange={e => setForm({ ...form, cinemaId: Number(e.target.value) })} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            <label style={{ fontSize: 12, color: "#374151" }}>Start Time
              <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={{ marginTop: 4, width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>End Time
              <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={{ marginTop: 4, width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid #d1d5db" }} />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button onClick={createShowtime} disabled={!canCreate || loading} style={{ width: "100%", padding: "8px 12px", borderRadius: 12 }}>
                Create
              </button>
            </div>
          </div>
        </section>

        {/* Errors & status */}
        {error && <div style={{ padding: 12, borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>}
        {loading && <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#f3f4f6" }}>Loading…</div>}

        {/* Results */}
        <section style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Showtimes</h2>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{rows.length} result(s)</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th>ID</th><th>Movie</th><th>Screen</th><th>Start</th><th>End</th><th>Price</th><th>Lang</th><th>Format</th><th>Cinema</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td>{s.id ?? "—"}</td>
                    <td style={{ fontWeight: 600 }}>{s.movieTitle}</td>
                    <td>{s.screenNumber}</td>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>{new Date(s.endTime).toLocaleString()}</td>
                    <td>£{Number(s.ticketPrice).toFixed(2)}</td>
                    <td>{s.language || "—"}</td>
                    <td>{s.format || "—"}</td>
                    <td>{s.cinemaId}</td>
                    <td><button onClick={() => removeShowtime(s.id)}>Delete</button></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: 16, color: "#6b7280" }}>No results yet. Try a search or load by cinema.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
