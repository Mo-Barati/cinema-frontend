// src/pages/BookingConfirmation.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
    movieTitle?: string;
    seatCount?: number;
}

const BookingConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;

    const movieTitle = state.movieTitle;
    const seatCount = state.seatCount ?? 0;

    return (
        <div className="booking-confirmation">
            <div className="booking-card">
                <h1 className="booking-title">Thank you for your booking</h1>

                {movieTitle && (
                    <p className="booking-text">
                        Your tickets for <strong>{movieTitle}</strong> have been reserved.
                    </p>
                )}

                {seatCount > 0 && (
                    <p className="booking-text">
                        Number of seats: <strong>{seatCount}</strong>
                    </p>
                )}

                <p className="booking-text">
                    Enjoy the movie!
                </p>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/')}
                >
                    Home
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;
