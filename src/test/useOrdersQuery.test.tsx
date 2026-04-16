import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ordersApi } from '../features/order-feature/api/orders-api';
import { useOrders, useUpdateOrderStatus } from '../features/order-feature/hooks/useOrdersQuery';

vi.mock('../features/order-feature/api/orders-api');

const mockOrdersResponse = {
  orders: [
    {
      id: '1',
      guestName: 'John Doe',
      items: [{ name: 'Pizza', quantity: 1, price: 1000 }],
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: 1000,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};

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

describe('useOrders Hook (React Query)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch orders on mount', async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useOrders(undefined, 1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.orders).toEqual(mockOrdersResponse.orders);
    expect(result.current.data?.total).toBe(1);
    expect(ordersApi.getOrders).toHaveBeenCalledWith(undefined, 1, 10);
  });

  it('should handle filter changes', async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);

    const { result, rerender } = renderHook(
      ({ status }: { status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | undefined }) => useOrders(status, 1),
      {
        wrapper: createWrapper(),
        initialProps: { status: undefined as 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | undefined },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    rerender({ status: 'preparing' });

    await waitFor(() => {
      expect(ordersApi.getOrders).toHaveBeenCalledWith('preparing', 1, 10);
    });
  });

  it('should handle error states', async () => {
    vi.mocked(ordersApi.getOrders).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useOrders(undefined, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(new Error('Failed to fetch'));
    });
  });
});

describe('useUpdateOrderStatus Hook (React Query)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update order status optimistically', async () => {
    const updatedOrder = {
      ...mockOrdersResponse.orders[0],
      status: 'preparing' as const,
    };

    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);
    vi.mocked(ordersApi.updateOrderStatus).mockResolvedValue(updatedOrder);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(['orders', undefined, 1], mockOrdersResponse);

    const { result } = renderHook(() => useUpdateOrderStatus(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await result.current.mutateAsync({
      orderId: '1',
      newStatus: 'preparing',
    });

    expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith('1', {
      status: 'preparing',
    });
  });

  it('should rollback on failed status update', async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);
    vi.mocked(ordersApi.updateOrderStatus).mockRejectedValue(new Error('Network error'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(['orders', undefined, 1], mockOrdersResponse);

    const { result } = renderHook(() => useUpdateOrderStatus(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await expect(
      result.current.mutateAsync({
        orderId: '1',
        newStatus: 'preparing',
      })
    ).rejects.toThrow('Network error');
  });
});
