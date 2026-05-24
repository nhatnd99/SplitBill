# Frontend API Integration Guide

This document is a comprehensive guide to migrating the frontend of **SplitBill** from static mock data to real API calls communicating with the Node.js backend. 

---

## 1. API Base Configuration

The backend is running on `localhost:5000` (or `PORT` defined in `.env`). The API base URL is `/api/v1`. 

### Axios Setup
Create an Axios instance to handle requests, timeouts, and auth headers automatically.

```typescript
// src/api/axios.ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // Example zustand store

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., token expired)
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Authentication Flow

The backend uses JWT tokens for authentication. Tokens are valid for 1 hour by default.

### Endpoints
* **Register**: `POST /auth/register`
* **Login**: `POST /auth/login`
* **Get Me**: `GET /auth/me`

### Expected Flow
1. User logs in -> Receive `token` and `user` object.
2. Store `token` in Zustand store (persisted to `localStorage`).
3. Use the token for all subsequent requests via Axios interceptor.

**Example Response (Login/Register):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "data": {
    "user": {
      "id": "645...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarColor": "#FF5733"
    }
  }
}
```

---

## 3. Full API Endpoint Summary

### Auth (`/api/v1/auth`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user profile | Yes |

### Groups (`/api/v1/groups`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/` | Create a new group | Yes |
| GET | `/:id` | Get group details (includes members) | Yes |
| POST | `/join` | Join group via `inviteCode` | Yes |
| POST | `/:id/fund` | Add money to Group Fund (Owner only) | Yes |

### Bills / Expenses (`/api/v1/groups/:groupId/expenses`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/` | Create a new bill/expense | Yes |
| GET | `/` | Get all expenses for a group | Yes |
| DELETE | `/:expenseId` | Delete an expense | Yes |

### Settlements (`/api/v1/groups/:groupId/balances` & `/groups/:groupId/settlements`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/balances` | Get raw balances & optimized transactions | Yes |
| POST | `/settlements`| Record a settlement payment | Yes |

---

## 4. Frontend Service Mapping

### Before (Mocked)
```typescript
import { getGroupMock, getExpensesMock } from '@/mocks/groupService';

const fetchGroupData = async () => {
   const group = await getGroupMock(groupId);
   setGroup(group);
}
```

### Replace With (Real API)
Remove mock files. Replace with typed API calls.

```typescript
// src/api/groupService.ts
import { api } from './axios';
import { Group, Expense } from '@/types';

export const getGroup = async (groupId: string): Promise<Group> => {
  const { data } = await api.get(`/groups/${groupId}`);
  return data.data.group;
};

export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const { data } = await api.get(`/groups/${groupId}/expenses`);
  return data.data.expenses;
};
```

---

## 5. React Query Integration (Recommended)

Using **TanStack Query (React Query)** is highly recommended to manage caching, loading states, and realtime invalidations.

**Query Keys Setup:**
```typescript
export const queryKeys = {
  user: ['user'] as const,
  group: (id: string) => ['group', id] as const,
  expenses: (groupId: string) => ['expenses', groupId] as const,
  balances: (groupId: string) => ['balances', groupId] as const,
};
```

**Fetching Group Details:**
```tsx
const { data: group, isLoading } = useQuery({
  queryKey: queryKeys.group(groupId),
  queryFn: () => getGroup(groupId),
});
```

**Optimistic Updates & Invalidation:**
```tsx
const createExpenseMutation = useMutation({
  mutationFn: (newExpense) => api.post(`/groups/${groupId}/expenses`, newExpense),
  onSuccess: () => {
    // Invalidate expenses and balances to refetch
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) }); // Update group fund/totals
  }
});
```

---

## 6. Socket.IO Integration

The backend emits realtime events to keep clients synced.

### Connection Setup
```typescript
// src/sockets/socket.ts
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

export const connectSocket = () => {
  const token = useAuthStore.getState().token;
  const socket = io(import.meta.env.VITE_API_URL.replace('/api/v1', '') || 'http://localhost:5000', {
    auth: { token }
  });
  return socket;
};
```

### Events & Handlers
When a user opens the `GroupDetail` page, join the room.
```tsx
useEffect(() => {
  const socket = connectSocket();
  socket.emit('join:group', groupId);

  socket.on('member:joined', (data) => {
    toast(`${data.userName} joined the group!`);
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
  });

  socket.on('fund:updated', (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
  });

  socket.on('bill:created', (expense) => {
    // Optimistic cache update or invalidation
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) });
  });

  socket.on('bill:deleted', () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) });
  });

  socket.on('settlement:updated', () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) });
  });

  return () => {
    socket.emit('leave:group', groupId);
    socket.disconnect();
  };
}, [groupId]);
```

---

## 7. Mock Data Replacement Plan

1. **Delete Mocks**: Remove all static arrays in frontend (e.g., `mockUsers.ts`, `mockGroups.ts`).
2. **Auth First**: Implement the Login/Register screens connecting to real endpoints. Save JWT.
3. **Dashboard**: Fetch user's groups (Note: the backend currently returns group by ID, you might need an endpoint `/groups` to get all groups for a user, or fetch them based on user ID. *Ensure backend has this endpoint, if not, it needs to be added*).
4. **Group Detail Page**: 
   - Replace mock `group` with `GET /groups/:id`
   - Replace mock `expenses` with `GET /groups/:groupId/expenses`
   - Replace mock `balances` with `GET /groups/:groupId/balances`

---

## 8. Required Frontend Refactors

* **Async State Handling**: Replace synchronous data reads with `isLoading` and `isError` states from React Query.
* **Loading Skeletons**: Show skeleton loaders while `isLoading` is true.
* **Authentication Persistence**: Wrap the app in an Auth Guard component that redirects to `/login` if `!token`.
* **Form Validation**: Ensure frontend Zod schemas match the backend Zod schemas closely (e.g., `amount` must be positive, `splitType` must be exact).

---

## 9. DTO & TypeScript Type Sync

Create a `src/types/api.ts` file to mirror backend models exactly:

```typescript
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface GroupDTO {
  _id: string;
  name: string;
  description?: string;
  category: string;
  inviteCode: string;
  members: UserDTO[];
  createdBy: string;
  totalExpense: number;
  fundBalance: number;
  fundHistory: any[];
}

export interface ExpenseDTO {
  _id: string;
  groupId: string;
  title: string;
  amount: number;
  paymentSources: {
    type: 'GROUP_FUND' | 'MEMBER';
    memberId?: string;
    amount: number;
  }[];
  splitType: 'equal' | 'percentage' | 'exact' | 'item';
  splits: {
    userId: string;
    amount: number;
    percentage?: number;
  }[];
  category: string;
  createdBy: string;
  date: string;
}
```

---

## 10. Error Handling Strategy

Backend errors return in this format:
```json
{
  "status": "fail",
  "message": "Insufficient group fund balance"
}
```

**Toast Notification Wrapper:**
```tsx
import { toast } from 'react-hot-toast';

export const handleApiError = (error: any) => {
  const message = error.response?.data?.message || 'An unexpected error occurred';
  toast.error(message);
};

// In Mutation:
useMutation({
  mutationFn: addExpense,
  onError: handleApiError
})
```

---

## 11. File Structure Suggestion

```txt
src/
 ├── api/
 │   ├── axios.ts         # Axios instance & interceptors
 │   ├── auth.api.ts      # Login/Register endpoints
 │   ├── groups.api.ts    # Group & fund endpoints
 │   └── bills.api.ts     # Expenses & settlement endpoints
 ├── hooks/
 │   ├── queries/         # React Query useQuery hooks
 │   └── mutations/       # React Query useMutation hooks
 ├── sockets/
 │   └── useGroupSocket.ts # Custom hook for socket events
 ├── store/
 │   └── useAuthStore.ts  # Zustand store for JWT and User info
 ├── types/
 │   └── index.ts         # Shared DTOs
 └── components/
     └── ...
```

---

## 12. Example API Calls

### Create Expense (Hybrid Payment)
```tsx
const newExpense = {
  title: "Dinner",
  amount: 100,
  paymentSources: [
    { type: "GROUP_FUND", amount: 50 }, // 50 from fund
    { type: "MEMBER", memberId: "645...", amount: 50 } // 50 paid by user
  ],
  splitType: "equal",
  splits: [
    { userId: "645...", amount: 50 },
    { userId: "789...", amount: 50 }
  ],
  category: "food"
};

await api.post(`/groups/${groupId}/expenses`, newExpense);
```

### Settle Debt
```tsx
await api.post(`/groups/${groupId}/settlements`, {
  recipientId: "789...",
  amount: 25.50
});
```

---

## 13. Group Detail Integration

The Group Detail page is the core of the app. It must coordinate multiple endpoints and socket events.

**On Mount:**
1. Call `GET /groups/:id` -> populate Group Header, Fund Balance, and Members list.
2. Call `GET /groups/:groupId/expenses` -> populate Recent Activity / Bills list.
3. Call `GET /groups/:groupId/balances` -> populate "Who owes who" section.
4. Establish Socket.IO connection and join room.

**On State Refresh (Socket Trigger):**
When a `bill:created` event fires over sockets, immediately trigger:
```ts
queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) })
queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) })
queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) }) // fund might have changed
```
This ensures the dashboard recalculates debts perfectly in real-time without the user refreshing the page.
