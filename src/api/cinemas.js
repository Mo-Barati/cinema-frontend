// src/api/cinemas.js
export const API_BASE =
    (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")) || "http://localhost:8080";

const headers = { "Content-Type": "application/json" };

export async function listCinemas(signal) {
    const res = await fetch(`${API_BASE}/api/cinemas`, { signal });
    if (!res.ok) throw new Error(`Failed to load cinemas: ${res.status}`);
    return res.json();
}

export async function createCinema(payload) {
    const res = await fetch(`${API_BASE}/api/cinemas`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create cinema: ${res.status}`);
    }
    return res.json();
}

export async function deleteCinema(id) {
    const res = await fetch(`${API_BASE}/api/cinemas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete cinema ${id}: ${res.status}`);
}
