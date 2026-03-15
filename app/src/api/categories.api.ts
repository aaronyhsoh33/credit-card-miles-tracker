import { apiClient } from './client';
import { Category } from '../types';

export async function listCategories() {
  const { data } = await apiClient.get<{ success: true; data: Category[] }>('/categories');
  return data.data;
}
