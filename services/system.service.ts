import api from '@/libs/axios';
import {
  DatabaseStats,
  ResetDatabaseDto,
  ResetDatabaseResponse,
} from '@/types/system.types';

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const response = await api.get<DatabaseStats>('/system/database-stats');
  return response.data;
}

export async function resetDatabase(
  dto: ResetDatabaseDto,
): Promise<ResetDatabaseResponse> {
  const response = await api.post<ResetDatabaseResponse>(
    '/system/reset-database',
    dto,
  );
  return response.data;
}
