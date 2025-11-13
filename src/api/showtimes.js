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

// --- Search by title (server-side) ---
export async function searchShowtimes({ q }, signal) {
    const term = encodeURIComponent(q || "");
    const res = await fetch(`${API_BASE}/api/showtimes/search?q=${term}`, { signal });
    if (!res.ok) throw new Error(`Failed to search showtimes: ${res.status}`);
    return res.json();
}

// --- Window query by cinema + date-time range (server-side) ---
export async function listShowtimesWindow({ cinemaId, from, to }, signal) {
    const params = new URLSearchParams();
    if (cinemaId != null) params.set("cinemaId", String(cinemaId));
    if (from) params.set("from", from); // e.g. 2025-11-10T09:00
    if (to) params.set("to", to);

    const res = await fetch(`${API_BASE}/api/showtimes/window?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(`Failed to load showtimes window: ${res.status}`);
    return res.json();
}

export async function filterShowtimes({ q, cinemaId, from, to }, signal) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cinemaId != null && cinemaId !== "") params.set("cinemaId", String(cinemaId));
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`${API_BASE}/api/showtimes/filter?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(`Failed to filter showtimes: ${res.status}`);
    return res.json();
}

// --- Seat map APIs ---
export async function fetchSeatMap(showtimeId) {
    const response = await fetch(`${API_BASE}/api/showtimes/${showtimeId}/seats`);
    if (!response.ok) {
        throw new Error(`Failed to load seat map: ${response.status}`);
    }
    return await response.json();
}

export async function bookSeats(showtimeId, seatIds) {
    const response = await fetch(`${API_BASE}/api/showtimes/${showtimeId}/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to book seats: ${response.status}`);
    }

    // 204 No Content → nothing to return
    return;
}

