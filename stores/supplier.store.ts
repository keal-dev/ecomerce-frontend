import { create } from 'zustand';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/types/supplier.types';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '@/services/supplier.service';

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;

  fetchSuppliers: (search?: string, isActive?: boolean) => Promise<void>;
  addSupplier: (dto: CreateSupplierDto) => Promise<Supplier>;
  editSupplier: (id: string, dto: UpdateSupplierDto) => Promise<Supplier>;
  removeSupplier: (id: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async (search?: string, isActive?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSuppliers(search, isActive);
      set({ suppliers: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar proveedores';
      set({ error: message, isLoading: false });
    }
  },

  addSupplier: async (dto: CreateSupplierDto) => {
    set({ isLoading: true, error: null });
    try {
      const newSupplier = await createSupplier(dto);
      set((state) => ({
        suppliers: [...state.suppliers, newSupplier].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        isLoading: false,
      }));
      return newSupplier;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear proveedor';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editSupplier: async (id: string, dto: UpdateSupplierDto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateSupplier(id, dto);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar proveedor';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  removeSupplier: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSupplier(id);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar proveedor';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
