# Split Bill Backend API

A robust, production-ready backend system for the Split Bill application. Built with Node.js, Express.js, TypeScript, and MongoDB.

## Tech Stack
* **Language:** TypeScript / Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Realtime:** Socket.IO
* **Validation:** Zod
* **Authentication:** JWT (JSON Web Tokens)
* **Logging:** Winston + Morgan
* **Security:** Helmet, CORS, Express-Rate-Limit

## Features Implemented
* **Modular Architecture**: Clean separation of routes, controllers, services, and models.
* **Intelligent Shared Fund**: Strict rules apply to `GROUP_FUND` vs `MEMBER` hybrid payments. The group fund is automatically deducted.
* **Settlement Engine**: A custom calculation engine that ignores group-fund-covered amounts, maps member residual debts, and outputs an optimized settlement transaction graph (greedy minimization algorithm).
* **Real-time Sync**: Authenticated `Socket.io` connection with dedicated group rooms to broadcast `member:joined`, `fund:updated`, `bill:created`, and `settlement:updated` events.
* **Database Transactions**: Mongoose `$session` transactions ensure that creating an expense and deducting the group fund is 100% atomic.

## Startup Instructions

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Check the `.env` file to ensure the `MONGODB_URI` points to your active MongoDB Atlas cluster.
   
3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000` via `nodemon`.

### Docker Environment

To run the backend fully isolated via Docker:
```bash
docker-compose up --build -d
```

## Structure
```
src/
 ├── config/           (Database, Logger configs)
 ├── middlewares/      (Auth protection, Global Error Handling)
 ├── modules/
 │    ├── activities/  (Activity models)
 │    ├── auth/        (Registration, login)
 │    ├── bills/       (Expense models, Bill creation w/ Transactions)
 │    ├── groups/      (Group management, Fund Top-ups)
 │    ├── settlements/ (Settlement logic & Optimization)
 │    └── sockets/     (Real-time room broadcasting)
 ├── utils/            (Custom Error classes)
 ├── app.ts            (Express bootstrapping)
 └── server.ts         (HTTP & Socket.io server startup)
```
