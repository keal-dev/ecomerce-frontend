import { create } from 'zustand';
import { Company, UpdateCompanyDto } from '@/types/company.types';
import { 
  getCompany, 
  updateCompany, 
  uploadCompanyLogo 
} from '@/services/company.service';

interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchCompany: (force?: boolean) => Promise<void>;
  updateCompanyData: (dto: UpdateCompanyDto) => Promise<Company>;
  uploadLogo: (file: File) => Promise<{ url: string; publicId: string }>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchCompany: async (force = false) => {
    if (!force && get().company) return;
    set({ isLoading: true, error: null });
    try {
      const data = await getCompany();
      set({ company: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos de la empresa';
      set({ error: message, isLoading: false });
    }
  },

  updateCompanyData: async (dto: UpdateCompanyDto) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await updateCompany(dto);
      set({ company: updated, isSaving: false });
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar datos de la empresa';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  uploadLogo: async (file: File) => {
    set({ isSaving: true, error: null });
    try {
      const result = await uploadCompanyLogo(file);
      // Auto-update company logo in store if company already exists
      const current = get().company;
      if (current) {
        set({
          company: {
            ...current,
            logoUrl: result.url,
            logoPublicId: result.publicId,
          },
        });
      }
      set({ isSaving: false });
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir el logo';
      set({ error: message, isSaving: false });
      throw err;
    }
  },
}));
