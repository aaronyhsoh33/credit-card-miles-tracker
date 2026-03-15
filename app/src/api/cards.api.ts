import { apiClient } from './client';
import { Card, UserCard } from '../types';

export async function listCards(filters?: { bank?: string; category?: string }) {
  const { data } = await apiClient.get<{ success: true; data: Card[] }>('/cards', {
    params: filters,
  });
  return data.data;
}

export async function getCard(id: number) {
  const { data } = await apiClient.get<{ success: true; data: Card }>(`/cards/${id}`);
  return data.data;
}

export async function getMyCards() {
  const { data } = await apiClient.get<{ success: true; data: UserCard[] }>('/me/cards');
  return data.data;
}

export async function addMyCard(cardId: number, nickname?: string) {
  const { data } = await apiClient.post<{ success: true; data: UserCard }>('/me/cards', {
    cardId,
    nickname,
  });
  return data.data;
}

export async function removeMyCard(cardId: number) {
  await apiClient.delete(`/me/cards/${cardId}`);
}

export async function updateMyCard(cardId: number, nickname: string | null) {
  const { data } = await apiClient.patch<{ success: true; data: UserCard }>(`/me/cards/${cardId}`, {
    nickname,
  });
  return data.data;
}
