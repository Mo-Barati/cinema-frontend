// src/pages/ShowtimeSeats.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchSeatMap, bookSeats } from '../api/showtimes';
import type { SeatStatusDto } from '../types/seat';

interface LocationState {
    movieTitle?: string;
    cinemaName?: string;
    screenNumber?: number;
}

const ShowtimeSeats: React.FC = () => {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;

    const [seats, setSeats] = useState<SeatStatusDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

    const numericId = showtimeId ? Number(showtimeId) : NaN;

    const rows = useMemo(() => {
        const byRow: Record<string, SeatStatusDto[]> = {};
        seats.forEach((seat) => {
            if (!byRow[seat.rowLabel]) {
                byRow[seat.rowLabel] = [];
            }
            byRow[seat.rowLabel].push(seat);
        });

        // sort seats inside each row by seatNumber
        Object.keys(byRow).forEach((row) => {
            byRow[row].sort((a, b) => a.seatNumber - b.seatNumber);
        });

        // sort row labels alphabetically
        return Object.entries(byRow).sort(([a], [b]) => a.localeCompare(b));
    }, [seats]);

    const loadSeatMap = async () => {
        if (!numericId || Number.isNaN(numericId)) return;
        try {
            setLoading(true);
            setError(null);
            const data = await fetchSeatMap(numericId);
            setSeats(data);
            setSelectedSeatIds([]);
        } catch (err: any) {
            setError(err.message || 'Failed to load seat map');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSeatMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showtimeId]);

    const toggleSeatSelection = (seat: SeatStatusDto) => {
        if (seat.status === 'BOOKED') return; // cannot select booked seats

        setSelectedSeatIds((prev) => {
            if (prev.includes(seat.seatId)) {
                return prev.filter((id) => id !== seat.seatId);
            }
            return [...prev, seat.seatId];
        });
    };

    const handleBook = async () => {
        if (!numericId || Number.isNaN(numericId)) return;
        if (selectedSeatIds.length === 0) {
            setError('Please select at least one seat.');
            return;
        }
        try {
            setBooking(true);
            setError(null);
            setSuccess(null);

            await bookSeats(numericId, selectedSeatIds);

            // after successful booking, go to confirmation page
            navigate('/booking/confirmation', {
                state: {
                    movieTitle: state.movieTitle,
                    seatCount: selectedSeatIds.length,
                },
            });
        } catch (err: any) {
            setError(err.message || 'Failed to book seats');
        } finally {
            setBooking(false);
        }
    };


    const title = state.movieTitle || 'Seat Map';
    const cinemaName = state.cinemaName || '';
    const screenLabel =
        state.screenNumber != null ? `Screen ${state.screenNumber}` : 'Screen';

    return (
        <div className="seat-page">
            <div className="seat-page-header">
                <button className="btn-secondary" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <div className="seat-page-title">
                    <h2>{title}</h2>
                    {cinemaName && <p className="seat-page-subtitle">{cinemaName}</p>}
                </div>
            </div>

            <div className="seat-screen-banner">{screenLabel}</div>

            {loading ? (
                <p>Loading seats...</p>
            ) : error ? (
                <p className="seat-error">{error}</p>
            ) : (
                <>
                    <div className="seat-grid">
                        {rows.map(([rowLabel, rowSeats]) => (
                            <div key={rowLabel} className="seat-row">
                                <div className="seat-row-label">{rowLabel}</div>
                                <div className="seat-row-seats">
                                    {rowSeats.map((seat) => {
                                        const isSelected = selectedSeatIds.includes(seat.seatId);
                                        const isBooked = seat.status === 'BOOKED';

                                        const className = [
                                            'seat',
                                            isBooked ? 'seat-booked' : 'seat-free',
                                            isSelected && !isBooked ? 'seat-selected' : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ');

                                        return (
                                            <button
                                                key={seat.seatId}
                                                type="button"
                                                className={className}
                                                disabled={isBooked}
                                                onClick={() => toggleSeatSelection(seat)}
                                            >
                                                {seat.rowLabel}
                                                {seat.seatNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="seat-legend">
                        <span className="legend-item">
                            <span className="seat legend seat-free" /> Available
                        </span>
                        <span className="legend-item">
                            <span className="seat legend seat-selected" /> Selected
                        </span>
                        <span className="legend-item">
                            <span className="seat legend seat-booked" /> Booked
                        </span>
                    </div>

                    <div className="seat-actions">
                        <span>
                            Selected seats:{' '}
                            {selectedSeatIds.length > 0
                                ? selectedSeatIds.length
                                : 'none'}
                        </span>
                        <button
                            className="btn-primary"
                            onClick={handleBook}
                            disabled={booking || selectedSeatIds.length === 0}
                        >
                            {booking ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </div>

                    {success && <p className="seat-success">{success}</p>}
                </>
            )}
        </div>
    );
};

export default ShowtimeSeats;
