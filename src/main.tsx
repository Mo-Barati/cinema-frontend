import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Showtimes from './pages/Showtimes.tsx'
import ShowtimeSeats from './pages/ShowtimeSeats.tsx'
import Cinemas from './pages/Cinemas.tsx'
import './index.css'
import BookingConfirmation from './pages/BookingConfirmation.tsx';




const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'showtimes', element: <Showtimes /> },
      { path: 'showtimes/:showtimeId/seats', element: <ShowtimeSeats /> },

      // 👉 new booking confirmation page
      { path: 'booking/confirmation', element: <BookingConfirmation /> },

      { path: 'cinemas', element: <Cinemas /> },
    ],

  },
])


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
