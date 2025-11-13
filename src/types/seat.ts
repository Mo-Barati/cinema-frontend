// src/types/seat.ts
export type SeatStatus = 'FREE' | 'BOOKED';

export interface SeatStatusDto {
    seatId: number;
    rowLabel: string;
    seatNumber: number;
    status: SeatStatus;
}
