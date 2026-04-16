# My Philosphy & stack used

- I focus on projects struture each

# Tapin Order Dashboard

A modern, real-time order management dashboard for venue operators built with React, TypeScript, and Ant Design.

## Overview

This project is a technical assessment demonstrating production-grade React development with proper component architecture, TypeScript patterns, state management, and testing practices.

## Features

### Part 1: Component Architecture ✅

- **OrderDashboard**: Main container component managing global state and layout
- **FilterBar**: Status filter dropdown with refresh functionality
- **OrderCard**: Individual order display with status management
- Clean separation of concerns with proper prop drilling and type safety
- Loading, empty, and error states handled throughout
- Responsive grid layout using Ant Design's Grid system

### Part 2: State & Data Flow ✅

- **Custom Hook (`useOrders`)**: Encapsulates all data fetching and mutation logic
  - Automatic data fetching on mount and filter changes
  - Optimistic UI updates for status changes
  - Rollback mechanism on API failure
  - Centralized error handling
- **Type Safety**: End-to-end TypeScript with strict typing
  - API contract types (`Order`, `OrderStatus`, `OrdersResponse`)
  - Component prop interfaces
  - Hook return types
  - No `any` types used

### Part 3: Testing ✅ (Option B)

- **Testing Framework**: Vitest with React Testing Library
- **Hook Tests** (`useOrders.test.ts`):
  - Initial data fetching
  - Filter state management
  - Optimistic updates with success case
  - Rollback on failure (most important test)
  - Error handling
- **Component Tests** (`OrderDashboard.test.tsx`):
  - Rendering with data
  - Statistics display
  - Status filtering
  - Empty states
  - Error states
- **Mocking**: API layer mocked to test business logic in isolation

## Tech Stack

- **React 19** with TypeScript 6
- **Vite 8** for fast development and building
- **Ant Design** for UI components
- **Tailwind CSS v3** for utility-first styling
- **Zustand** for global state management
- **React Query (TanStack Query)** for server state & API calls
- **date-fns** for date formatting
- **react-tooltip** for accessible tooltips
- **Vitest** + React Testing Library for testing

## Project Structure

```
src/
├── api/
│   └── orders.ts           # Mock API implementation
├── components/
│   ├── OrderDashboard.tsx  # Main dashboard container
│   ├── OrderCard.tsx       # Individual order card
│   └── FilterBar.tsx       # Filter controls
├── hooks/
│   └── useOrdersQuery.ts   # React Query hooks for API calls
├── store/
│   └── orderFiltersStore.ts # Zustand store for filter state
├── types/
│   └── order.ts            # TypeScript interfaces
└── test/
    ├── setup.ts
    ├── useOrdersQuery.test.tsx
    └── OrderDashboard.test.tsx
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Build

```bash
npm run build
npm run preview
```

## Key Design Decisions

### 1. Component Architecture

- **Separation of Concerns**: Each component has a single responsibility
- **Composition over Configuration**: Components accept simple props rather than complex configuration objects
- **Controlled Components**: Parent manages state, children receive props and emit events

### 2. State Management

- **React Query for Server State**: All API calls handled by React Query hooks
  - Automatic caching and refetching
  - Optimistic updates with rollback
  - Built-in loading and error states
- **Zustand for Client State**: Global filter state management
  - Minimal boilerplate
  - TypeScript-first API
  - No context providers needed
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on failure
  - Better UX - users see instant results
  - Network errors don't block the UI
  - React Query handles rollback automatically

### 3. TypeScript Strategy

- **Strict Mode**: All types are explicit and compile-time safe
- **No Type Assertions**: Proper type guards instead of `as` casts
- **Discriminated Unions**: `OrderStatus` type provides exhaustive checking
- **Interface over Type**: Using `interface` for object shapes as per requirements

### 4. API Layer

- **Mock Implementation**: Simulates real API with delays and occasional failures
- **Realistic Data**: 8 mock orders with various states and timestamps
- **Error Simulation**: 10% failure rate to test error handling
- **Stateful**: Mutations persist in memory during session

### 5. Testing Strategy

- **Unit Tests for Hooks**: React Query hooks tested in isolation
- **Integration Tests for Component**: User interactions tested end-to-end
- **Mocked API**: Tests don't depend on network or external services
- **Focused Coverage**: Most critical paths covered (optimistic update + rollback)

## What I'd Do With More Time

### Real-time Updates (Part 3, Option A)

If implementing WebSocket/SSE for real-time updates:

```typescript
// In useOrders hook
useEffect(() => {
  const ws = new WebSocket("ws://api.tapin.app/orders");

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);

    if (update.type === "ORDER_CREATED" || update.type === "ORDER_UPDATED") {
      // Merge new order into existing state
      setState((prev) => ({
        ...prev,
        orders: mergeOrder(prev.orders, update.order),
      }));
    }
  };

  return () => ws.close();
}, []);
```

**Benefits**:

- Dashboard updates automatically when kitchen updates orders
- No polling overhead
- Real-time collaboration between staff members

**Considerations**:

- Need reconnection logic for dropped connections
- Need to handle message ordering and conflicts
- Consider using a library like Socket.IO for reliability

### Performance Optimization (Part 3, Option C)

For 500+ orders per shift:

1. **Virtual Scrolling**:

   ```typescript
   import { FixedSizeGrid } from 'react-window';

   <FixedSizeGrid
     columnCount={4}
     columnWidth={300}
     height={800}
     rowCount={Math.ceil(orders.length / 4)}
     rowHeight={200}
     width={1200}
   >
     {OrderCardRenderer}
   </FixedSizeGrid>
   ```

2. **Memoization**:

   ```typescript
   const OrderCard = React.memo(
     ({ order, onStatusUpdate }) => {
       // Component implementation
     },
     (prev, next) => {
       return (
         prev.order.id === next.order.id &&
         prev.order.status === next.order.status &&
         prev.order.updatedAt === next.order.updatedAt
       );
     },
   );
   ```

3. **Pagination/Infinite Scroll**:
   - Load 20-30 orders at a time
   - Implement "Load More" button or intersection observer
   - Keep active orders (pending/preparing/ready) always visible

4. **Debouncing/Throttling**:
   - Debounce filter changes to avoid excessive API calls
   - Throttle real-time updates to batch UI renders

### Additional Enhancements

1. **Advanced Filtering**:
   - Date range picker
   - Guest name search
   - Total amount range
   - Multiple status selection

2. **Sorting**:
   - By creation time (oldest first for urgent orders)
   - By total amount
   - By guest name

3. **Bulk Actions**:
   - Select multiple orders
   - Batch status updates
   - Print multiple receipts

4. **Analytics Dashboard**:
   - Average preparation time
   - Revenue by time of day
   - Popular items
   - Order completion rate

5. **Notifications**:
   - Browser notifications for new orders
   - Sound alerts for pending orders > 15 minutes
   - Desktop notifications using Notification API

6. **Accessibility**:
   - Keyboard navigation (Tab, Arrow keys, Enter)
   - Screen reader announcements for status changes
   - High contrast mode
   - Focus indicators

7. **Offline Support**:
   - Service worker for caching
   - Queue mutations when offline
   - Sync when connection restored

8. **Error Boundaries**:
   - Catch rendering errors
   - Show fallback UI
   - Log errors to monitoring service

9. **Animation**:
   - Smooth status transitions
   - New order slide-in animation
   - Loading skeletons instead of spinners

## API Contract Implementation

The mock API follows the exact contract specified in the requirements:

```typescript
// GET /api/orders?status={status}&page={n}
ordersApi.getOrders(status, page, pageSize)
  -> { orders: Order[], total: number, page: number, pageSize: number }

// PATCH /api/orders/:id { status: OrderStatus }
ordersApi.updateOrderStatus(id, { status })
  -> Order
```

All fields match the spec:

- `id`: string
- `guestName`: string
- `items`: { name, quantity, price }[]
- `status`: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
- `createdAt`: ISO 8601 string
- `updatedAt`: ISO 8601 string
- `total`: number in cents

## Known Tradeoffs

1. **No Real Backend**: Mock API simulates network delays but doesn't persist data between sessions
2. **No Authentication**: In production, would need auth tokens and role-based access
3. **No Validation**: In production, would use Zod schemas to validate API responses
4. **Basic Error Messages**: Would want more specific error types and user-friendly messages
5. **No Retry Logic**: Failed requests don't automatically retry
6. **No Request Cancellation**: Stale requests aren't aborted when filters change
7. **CSS Framework Mixing**: Using both Tailwind and Ant Design styles (generally pick one)

## Time Breakdown

- Setup (Vite, dependencies, config): ~5 min
- Types & API layer: ~8 min
- `useOrders` hook: ~10 min
- Components (Dashboard, Card, FilterBar): ~20 min
- Testing setup & tests: ~12 min
- README & documentation: ~5 min

**Total**: ~60 minutes

## Questions for the Team

1. **Real-time Updates**: What's the expected latency for order updates? Should we use WebSocket, SSE, or polling?
2. **Scale**: How many concurrent venues? Is multi-tenancy needed?
3. **Mobile**: Is a mobile app planned, or responsive web only?
4. **Integrations**: Any POS or kitchen display integrations needed?
5. **Permissions**: Do different staff roles see different order information?

## Author

Built for Tapin's React Technical Assessment

---

**Note**: This is assessment code. In production, I would add:

- More comprehensive error boundaries
- Structured logging (Sentry, LogRocket)
- Performance monitoring (Lighthouse CI, Web Vitals)
- E2E tests (Playwright)
- Storybook for component documentation
- Husky pre-commit hooks for linting/testing
