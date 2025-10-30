import { useEffect, useMemo, useState } from "react";
import { listCinemas, createCinema, deleteCinema } from "../api/cinemas.js"; // note .js
import CinemaForm from "../components/cinemas/CinemaForm";
import CinemaTable from "../components/cinemas/CinemaTable";

type Cinema = {
    id: number;
    name: string;
    addressLine?: string;
    city?: string;
    postcode?: string;
    phone?: string;
    email?: string;
};

export default function CinemasPage() {
    const [items, setItems] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const ctrl = new AbortController();
        setLoading(true);
        setError("");

        listCinemas(ctrl.signal)
            .then((data: any[]) => {
                const normalized: Cinema[] = data.map((c: any) => ({
                    ...c,
                    address: c.address ?? c.addressLine ?? "",
                }));
                setItems(normalized);
            })
            .catch((e: any) => {
                if (e?.name === "AbortError") return; // ignore navigation/unmount aborts
                setError(e.message || String(e));
            })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, []);
      

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return items;
        return items.filter((c) =>
            [c.name, c.address, c.city, c.postcode, c.email, c.phone]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(term))
        );
    }, [items, q]);

    async function handleCreate(data: Partial<Cinema>) {
        setCreating(true);
        setError("");
        try {
            const payload: any = {
                ...data,
                addressLine: data.address ?? "",
                country: "UK",          // required by backend
                totalScreens: 1,        // required by backend
                stateOrProvince: null,  // optional, matches your existing data
            };
            delete payload.address;

            const created = (await createCinema(payload)) as Cinema;
            setItems((prev) => [created, ...prev]);
        } catch (e: any) {
            // Try to show a cleaner error message if the server returned JSON
            try {
                const parsed = JSON.parse(e.message);
                setError(parsed.message || e.message);
            } catch {
                setError(e.message || String(e));
            }
        } finally {
            setCreating(false);
        }
    }
      
      

    async function handleDelete(row: Cinema) {
        if (!confirm(`Delete cinema "${row.name}"?`)) return;
        setBusyId(row.id);
        setError("");
        const snapshot = items;
        setItems((prev) => prev.filter((c) => c.id !== row.id));
        try {
            await deleteCinema(row.id);
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
                <h1 className="text-2xl md:text-3xl font-semibold">Cinemas</h1>
            </header>

            <CinemaForm onCreate={handleCreate} loading={creating} />

            <div className="flex items-center justify-between" style={{ maxWidth: 760 }}>
                <input
                    className="cinema-search"
                    placeholder="Search cinemas…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                {loading && <span style={{ marginLeft: 12, color: "#6b7280" }}>Loading…</span>}
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>
            )}

            <CinemaTable items={filtered} onDelete={handleDelete} busyId={busyId} />
        </div>
    );
}
