import { create } from 'zustand';
import {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
} from '@/types/banner.types';
import {
  getBanners,
  getBannerSlots,
  updateBannerSlot,
  toggleBannerSlot,
  clearBannerSlot,
  reorderBanners,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
} from '@/services/banner.service';

interface BannerState {
  banners: Banner[];
  slots: Banner[];
  isLoading: boolean;
  error: string | null;

  fetchSlots: (force?: boolean) => Promise<void>;
  updateSlot: (order: number, dto: UpdateBannerDto) => Promise<Banner>;
  toggleSlot: (order: number) => Promise<Banner>;
  clearSlot: (order: number) => Promise<Banner>;
  reorderSlots: (reordered: Banner[]) => Promise<void>;

  fetchBanners: (params?: { type?: string; isActive?: boolean }, force?: boolean) => Promise<void>;
  addBanner: (dto: CreateBannerDto) => Promise<Banner>;
  editBanner: (id: string, dto: UpdateBannerDto) => Promise<Banner>;
  toggleBannerStatus: (id: string) => Promise<Banner>;
  removeBanner: (id: string) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  slots: [],
  isLoading: false,
  error: null,

  fetchSlots: async (force = false) => {
    if (!force && get().slots.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getBannerSlots();
      set({ slots: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener slots';
      set({ error: message, isLoading: false });
    }
  },

  updateSlot: async (order: number, dto: UpdateBannerDto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateBannerSlot(order, dto);
      set((state) => ({
        slots: state.slots.map((s) => (s.order === order ? updated : s)),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar slot';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  toggleSlot: async (order: number) => {
    try {
      const updated = await toggleBannerSlot(order);
      set((state) => ({
        slots: state.slots.map((s) => (s.order === order ? updated : s)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      set({ error: message });
      throw err;
    }
  },

  clearSlot: async (order: number) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await clearBannerSlot(order);
      set((state) => ({
        slots: state.slots.map((s) => (s.order === order ? updated : s)),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al limpiar slot';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  reorderSlots: async (reordered: Banner[]) => {
    // Reasigna las propiedades order localmente para actualización inmediata
    const updatedWithOrder = reordered.map((b, idx) => ({
      ...b,
      order: idx + 1,
    }));
    set({ slots: updatedWithOrder });

    try {
      const payload = updatedWithOrder.map((b) => ({ id: b.id, order: b.order }));
      await reorderBanners(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reordenar banners';
      set({ error: message });
    }
  },

  fetchBanners: async (params?: { type?: string; isActive?: boolean }, force = false) => {
    if (!force && get().banners.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getBanners(params);
      set({ banners: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener banners';
      set({ error: message, isLoading: false });
    }
  },

  addBanner: async (dto: CreateBannerDto) => {
    set({ isLoading: true, error: null });
    try {
      const newBanner = await createBanner(dto);
      set((state) => ({
        banners: [...state.banners, newBanner].sort((a, b) => a.order - b.order),
        isLoading: false,
      }));
      return newBanner;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear banner';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editBanner: async (id: string, dto: UpdateBannerDto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateBanner(id, dto);
      set((state) => ({
        banners: state.banners
          .map((b) => (b.id === id ? updated : b))
          .sort((a, b) => a.order - b.order),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar banner';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  toggleBannerStatus: async (id: string) => {
    try {
      const updated = await toggleBannerActive(id);
      set((state) => ({
        banners: state.banners.map((b) => (b.id === id ? updated : b)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      set({ error: message });
      throw err;
    }
  },

  removeBanner: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteBanner(id);
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar banner';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
