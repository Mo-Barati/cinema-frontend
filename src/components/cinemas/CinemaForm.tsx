import { useState } from "react";

type Props = {
    onCreate: (payload: any) => Promise<void>;
    loading?: boolean;
};

const initial = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
};

export default function CinemaForm({ onCreate, loading }: Props) {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate(values: typeof initial) {
        const e: Record<string, string> = {};
        if (!values.name.trim()) e.name = "Name is required";
        if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Invalid email";
        if (values.phone && !/^[0-9+()\-\s]{6,}$/.test(values.phone)) e.phone = "Invalid phone";
        return e;
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;
        await onCreate({ ...form });
        setForm(initial);
    }

    return (
        <form onSubmit={handleSubmit} className="cinema-card cinema-form">
            <div className="cinema-row">
                <label>Name *</label>
                <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cineplex Westfield"
                />
            </div>
            {errors.name && <div style={{ color: "#dc2626", marginLeft: 140 }}>{errors.name}</div>}

            <div className="cinema-row">
                <label>Email</label>
                <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="manager@cinema.com"
                />
            </div>

            <div className="cinema-row">
                <label>Phone</label>
                <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+44 20 7946 0991"
                />
            </div>

            <div className="cinema-row">
                <label>Address</label>
                <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 High Street"
                />
            </div>

            <div className="cinema-row">
                <label>City</label>
                <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="London"
                />
            </div>

            <div className="cinema-row">
                <label>Postcode</label>
                <input
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    placeholder="W12 7GF"
                />
            </div>

            <div className="cinema-actions">
                <button className="btn-primary" disabled={loading}>
                    {loading ? "Adding…" : "Add Cinema"}
                </button>
                <button
                    type="button"
                    className="btn-link"
                    onClick={() => setForm(initial)}
                >
                    Clear
                </button>
            </div>
        </form>
    );
}
