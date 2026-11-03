import { create } from 'zustand';
import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilterParams,
} from '@/types/brand.types';
import {
  getBrands,
  createBrand,
  updateBrand,
  toggleBrandActive,
  deleteBrand,
} from '@/services/brand.service';

interface BrandState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;

  fetchBrands: (force?: boolean, params?: BrandFilterParams) => Promise<void>;
  addBrand: (dto: CreateBrandDto) => Promise<Brand>;
  editBrand: (id: string, dto: UpdateBrandDto) => Promise<Brand>;
  toggleBrandStatus: (id: string) => Promise<Brand>;
  removeBrand: (id: string) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async (force = false, params?: BrandFilterParams) => {
    if (!force && get().brands.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getBrands(params);
      set({ brands: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener marcas';
      set({ error: message, isLoading: false });
    }
  },

  addBrand: async (dto: CreateBrandDto) => {
    set({ isLoading: true, error: null });
    try {
      const newBrand = await createBrand(dto);
      set((state) => ({
        brands: [...state.brands, newBrand].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return newBrand;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear marca';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editBrand: async (id: string, dto: UpdateBrandDto) => {
    set({ error: null });
    try {
      const updated = await updateBrand(id, dto);
      set((state) => ({
        brands: state.brands
          .map((b) => (b.id === id ? updated : b))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar marca';
      set({ error: message });
      throw err;
    }
  },

  toggleBrandStatus: async (id: string) => {
    set({ error: null });
    try {
      const updated = await toggleBrandActive(id);
      set((state) => ({
        brands: state.brands.map((b) => (b.id === id ? updated : b)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al alternar estado de la marca';
      set({ error: message });
      throw err;
    }
  },

  removeBrand: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteBrand(id);
      set((state) => ({
        brands: state.brands.filter((b) => b.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar marca';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
