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


// Update an existing cinema: full-entity PUT (handles 204)
export async function updateCinema(id, payload, signal) {
    const url = `${API_BASE}/api/cinemas/${id}`;
    const headers = { "Content-Type": "application/json" };

    // Build a FULL entity (many APIs require this for PUT)
    const full = {
        id,
        name: payload.name || "",
        email: payload.email || "",
        phone: payload.phone || "",
        addressLine: payload.addressLine || payload.address || "",
        city: payload.city || "",
        postcode: payload.postcode || "",
        country: payload.country || "UK",
        totalScreens: payload.totalScreens ?? 1,
        stateOrProvince: payload.stateOrProvince ?? null,
    };

    const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(full),
        signal,
    });

    if (res.status === 204) {
        // success but no body
        return full;
    }

    if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try { msg = JSON.parse(text)?.message || msg; } catch { }
        throw new Error(`HTTP ${res.status}: ${msg || "Update failed"}`);
    }

    try {
        return await res.json();
    } catch {
        return full;
    }
}

