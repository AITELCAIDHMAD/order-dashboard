import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ordersApi } from '../features/order-feature/api/orders';
import { OrderDashboard } from '../features/order-feature/components/OrderDashboard';

vi.mock('../api/orders');

const mockOrders = [
  {
    id: '1',
    guestName: 'John Doe',
    items: [{ name: 'Pizza', quantity: 1, price: 1000 }],
    status: 'pending' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    total: 1000,
  },
  {
    id: '2',
    guestName: 'Jane Smith',
    items: [{ name: 'Burger', quantity: 2, price: 1500 }],
    status: 'preparing' as const,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    total: 3000,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OrderDashboard Component (React Query)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ordersApi.getOrders).mockResolvedValue({
      orders: mockOrders,
      total: 2,
      page: 1,
      pageSize: 10,
    });
  });

  it('should render dashboard with orders', async () => {
    const { getByText } = render(<OrderDashboard />, { wrapper: createWrapper() });

    await vi.waitFor(() => {
      expect(getByText('Order Dashboard')).toBeDefined();
      expect(getByText('John Doe')).toBeDefined();
      expect(getByText('Jane Smith')).toBeDefined();
    });
  });

  it('should display statistics correctly', async () => {
    const { getByText } = render(<OrderDashboard />, { wrapper: createWrapper() });

    await vi.waitFor(() => {
      expect(getByText('Pending')).toBeDefined();
      expect(getByText('Preparing')).toBeDefined();
      expect(getByText('Ready')).toBeDefined();
      expect(getByText('Completed')).toBeDefined();
    });
  });

  it('should filter orders by status', async () => {
    const user = userEvent.setup();

    const { getByText, getByRole, getAllByText } = render(<OrderDashboard />, {
      wrapper: createWrapper(),
    });

    await vi.waitFor(() => {
      expect(getByText('John Doe')).toBeDefined();
    });

    vi.mocked(ordersApi.getOrders).mockResolvedValue({
      orders: [mockOrders[0]],
      total: 1,
      page: 1,
      pageSize: 10,
    });

    const select = getByRole('combobox');
    await user.click(select);

    const pendingOptions = getAllByText('Pending');
    const pendingOption = pendingOptions.find(el => el.classList.contains('ant-select-item-option-content'));
    if (pendingOption) {
      await user.click(pendingOption);
    }

    await vi.waitFor(() => {
      expect(ordersApi.getOrders).toHaveBeenCalledWith('pending', 1, 10);
    });
  });

  it('should show empty state when no orders', async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue({
      orders: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const { getByText } = render(<OrderDashboard />, { wrapper: createWrapper() });

    await vi.waitFor(() => {
      expect(getByText(/No.*orders found/)).toBeDefined();
    });
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(ordersApi.getOrders).mockRejectedValue(
      new Error('Failed to fetch orders')
    );

    const { getByText } = render(<OrderDashboard />, { wrapper: createWrapper() });

    await vi.waitFor(() => {
      expect(getByText('Failed to fetch orders')).toBeDefined();
    });
  });
});
