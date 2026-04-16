import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ordersApi } from "../features/order-feature/api/orders";
import { useOrders } from "../features/order-feature/hooks/useOrders";

vi.mock("../api/orders");

const mockOrdersResponse = {
  orders: [
    {
      id: "1",
      guestName: "John Doe",
      items: [{ name: "Pizza", quantity: 1, price: 1000 }],
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: 1000,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};

describe("useOrders Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch orders on mount", async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useOrders());

    expect(result.current.loading).toBe(true);

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.orders).toEqual(mockOrdersResponse.orders);
    expect(result.current.total).toBe(1);
    expect(ordersApi.getOrders).toHaveBeenCalledWith(undefined, 1, 10);
  });

  it("should handle filter changes", async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useOrders());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.setFilters({ status: "preparing" });

    await vi.waitFor(() => {
      expect(ordersApi.getOrders).toHaveBeenCalledWith("preparing", 1, 10);
    });
  });

  it("should optimistically update order status", async () => {
    const updatedOrder = {
      ...mockOrdersResponse.orders[0],
      status: "preparing" as const,
    };

    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);
    vi.mocked(ordersApi.updateOrderStatus).mockResolvedValue(updatedOrder);

    const { result } = renderHook(() => useOrders());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const orderId = result.current.orders[0].id;

    await result.current.updateOrderStatus(orderId, "preparing");

    expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith(orderId, {
      status: "preparing",
    });

    await vi.waitFor(() => {
      expect(ordersApi.getOrders).toHaveBeenCalledTimes(2);
    });
  });

  it("should rollback on failed status update", async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrdersResponse);
    vi.mocked(ordersApi.updateOrderStatus).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useOrders());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const originalOrders = [...result.current.orders];
    const orderId = result.current.orders[0].id;

    await expect(
      result.current.updateOrderStatus(orderId, "preparing"),
    ).rejects.toThrow("Network error");

    await vi.waitFor(() => {
      expect(result.current.orders).toEqual(originalOrders);
      expect(result.current.error).toBe("Network error");
    });
  });

  it("should handle error states", async () => {
    vi.mocked(ordersApi.getOrders).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useOrders());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Failed to fetch");
    });
  });
});
