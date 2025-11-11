// cinema-frontend/src/utils/validators.ts
export const isEmail = (s: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s ?? "").trim());

export const normPostcode = (s: string) => (s ?? "").trim().toUpperCase();

export const normPhone = (s: string) =>
    (s ?? "").replace(/[^\d+()\s-]/g, "").trim();

export function validateCinema(f: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
}) {
    const e: Record<string, string> = {};
    if (!f.name?.trim()) e.name = "Name is required";
    if (f.email && !isEmail(f.email)) e.email = "Invalid email";
    if (f.postcode && normPostcode(f.postcode).length < 4)
        e.postcode = "Postcode looks too short";
    if (f.phone && normPhone(f.phone).length < 7)
        e.phone = "Phone looks too short";
    return e;
}
