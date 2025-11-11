// src/types/cinema.ts
export interface Cinema {
    id: number;
    name: string;
    address?: string;       // <-- use this as the canonical field in the UI
    city?: string;
    postcode?: string;
    phone?: string;
    email?: string;
}
