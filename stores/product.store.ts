import { create } from 'zustand';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
} from '@/types/product.types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/product.service';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: (force?: boolean, params?: ProductFilterParams) => Promise<void>;
  addProduct: (dto: CreateProductDto) => Promise<Product>;
  editProduct: (id: string, dto: UpdateProductDto) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (force = false, params?: ProductFilterParams) => {
    if (!force && get().products.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getProducts(params);
      set({ products: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      set({ error: message, isLoading: false });
    }
  },

  addProduct: async (dto: CreateProductDto) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await createProduct(dto);
      set((state) => ({
        products: [newProduct, ...state.products],
        isLoading: false,
      }));
      return newProduct;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear producto';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editProduct: async (id: string, dto: UpdateProductDto) => {
    set({ error: null });
    try {
      const updated = await updateProduct(id, dto);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar producto';
      set({ error: message });
      throw err;
    }
  },

  removeProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
