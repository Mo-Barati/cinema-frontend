import { useState } from "react";

type Cinema = {
    id: number;
    name: string;
    address?: string;
    city?: string;
    postcode?: string;
    phone?: string;
    email?: string;
};

export default function EditCinemaModal({
    row,
    onSave,
    onClose,
    saving = false,
}: {
    row: Cinema;
    onSave: (payload: Omit<Cinema, "id">) => Promise<void> | void;
    onClose: () => void;
    saving?: boolean;
}) {
    const [form, setForm] = useState<Omit<Cinema, "id">>({
        name: row.name || "",
        email: row.email || "",
        phone: row.phone || "",
        address: row.address || "",
        city: row.city || "",
        postcode: row.postcode || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate(v: typeof form) {
        const e: Record<string, string> = {};
        if (!v.name.trim()) e.name = "Name is required";
        if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email";
        if (v.phone && !/^[0-9+()\-\s]{6,}$/.test(v.phone)) e.phone = "Invalid phone";
        return e;
    }

    async function submit(ev: React.FormEvent) {
        ev.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;
        await onSave(form);
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
            }}
            aria-modal="true"
            role="dialog"
        >
            <form
                onSubmit={submit}
                className="cinema-card"
                style={{ width: "min(760px, 92vw)", maxWidth: 760, padding: 20 }}
            >
                <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 600 }}>Edit cinema</h2>

                <div className="cinema-row">
                    <label>Name *</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Cinema name"
                        required
                    />
                </div>
                {errors.name && <div style={{ color: "#dc2626", marginLeft: 140 }}>{errors.name}</div>}

                <div className="cinema-row">
                    <label>Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="manager@cinema.com"
                        autoComplete="email"
                    />
                </div>
                {errors.email && <div style={{ color: "#dc2626", marginLeft: 140 }}>{errors.email}</div>}

                <div className="cinema-row">
                    <label>Phone</label>
                    <input
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+44 20 7946 0991"
                    />
                </div>
                {errors.phone && <div style={{ color: "#dc2626", marginLeft: 140 }}>{errors.phone}</div>}

                <div className="cinema-row">
                    <label>Address</label>
                    <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="123 High Street"
                        autoComplete="address-line1"
                    />
                </div>

                <div className="cinema-row">
                    <label>City</label>
                    <input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="London"
                        autoComplete="address-level2"
                    />
                </div>

                <div className="cinema-row">
                    <label>Postcode</label>
                    <input
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                        placeholder="W12 7GF"
                        autoComplete="postal-code"
                    />
                </div>

                <div className="cinema-actions">
                    <button className="btn-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button type="button" className="btn-link" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
