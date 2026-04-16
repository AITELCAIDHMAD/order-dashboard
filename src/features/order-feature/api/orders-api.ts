import type {
  Order,
  OrdersResponse,
  OrderStatus,
  UpdateOrderStatusRequest,
} from "../types/order";

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    guestName: "Sarah Johnson",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 1400 },
      { name: "Caesar Salad", quantity: 1, price: 900 },
      { name: "Iced Tea", quantity: 2, price: 400 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    total: 3100,
  },
  {
    id: "2",
    guestName: "Michael Chen",
    items: [
      { name: "Burger Deluxe", quantity: 2, price: 1600 },
      { name: "French Fries", quantity: 2, price: 500 },
      { name: "Milkshake", quantity: 1, price: 600 },
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    total: 4800,
  },
  {
    id: "3",
    guestName: "Emily Rodriguez",
    items: [
      { name: "Sushi Platter", quantity: 1, price: 2800 },
      { name: "Miso Soup", quantity: 1, price: 400 },
      { name: "Green Tea", quantity: 1, price: 300 },
    ],
    status: "ready",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    total: 3500,
  },
  {
    id: "4",
    guestName: "David Smith",
    items: [
      { name: "Pasta Carbonara", quantity: 1, price: 1800 },
      { name: "Garlic Bread", quantity: 1, price: 600 },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    total: 2400,
  },
  {
    id: "5",
    guestName: "Jessica Lee",
    items: [
      { name: "Grilled Chicken", quantity: 1, price: 1900 },
      { name: "Steamed Vegetables", quantity: 1, price: 700 },
      { name: "Lemonade", quantity: 1, price: 400 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    total: 3000,
  },
  {
    id: "6",
    guestName: "Robert Taylor",
    items: [
      { name: "Steak Medium Rare", quantity: 1, price: 3500 },
      { name: "Mashed Potatoes", quantity: 1, price: 800 },
      { name: "Red Wine", quantity: 1, price: 1200 },
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    total: 5500,
  },
  {
    id: "7",
    guestName: "Amanda Brown",
    items: [
      { name: "Chicken Wings", quantity: 2, price: 1200 },
      { name: "Nachos", quantity: 1, price: 900 },
      { name: "Beer", quantity: 2, price: 600 },
    ],
    status: "ready",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    total: 5100,
  },
  {
    id: "8",
    guestName: "Christopher Wilson",
    items: [
      { name: "Fish and Chips", quantity: 1, price: 1600 },
      { name: "Coleslaw", quantity: 1, price: 500 },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    total: 2100,
  },
];

let ordersData = [...MOCK_ORDERS];

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ordersApi = {
  getOrders: async (
    status?: OrderStatus,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<OrdersResponse> => {
    await delay(800);

    let filteredOrders = [...ordersData];

    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status,
      );
    }

    filteredOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      total: filteredOrders.length,
      page,
      pageSize,
    };
  },

  updateOrderStatus: async (
    id: string,
    request: UpdateOrderStatusRequest,
  ): Promise<Order> => {
    await delay(500);

    const orderIndex = ordersData.findIndex((order) => order.id === id);

    if (orderIndex === -1) {
      throw new Error(`Order with id ${id} not found`);
    }

    if (Math.random() < 0.1) {
      throw new Error("Network error: Failed to update order status");
    }

    const updatedOrder: Order = {
      ...ordersData[orderIndex],
      status: request.status,
      updatedAt: new Date().toISOString(),
    };

    ordersData[orderIndex] = updatedOrder;

    return updatedOrder;
  },

  resetMockData: (): void => {
    ordersData = [...MOCK_ORDERS];
  },
};
