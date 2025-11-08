import { useEffect, useMemo, useState } from "react";
import ShowtimeForm from "../components/showtimes/ShowtimeForm";
import ShowtimeTable from "../components/showtimes/ShowtimeTable";
import { listShowtimes, createShowtime, deleteShowtime } from "../api/showtimes.js";

type Showtime = {
  id: number;
  movieTitle: string;
  cinemaName: string;
  startTime: string;
  endTime: string;
};

export default function ShowtimesPage() {
  const [items, setItems] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    listShowtimes(ctrl.signal)
      .then((data: Showtime[]) => {
        const normalized = data.map((s) => ({
          ...s,
          startTime: s.startTime ?? "",
          endTime: s.endTime ?? "",
        }));
        setItems(normalized);
      })
      .catch((e: any) => {
        if (e?.name === "AbortError") return;
        setError(e.message || String(e));
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) =>
      [s.movieTitle, s.cinemaName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">Showtimes</h1>
      </header>

      <ShowtimeForm onCreate={handleCreate} loading={creating} />

      <div className="flex items-center justify-between" style={{ maxWidth: 760 }}>
        <input
          className="cinema-search"
          placeholder="Search showtimes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {loading && <span style={{ marginLeft: 12, color: "#6b7280" }}>Loading…</span>}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <ShowtimeTable items={filtered} onDelete={handleDelete} busyId={busyId} />
    </div>
  );
}
