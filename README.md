# 💸 SplitBill

**SplitBill** is a modern, premium, real-time web application designed to help friends, roommates, and travel groups track shared expenses, manage group funds, and settle debts efficiently without the hassle of manual math.

![SplitBill UI](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg)

## ✨ Features

- **Anonymous & Quick Authentication:** Jump straight into tracking expenses using simple, session-based anonymous logins. No email verification hurdles.
- **Real-Time Synchronization:** Powered by Socket.IO, when one member adds a bill, joins a group, or settles a debt, everyone's screen updates instantly without refreshing.
- **Smart Debt Optimization:** A built-in greedy algorithm automatically calculates and minimizes the number of transactions required to settle everyone's debts (e.g., if A owes B $10, and B owes C $10, it tells A to pay C $10).
- **Group Funds (Wallets):** Unlike traditional split apps, SplitBill allows groups to pool money together into a "Group Fund." Bills can then be paid fully or partially from this shared fund!
- **Flexible Bill Splitting:** Split expenses equally, by exact amounts, or by custom percentages.
- **Internationalization & Theming:** Full support for English & Vietnamese, dynamic currency switching (VND, USD, EUR), and a highly polished Light/Dark mode.
- **Premium UX/UI:** Beautiful glassmorphism UI, smooth Framer Motion micro-animations, and responsive mobile-first design.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (v4) + Headless UI concepts
- **State Management:** Zustand (for global UI/Auth state), TanStack Query (for server state & caching)
- **Real-time:** Socket.IO Client
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.IO Server
- **Validation:** Zod
- **Security & Auth:** JSON Web Tokens (JWT), bcrypt, helmet, express-rate-limit

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Cluster (e.g., MongoDB Atlas)

### 1. Backend Setup
Navigate to the backend directory and configure your environment:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with the following variables:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/SplitBill?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory:
```bash
cd Frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The app will now be running at `http://localhost:5173`!

---

## 🏗️ Project Structure

```text
SplitBill/
├── Backend/                 # Express REST API & Socket server
│   ├── src/
│   │   ├── config/          # Database & environment configurations
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── modules/         # Domain-driven feature modules (auth, bills, groups, settlements, users)
│   │   ├── sockets/         # Socket.io gateway and event handlers
│   │   └── utils/           # Custom error classes and utilities
│   └── package.json
└── Frontend/                # React Vite Application
    ├── src/
    │   ├── api/             # Axios client, TanStack Query keys, and API wrappers
    │   ├── components/      # Reusable UI components (Avatar, Card, Modal, Input, etc.)
    │   ├── layouts/         # Main layout shells
    │   ├── pages/           # Route pages (Dashboard, Groups, GroupDetail, Profile)
    │   ├── sockets/         # Socket client initialization
    │   ├── store/           # Zustand stores (useAppStore, useAuthStore)
    │   ├── types/           # Shared TypeScript DTOs
    │   └── utils/           # Formatters and mappers (mapMongoId)
    └── package.json
```

---

## 💡 Key Design Decisions
1. **Separation of State:** `Zustand` is used strictly for persistent local UI state (theme, language) and auth sessions, while `TanStack Query` acts as the single source of truth for asynchronous backend data.
2. **MongoDB ObjectId Mapping:** To decouple the frontend from database specifics, a custom `mapMongoId` utility automatically recursively maps MongoDB's `_id` fields to `id` across all outgoing/incoming Axios payloads.
3. **Optimistic Websockets:** When a user triggers an action (like adding a bill), the backend emits an event via Socket.IO. Connected frontend clients listen to these events and intelligently call `queryClient.invalidateQueries` to fetch the fresh data seamlessly in the background.

---

## 📜 License
This project is proprietary and built for educational and internal SaaS demonstration purposes.
