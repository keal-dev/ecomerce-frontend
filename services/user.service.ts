import api from '@/libs/axios';
import {
  SyncUserDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilterParams,
} from '@/types/user.types';

export async function syncUser(dto: SyncUserDto): Promise<User> {
  const response = await api.post<User>('/users/sync', dto);
  return response.data;
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const response = await api.get<User | null>(`/users/${clerkId}`);
  return response.data;
}

export async function getUsers(params?: UserFilterParams): Promise<User[]> {
  const response = await api.get<User[]>('/users', { params });
  return response.data;
}

export async function getUserById(id: string): Promise<User | null> {
  const response = await api.get<User | null>(`/users/${id}`);
  return response.data;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const response = await api.post<User>('/users', dto);
  return response.data;
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const response = await api.put<User>(`/users/${id}`, dto);
  return response.data;
}

export async function toggleUserActive(id: string): Promise<User> {
  const response = await api.patch<User>(`/users/${id}/toggle-active`);
  return response.data;
}

export async function deleteUser(id: string): Promise<{ deleted: boolean }> {
  const response = await api.delete<{ deleted: boolean }>(`/users/${id}`);
  return response.data;
}
