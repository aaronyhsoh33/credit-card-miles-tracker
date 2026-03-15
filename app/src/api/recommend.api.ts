import { apiClient } from './client';
import { RecommendResult, Category } from '../types';

export async function recommend(category: string, amount?: number) {
  const { data } = await apiClient.get<{ success: true; data: RecommendResult[] }>('/recommend', {
    params: { category, ...(amount !== undefined ? { amount } : {}) },
  });
  return data.data;
}

export async function recommendAll() {
  const { data } = await apiClient.get<{
    success: true;
    data: { category: Category; bestCard: RecommendResult | null }[];
  }>('/recommend/all');
  return data.data;
}
