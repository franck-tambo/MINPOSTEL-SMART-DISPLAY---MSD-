# MINPOSTEL Smart Display (MSD) - Version 1

> **Project Title:** Conception et développement d’un système intelligent de gestion et d’affichage dynamique des informations au sein du Ministère des Postes et Télécommunications.

---

## Overview

MINPOSTEL Smart Display (MSD) is a central digital signage management system engineered for the main entrance physical display screen of the Ministry of Posts and Telecommunications (MINPOSTEL).

It allows administrators to dynamically broadcast:
- Announcements (`📢`)
- Meetings (`📅`)
- Events (`🎉`)
- Staff Communications (`📰`)
- Urgent Messages (`🚨`)
- Media assets (`🖼️`)
- Building & Room information (`🏢`)

---

## Technical Stack

- **Frontend:** React 18, Vite, Lucide React, HTML5, Vanilla CSS3 (Custom Design System)
- **Backend:** Node.js, Express.js, Socket.IO, JWT Auth, Bcrypt
- **Database:** MySQL 8+ (`mysql2`)
- **Real-Time:** Socket.IO WebSocket Engine
- **QR Engine:** `qrcode` generation library

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 2. Database Setup
Create database and import schema & seed data:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 3. Environment Variables
Copy `.env.example` to `.env` and adjust database credentials:
```bash
cp .env.example .env
```

### 4. Installation
Install dependencies for both client and server:
```bash
npm run install:all
```

### 5. Running the Application
Start backend server:
```bash
npm run dev:server
```

Start frontend client:
```bash
npm run dev:client
```

Admin Dashboard will be available at: `http://localhost:5173`  
Public Screen Display will be available at: `http://localhost:5173/display/MINPOSTEL-MAIN-ENTRANCE-01`
