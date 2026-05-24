# Split Bill Backend API Specification

This document provides a comprehensive blueprint for implementing the backend of the Split Bill application. It bridges the existing React/TypeScript frontend implementation with a robust **Java 21 + Spring Boot + PostgreSQL** backend architecture.

---

## 1. System Overview

The Split Bill application is a collaborative financial tool designed to help groups track shared expenses, manage a common group fund, and optimize final debt settlements.

### Core Modules:
1. **User Management**: Anonymous session support (avatar/color) & registered users.
2. **Group Management**: Shared workspaces with invite codes, tracking members and a collective "Group Fund".
3. **Expense (Bill) Management**: Tracking expenses with hybrid payment sources (Fund vs. Member) and varied splitting logic (Equal, Percentage, Exact).
4. **Fund Management**: A shared wallet system prioritized to cover group expenses automatically.
5. **Settlement & Activity**: Real-time activity feeds and an optimized algorithm to minimize member-to-member debt transfers.

---

## 2. Entity Analysis & Modeling

Based on the frontend TypeScript interfaces, the backend entities should be mapped as follows:

### `User`
*   `id` (UUID, PK)
*   `name` (String, Required)
*   `email` (String, Unique, Optional)
*   `avatarUrl` (String, Optional)
*   `avatarColor` (String, Optional) - Fallback for anonymous users
*   `phone` (String, Optional)

### `Group`
*   `id` (UUID, PK)
*   `name` (String, Required)
*   `description` (Text, Optional)
*   `inviteCode` (String, Unique, Indexed, 6-chars)
*   `createdBy` (UUID, FK -> User)
*   `category` (Enum: `TRIP`, `HOME`, `COUPLE`, `OFFICE`, `OTHER`)
*   `fundBalance` (BigDecimal, Default 0) - Optimistic locking recommended.
*   `createdAt`, `updatedAt` (Timestamps)

### `GroupMember` (Join Table)
*   `groupId` (UUID, FK -> Group, PK)
*   `userId` (UUID, FK -> User, PK)
*   `joinedAt` (Timestamp)

### `FundTransaction`
*   `id` (UUID, PK)
*   `groupId` (UUID, FK -> Group)
*   `userId` (UUID, FK -> User)
*   `amount` (BigDecimal, Required)
*   `note` (String, Optional)
*   `createdAt` (Timestamp)

### `Expense` (Bill)
*   `id` (UUID, PK)
*   `groupId` (UUID, FK -> Group)
*   `title` (String, Required)
*   `amount` (BigDecimal, Required)
*   `splitType` (Enum: `EQUAL`, `PERCENTAGE`, `EXACT`, `ITEM`)
*   `category` (String)
*   `notes` (Text, Optional)
*   `createdBy` (UUID, FK -> User)
*   `createdAt` (Timestamp)

### `PaymentSource`
*   `id` (UUID, PK)
*   `expenseId` (UUID, FK -> Expense)
*   `type` (Enum: `GROUP_FUND`, `MEMBER`)
*   `memberId` (UUID, FK -> User, Nullable - Required if type is MEMBER)
*   `amount` (BigDecimal, Required)

### `ExpenseSplit`
*   `id` (UUID, PK)
*   `expenseId` (UUID, FK -> Expense)
*   `userId` (UUID, FK -> User)
*   `amount` (BigDecimal, Required)
*   `percentage` (BigDecimal, Nullable)

### `Activity`
*   `id` (UUID, PK)
*   `groupId` (UUID, FK -> Group)
*   `type` (Enum: `EXPENSE_ADD`, `EXPENSE_DELETE`, `SETTLEMENT`, `GROUP_CREATE`, `MEMBER_JOINED`, `FUND_ADDED`)
*   `userId` (UUID, FK -> User)
*   `details` (JSONB) - Storing unstructured snapshot data (e.g., `{ "expenseTitle": "Dinner", "amount": 200 }`)
*   `timestamp` (Timestamp)

---

## 3. Database Schema Proposal (PostgreSQL)

A relational database is strongly recommended due to the strict ACID requirements of financial transactions and debt settlements.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_color VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id),
    category VARCHAR(50),
    fund_balance DECIMAL(15, 2) DEFAULT 0.00,
    version INT DEFAULT 0, -- For JPA @Version Optimistic Locking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    group_id UUID REFERENCES groups(id),
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    split_type VARCHAR(20) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_sources (
    id UUID PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'GROUP_FUND' or 'MEMBER'
    member_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL
);

CREATE TABLE expense_splits (
    id UUID PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    percentage DECIMAL(5, 2)
);
```

> **Normalization Notes:** Storing `details` in `Activity` as a `JSONB` column provides the flexibility to log context without rigid schemas. 

---

## 4. API Endpoint Specification

### Auth & Users
*   **POST** `/api/v1/auth/register` - Create user/anonymous session.
*   **GET** `/api/v1/users/me` - Get current user profile.

### Groups
*   **POST** `/api/v1/groups` - Create a group.
*   **GET** `/api/v1/groups/{id}` - Get group details (includes members, total expenses).
*   **POST** `/api/v1/groups/join` - Join via `inviteCode`.

### Group Funds
*   **POST** `/api/v1/groups/{id}/fund` - Add initial fund/top-up.
*   **GET** `/api/v1/groups/{id}/fund/history` - Get paginated list of `FundTransaction`.

### Expenses (Bills)
*   **POST** `/api/v1/groups/{id}/expenses` - Create a bill (validates `paymentSources` & deducts fund).
*   **GET** `/api/v1/groups/{id}/expenses` - List group bills.
*   **DELETE** `/api/v1/groups/{id}/expenses/{expenseId}` - Delete bill (restores fund balance, removes splits).

### Settlements & Balances
*   **GET** `/api/v1/groups/{id}/balances` - Returns `GroupBalanceSummary` (total owed, you owe, individual balances).
*   **GET** `/api/v1/groups/{id}/settlements/optimized` - Returns suggested optimized transaction graph.
*   **POST** `/api/v1/groups/{id}/settlements` - Mark debt as paid.

---

## 5. Business Logic Rules

### Rule 1: Shared Group Fund Priority
When creating a bill, if `paymentSources` includes `GROUP_FUND`, the backend must heavily validate this:
1. Lock the `Group` row (or use optimistic locking).
2. Check if `group.fundBalance >= paymentSource.amount`.
3. If valid, deduct `paymentSource.amount` from `group.fundBalance`.
4. If the bill is deleted later, the backend MUST refund the exact `GROUP_FUND` amount back to the group's `fundBalance`.

### Rule 2: Settlement Optimization & Debt Generation
*Money paid by the group fund does NOT create personal creditor relationships.*
The backend balance calculation engine must calculate debt as follows:
1. `Total Bill = 100`
2. `GROUP_FUND paid = 60` (60%)
3. `MEMBER (User A) paid = 40` (40%)
4. For every participant's split, multiply their split amount by the **member-paid ratio** `(40 / 100 = 0.4)`.
5. If User B's raw split is 50, their actual debt to User A is `50 * 0.4 = 20`. 

### Rule 3: Split Validation
When receiving an `Expense`:
*   `EQUAL`: Ensure `splits` are exactly equal (allowing for 1 cent rounding differences).
*   `PERCENTAGE`: Ensure `sum(percentages) == 100.00`.
*   `EXACT`: Ensure `sum(split.amount) == expense.amount`.

---

## 6. Authentication & Authorization

*   **Authentication**: JWT-based stateless auth. Since the app supports anonymous users, issue a JWT containing a generic `userId` upon initial entry (even without email/password).
*   **Authorization (@PreAuthorize)**:
    *   `@PreAuthorize("@securityService.isMember(#groupId)")` - For viewing expenses, balances, creating bills.
    *   `@PreAuthorize("@securityService.isOwner(#groupId)")` - For modifying the group details, or **adding group funds**. (The frontend assumes only the owner can top-up the fund).

---

## 7. Backend Architecture Suggestion (Spring Boot)

Leverage Java 21 features (Records, Virtual Threads) and a standard layered architecture.

```text
src/main/java/com/splitbill
├── config/           # SecurityConfig, CorsConfig
├── controller/       # GroupController, ExpenseController
├── dto/              # Record-based request/response payloads
│   ├── request/      # CreateExpenseRequest, AddFundRequest
│   └── response/     # GroupDetailResponse, BalanceSummaryResponse
├── entity/           # JPA @Entity classes
├── exception/        # GlobalExceptionHandler, InsufficientFundException
├── mapper/           # MapStruct interfaces (Entity <-> DTO)
├── repository/       # Spring Data JPA interfaces
├── security/         # JwtFilter, SecurityService
└── service/          # Business logic
    ├── GroupService
    ├── ExpenseService
    └── BalanceCalculationService
```

---

## 8. DTO Recommendations

Using Java 16+ `record` for immutability and concise syntax.

```java
// CreateExpenseRequest.java
public record CreateExpenseRequest(
    @NotBlank String title,
    @Positive BigDecimal amount,
    @NotNull SplitType splitType,
    @NotBlank String category,
    @NotEmpty List<PaymentSourceDto> paymentSources,
    @NotEmpty List<ExpenseSplitDto> splits
) {}

// PaymentSourceDto.java
public record PaymentSourceDto(
    @NotNull PaymentSourceType type,
    UUID memberId, // Nullable for GROUP_FUND
    @Positive BigDecimal amount
) {}

// AddFundRequest.java
public record AddFundRequest(
    @Positive BigDecimal amount,
    String note
) {}
```

---

## 9. State & API Mapping

| Frontend Component | State Action | Required Backend API |
| :--- | :--- | :--- |
| `CreateBillFlow.tsx` | `addExpense()` | `POST /api/v1/groups/{id}/expenses` |
| `GroupDetail.tsx` (Mount) | *N/A (Load Data)* | `GET /api/v1/groups/{id}` <br/> `GET /api/v1/groups/{id}/expenses` |
| `GroupFundCard.tsx` | `addFund()` | `POST /api/v1/groups/{id}/fund` |
| `FundHistoryTab.tsx` | *N/A (Load Data)* | `GET /api/v1/groups/{id}/fund/history` |
| `Settlements Tab` | `settleDebt()` | `POST /api/v1/groups/{id}/settlements` |

---

## 10. Missing Backend Requirements (Crucial for Production)

The frontend currently uses synchronous, local state (Zustand). Moving to a backend introduces new edge cases:

1.  **Concurrency / Optimistic Locking**: 
    If two users add a bill simultaneously that drains the group fund, a race condition occurs. Use `@Version` in JPA on the `Group` entity to throw an `OptimisticLockException` and prevent the fund from going negative.
2.  **Database Transactions**:
    `addExpense` must be wrapped in `@Transactional`. If saving the `PaymentSources` succeeds but saving `ExpenseSplits` fails, the `GroupFund` deduction must roll back.
3.  **Real-time Updates**:
    The frontend relies heavily on instant state updates. Implementing **WebSockets / Server-Sent Events (SSE)** for the `/activity` feed and balance changes is highly recommended to keep multiple clients in sync without polling.
4.  **Pagination & Archiving**:
    The frontend currently loads all expenses at once. The backend should implement Spring Data Pageable (`?page=0&size=20`) for the `/expenses` and `/fund/history` endpoints to prevent performance bottlenecks.
