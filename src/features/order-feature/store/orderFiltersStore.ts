import { create } from 'zustand';
import type { OrderStatus } from '../types/order';

interface OrderFiltersState {
  status?: OrderStatus;
  page: number;
  setStatus: (status?: OrderStatus) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useOrderFiltersStore = create<OrderFiltersState>((set) => ({
  status: undefined,
  page: 1,
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ status: undefined, page: 1 }),
}));
