import { create } from 'zustand';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilterParams,
} from '@/types/user.types';
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserActive,
  deleteUser,
} from '@/services/user.service';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (params?: UserFilterParams) => Promise<void>;
  addUser: (dto: CreateUserDto) => Promise<User>;
  editUser: (id: string, dto: UpdateUserDto) => Promise<User>;
  toggleUserStatus: (id: string) => Promise<User>;
  removeUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (params?: UserFilterParams) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUsers(params);
      set({ users: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      set({ error: message, isLoading: false });
    }
  },

  addUser: async (dto: CreateUserDto) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createUser(dto);
      set((state) => ({
        users: [created, ...state.users],
        isLoading: false,
      }));
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editUser: async (id: string, dto: UpdateUserDto) => {
    set({ error: null });
    try {
      const updated = await updateUser(id, dto);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario';
      set({ error: message });
      throw err;
    }
  },

  toggleUserStatus: async (id: string) => {
    set({ error: null });
    try {
      const updated = await toggleUserActive(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al alternar estado del usuario';
      set({ error: message });
      throw err;
    }
  },

  removeUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
