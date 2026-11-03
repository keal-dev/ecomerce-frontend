import { create } from 'zustand';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/category.service';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (force?: boolean) => Promise<void>;
  addCategory: (dto: CreateCategoryDto) => Promise<Category>;
  editCategory: (id: string, dto: UpdateCategoryDto) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async (force = false) => {
    if (!force && get().categories.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getCategories();
      set({ categories: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar categorías';
      set({ error: message, isLoading: false });
    }
  },
  addCategory: async (dto: CreateCategoryDto) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createCategory(dto);
      set((state) => ({ 
        categories: [...state.categories, created].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false 
      }));
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear categoría';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
  editCategory: async (id: string, dto: UpdateCategoryDto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateCategory(id, dto);
      set((state) => ({
        categories: state.categories
          .map((cat) => (cat.id === id ? updated : cat))
          .sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar categoría';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
  removeCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar categoría';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
  setCategories: (categories) => set({ categories }),
}));
