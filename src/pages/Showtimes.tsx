import { useEffect, useMemo, useState } from "react";
import ShowtimeForm from "../components/showtimes/ShowtimeForm";
import ShowtimeTable from "../components/showtimes/ShowtimeTable";
import {
  listShowtimes,
  createShowtime,
  deleteShowtime,
  searchShowtimes,
  listShowtimesWindow,
} from "../api/showtimes.js";
import { listCinemas } from "../api/cinemas.js";

import { filterShowtimes } from "../api/showtimes.js";

import { useNavigate } from 'react-router-dom';



type Showtime = {
  id: number;
  movieTitle: string;
  cinemaName: string;
  startTime: string;
  endTime: string;
};

type Cinema = {
  id: number;
  name: string;
};

export default function ShowtimesPage() {
  // data
  const [items, setItems] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [cinemaId, setCinemaId] = useState<number | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const navigate = useNavigate();

  function handleViewSeats(row: Showtime) {
    navigate(`/showtimes/${row.id}/seats`, {
      state: {
        movieTitle: row.movieTitle,
        cinemaName: row.cinemaName,
        // screenNumber: row.screenNumber, // we don’t have this in the type yet, so skip it
      },
    });
  }


  // initial load
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    // load showtimes
    listShowtimes(ctrl.signal)
      .then((data: Showtime[]) => {
        setItems(
          (data || []).map((s) => ({
            ...s,
            startTime: s.startTime ?? "",
            endTime: s.endTime ?? "",
          }))
        );
      })
      .catch((e: any) => {
        if (e?.name === "AbortError") return;
        setError(e.message || String(e));
      })
      .finally(() => setLoading(false));

    // load cinemas for dropdown (ignore errors silently)
    listCinemas(ctrl.signal)
      .then((cs: any[]) => setCinemas(cs?.map((c) => ({ id: c.id, name: c.name })) ?? []))
      .catch(() => { });

    return () => ctrl.abort();
  }, []);

  // client-side quick filter (applies on top of server results)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) =>
      [s.movieTitle, s.cinemaName].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  async function handleCreate(data: Partial<Showtime>) {
    setCreating(true);
    setError("");
    try {
      const created = (await createShowtime(data)) as Showtime;
      setItems((prev) => [created, ...prev]);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(row: Showtime) {
    if (!confirm(`Delete showtime for "${row.movieTitle}"?`)) return;
    setBusyId(row.id);
    setError("");
    const snapshot = items;
    setItems((prev) => prev.filter((s) => s.id !== row.id));
    try {
      await deleteShowtime(row.id);
    } catch (e: any) {
      setError(e.message || String(e));
      setItems(snapshot);
    } finally {
      setBusyId(null);
    }
  }

  
  async function runUnifiedFilter() {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    try {
      const data = await filterShowtimes(
        {
          q,
          cinemaId: cinemaId === "" ? undefined : Number(cinemaId),
          from: toIsoLocal(from),
          to: toIsoLocal(to),
        },
        ctrl.signal
      );

      setItems(
        (data || []).map((s: Showtime) => ({
          ...s,
          startTime: s.startTime ?? "",
          endTime: s.endTime ?? "",
        }))
      );
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }


  
  function toIsoLocal(dt: string): string | undefined {
    if (!dt) return undefined;

    // Already ISO 8601 local: 2025-11-08T22:34
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dt)) return dt;

    // dd/MM/yyyy HH:mm
    const m = dt.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (m) {
      const [, d, mo, y, h, mi] = m;
      return `${y}-${mo}-${d}T${h}:${mi}`;
    }

    // Fallback: send as-is (but it may still fail on the server)
    return dt;
  }


 

  function clearFilters() {
    setQ("");
    setCinemaId("");
    setFrom("");
    setTo("");
    setError("");

    // Clear the results instead of reloading all
    setItems([]);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">Showtimes</h1>
      </header>

      <ShowtimeForm onCreate={handleCreate} loading={creating} />

      {/* Filters */}
      <div className="cinema-card" style={{ maxWidth: 980 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Search by title (server) */}
          <div className="cinema-row">
            <label>Search title</label>
            <input
              className="cinema-search"
              placeholder="e.g. Oppenheimer"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

          </div>

          {/* Window filter */}
          <div className="cinema-row">
            <label>Cinema</label>
            <select
              value={cinemaId}
              onChange={(e) => setCinemaId(e.target.value === "" ? "" : Number(e.target.value))}
              style={{ flex: 1, padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 10 }}
            >
              <option value="">All cinemas</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="cinema-row">
            <label>From</label>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="cinema-search"
            />
          </div>
          <div className="cinema-row">
            <label>To</label>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="cinema-search"
            />
          </div>

          <div className="cinema-actions">
            <button className="btn-primary" onClick={runUnifiedFilter}>Search</button>
            <button className="btn-link" type="button" onClick={clearFilters}>Clear</button>
            {loading && <span style={{ color: "#6b7280" }}>Loading…</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <ShowtimeTable
        items={filtered}
        onDelete={handleDelete}
        busyId={busyId}
        onViewSeats={handleViewSeats}
      />

    </div>
  );
}
