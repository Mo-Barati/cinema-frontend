import { useState } from "react";

type Props = { onCreate: (payload: any) => Promise<void>; loading?: boolean };

type Form = {
    movieTitle: string;
    cinemaName: string;
    startTime: string;
    endTime: string;
};

const initial: Form = { movieTitle: "", cinemaName: "", startTime: "", endTime: "" };

export default function ShowtimeForm({ onCreate, loading }: Props) {
    const [form, setForm] = useState<Form>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate(v: Form) {
        const e: Record<string, string> = {};
        if (!v.movieTitle.trim()) e.movieTitle = "Movie title is required";
        if (!v.cinemaName.trim()) e.cinemaName = "Cinema name is required";
        if (!v.startTime) e.startTime = "Start time is required";
        if (!v.endTime) e.endTime = "End time is required";
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

    const input = "mt-1 w-full rounded-xl border p-2";
    const label = "block text-sm font-medium";

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl shadow bg-white p-4 md:p-6 space-y-4 max-w-3xl">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className={label}>Movie Title *</label>
                    <input className={input} value={form.movieTitle} onChange={(e) => setForm({ ...form, movieTitle: e.target.value })} placeholder="e.g. Oppenheimer" />
                    {errors.movieTitle && <p className="text-sm text-red-600 mt-1">{errors.movieTitle}</p>}
                </div>

                <div>
                    <label className={label}>Cinema Name *</label>
                    <input className={input} value={form.cinemaName} onChange={(e) => setForm({ ...form, cinemaName: e.target.value })} placeholder="e.g. Vue Westfield" />
                    {errors.cinemaName && <p className="text-sm text-red-600 mt-1">{errors.cinemaName}</p>}
                </div>

                <div>
                    <label className={label}>Start Time *</label>
                    <input type="datetime-local" className={input} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                    {errors.startTime && <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>}
                </div>

                <div>
                    <label className={label}>End Time *</label>
                    <input type="datetime-local" className={input} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                    {errors.endTime && <p className="text-sm text-red-600 mt-1">{errors.endTime}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">{loading ? "Adding…" : "Add Showtime"}</button>
                <button type="button" className="text-sm underline" onClick={() => setForm(initial)}>Clear</button>
            </div>
        </form>
    );
}
