# Cinema Ticket Booking — Frontend (React + Vite + TypeScript)

A responsive frontend interface for browsing and managing cinema showtimes, connected to the Spring Boot backend.

---

## Tech Stack
- React 18  
- TypeScript  
- Vite  
- React Router DOM  
- Fetch API  
- Node.js + npm

---

## Features
- Load showtimes by cinema ID  
- Search showtimes by movie title  
- Create and delete showtimes  
- Routing for multiple pages (Home, Showtimes, Cinemas)  
- Environment-based API configuration via `.env`  
- Connected to backend REST API (`http://localhost:8080`)

---

## Getting Started

### 1️⃣ Install dependencies 
```bash
npm install

## 2️⃣ Run the dev server
npm run dev


## 3️⃣ Access in browser
http://localhost:5173

Environment Variables
- Create a .env file at the project root:
- VITE_API_BASE_URL=http://localhost:8080

Project Structure
src/
 ├─ pages/
 │   ├─ Home.tsx
 │   ├─ Showtimes.tsx  # main UI for CRUD operations
 │   └─ Cinemas.tsx
 ├─ components/
 │   └─ NavBar.tsx     # navigation bar with routing
 ├─ App.tsx            # layout + Outlet
 └─ main.tsx           # router setup

Backend Repository
- Cinema Booking Backend (Spring Boot + MySQL)