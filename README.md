# RUSH.EXE

> **{ SPEED.IS_EVERYTHING }**
> 
> *A high-fidelity terminal typing experience optimized for elite operators.*

## ░ OVERVIEW

**RUSH.EXE** is a tactical typing simulation built with Next.js and React 19. It challenges operators to neutralize incoming data streams (falling words) before they breach system boundaries. Featuring a deep Matrix-inspired aesthetic, real-time feedback loops, and a global leaderboard, it’s designed for those who live in the terminal.

## ░ KEY_FEATURES

### ⚡ NEURAL_LINK_STIMULATION
Immersive visual feedback system utilizing Matrix rain backgrounds, CRT scanlines, and digital particle effects. Every keystroke is a transaction; every word matched is a successful data harvest.

### 📊 DATA_HARVESTING_ENGINE
*   **Real-time Scoring**: Dynamic point calculation based on speed and combo multipliers.
*   **Combo System**: Chain successful captures to maximize your harvest potential.
*   **Wave Progression**: Experience escalating difficulty as system complexity increases.

### ⚙️ OPERATIONAL_MODES
Choose your infiltration level:
- **EASY**: Relaxed pace for system familiarization.
- **MEDIUM**: Balanced challenge for seasoned operators.
- **HARD**: Unforgiving speeds for elite data harvesters.

### 🌐 GLOBAL_UPLINK
Securely report your mission results to the global grid. Compete against other operators and track your personal performance metrics via our integrated Prisma/Postgres backend.

## ░ SYSTEM_ARCHITECTURE

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- **Styling**: Vanilla CSS with [Tailwind CSS 4](https://tailwindcss.com/) utilities
- **State**: React Hooks & Custom Terminal Feedback Engine

## ░ DEPLOYMENT_PROTOCOLS

### 1. CLONE_INTERFACE
```bash
git clone https://github.com/dhaanisi/rush.exe.git
cd rush.exe
```

### 2. INITIALIZE_DEPENDENCIES
```bash
npm install
```

### 3. CONFIGURE_UPLINK (Database)
Create a `.env` file with your connection strings:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rush_db"
```
Run migrations:
```bash
npx prisma db push
```

### 4. BOOT_SYSTEM
```bash
npm run dev
```
Open `http://localhost:3000` to begin the session.

## ░ PROJECT_LOGS

```text
app/
├── api/             # Secure Uplink Endpoints
├── components/      # Tactical UI Modules
│   ├── Game.tsx     # Mission Control
│   ├── MatrixRain.tsx# Environmental Simulation
│   └── Score.tsx    # Neural Feedback
└── globals.css      # System Styling
```

---

> // SYSTEM_STATUS: STABLE  
> // OPERATOR: REQUIRED  
> // ACCESS: GRANTED  
