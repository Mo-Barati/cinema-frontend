// src/api/showtimes.js
export const API_BASE =
    (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")) || "http://localhost:8080";

const headers = { "Content-Type": "application/json" };

export async function listShowtimes(signal) {
    const res = await fetch(`${API_BASE}/api/showtimes`, { signal });
    if (!res.ok) throw new Error(`Failed to load showtimes: ${res.status}`);
    return res.json();
}

export async function createShowtime(payload) {
    const res = await fetch(`${API_BASE}/api/showtimes/simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create showtime: ${res.status}`);
    }
    return res.json();
}


export async function deleteShowtime(id) {
    const res = await fetch(`${API_BASE}/api/showtimes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete showtime ${id}: ${res.status}`);
}
