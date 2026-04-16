import { useCallback, useEffect, useState } from "react";
import { ordersApi } from "../api/orders-api";
import type {
  Order,
  OrderFilters,
  OrdersResponse,
  OrderStatus,
} from "../types/order";

interface UseOrdersState {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

interface UseOrdersReturn extends UseOrdersState {
  refetch: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  setFilters: (filters: OrderFilters) => void;
  filters: OrderFilters;
}

export const useOrders = (
  initialFilters: OrderFilters = {},
): UseOrdersReturn => {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    total: 0,
    page: initialFilters.page || 1,
    pageSize: 10,
    loading: true,
    error: null,
  });

  const [filters, setFiltersState] = useState<OrderFilters>(initialFilters);

  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: OrdersResponse = await ordersApi.getOrders(
        filters.status,
        filters.page || 1,
        10,
      );

      setState({
        orders: response.orders,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch orders",
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const setFilters = useCallback((newFilters: OrderFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.status !== prev.status ? 1 : newFilters.page,
    }));
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      const orderToUpdate = state.orders.find((order) => order.id === orderId);

      if (!orderToUpdate) {
        throw new Error("Order not found");
      }

      const previousOrders = [...state.orders];

      const optimisticOrder: Order = {
        ...orderToUpdate,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId ? optimisticOrder : order,
        ),
      }));

      try {
        await ordersApi.updateOrderStatus(orderId, { status: newStatus });

        await fetchOrders();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          orders: previousOrders,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update order status",
        }));

        throw error;
      }
    },
    [state.orders, fetchOrders],
  );

  const refetch = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  return {
    ...state,
    refetch,
    updateOrderStatus,
    setFilters,
    filters,
  };
};
