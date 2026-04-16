import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "../../../types/order";
import { ordersApi } from "../api/orders";

export const useOrders = (status?: OrderStatus, page: number = 1) => {
  return useQuery({
    queryKey: ["orders", status, page],
    queryFn: () => ordersApi.getOrders(status, page, 10),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: OrderStatus;
    }) => ordersApi.updateOrderStatus(orderId, { status: newStatus }),
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["orders"],
      });

      queryClient.setQueriesData<any>({ queryKey: ["orders"] }, (old: any) => {
        if (!old?.orders) return old;

        return {
          ...old,
          orders: old.orders.map((order: Order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        };
      });

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
