import { useEffect, useMemo, useState } from "react";
import { listCinemas, createCinema, deleteCinema } from "../api/cinemas.js"; // note .js
import CinemaForm from "../components/cinemas/CinemaForm";
import CinemaTable from "../components/cinemas/CinemaTable";
import type { Cinema } from "../types/cinema";
import EditCinemaModal from "../components/cinemas/EditCinemaModal";
import { updateCinema } from "../api/cinemas.js"; // note .js like your other imports




export default function CinemasPage() {
    const [items, setItems] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");
    const [addedMsg, setAddedMsg] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [editing, setEditing] = useState<Cinema | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);




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

        // If "Show All" is active, return alphabetically sorted list
        if (showAll) {
            return [...items].sort((a, b) =>
                a.name.localeCompare(b.name, "en", { sensitivity: "base" })
            );
        }

        // If searching, filter results
        if (term) {
            return items.filter((c) =>
                [c.name, c.address, c.city, c.postcode, c.email, c.phone]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(term))
            );
        }

        // Default: show nothing unless user searches or clicks "Show All"
        return [];
    }, [items, q, showAll]);


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
            setAddedMsg(`“${created.name}” added to cinemas`);
            setTimeout(() => setAddedMsg(""), 2000);
            setQ(""); // optional: clear the search box after add
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

    function handleOpenEdit(row: Cinema) {
        console.log("Editing:", row); // TEMP
        setEditing(row);
    }


    async function handleSaveEdit(payload: Partial<Cinema>) {
        if (!editing) return;
        setSavingEdit(true);
        setError("");

        // Prepare payload your backend expects
        const req: any = {
            // full entity to satisfy PUT
            name: payload.name?.trim() || "",
            email: payload.email?.trim() || "",
            phone: payload.phone?.trim() || "",
            addressLine: (payload.address ?? "").trim(),
            city: payload.city?.trim() || "",
            postcode: payload.postcode?.trim() || "",
            country: "UK",
            totalScreens: 1,
            stateOrProvince: null,
        };

        try {
            const updated = (await updateCinema(editing.id, req)) as any;
            // Normalize back into UI shape
            const normalized: Cinema = {
                id: updated.id,
                name: updated.name,
                address: updated.address ?? updated.addressLine ?? "",
                city: updated.city ?? "",
                postcode: updated.postcode ?? "",
                phone: updated.phone ?? "",
                email: updated.email ?? "",
            };
            setItems((prev) => prev.map((c) => (c.id === normalized.id ? normalized : c)));
            setEditing(null);
            setAddedMsg(`“${normalized.name}” updated`);
            setTimeout(() => setAddedMsg(""), 2000);
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setSavingEdit(false);
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
            {addedMsg && (
                <div
                    className="p-2 mt-2 rounded-lg"
                    style={{ maxWidth: 760, background: "#ECFDF5", color: "#065F46", border: "1px solid #D1FAE5" }}
                >
                    {addedMsg}
                </div>
            )}


            <div className="flex items-center justify-between" style={{ maxWidth: 760 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                        className="cinema-search"
                        placeholder="Search cinemas…"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setShowAll(false); // when user types, exit "show all" mode
                        }}
                    />
                    <button
                        type="button"
                        className="btn-link"
                        style={{ fontWeight: 600 }}
                        onClick={() => {
                            if (showAll) {
                                setShowAll(false); // hide list
                            } else {
                                setShowAll(true);  // show list
                                setQ("");          // clear search
                            }
                        }}
                    >
                        {showAll ? "Hide All" : "Show All (A–Z)"}
                    </button>

                </div>
                {loading && <span style={{ marginLeft: 12, color: "#6b7280" }}>Loading…</span>}
            </div>


            {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>
            )}

            {(showAll || q.trim()) ? (
                <CinemaTable
                    items={filtered}
                    onDelete={handleDelete}
                    busyId={busyId}
                    onEdit={handleOpenEdit}
                />

            ) : (
                <div style={{ color: "#6b7280", marginTop: 8 }}>
                    Type in the search box or click “Show All (A–Z)” to view cinemas.
                </div>
            )}

            {editing && (
                <EditCinemaModal
                    row={editing}
                    saving={savingEdit}
                    onSave={handleSaveEdit}
                    onClose={() => setEditing(null)}
                />
            )}


        </div>
    );
}



