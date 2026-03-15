import { apiClient } from './client';
import { Transaction, TransactionSummary, PaginatedResponse } from '../types';

export type CreateTransactionInput = {
  cardId: number;
  categoryId: number;
  amount: number;
  merchant?: string;
  notes?: string;
  transactedAt: string;
};

export type ListTransactionsParams = {
  from?: string;
  to?: string;
  cardId?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
};

export async function listTransactions(params?: ListTransactionsParams) {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params });
  return data;
}

export async function createTransaction(input: CreateTransactionInput) {
  const { data } = await apiClient.post<{ success: true; data: Transaction }>('/transactions', input);
  return data.data;
}

export async function updateTransaction(id: number, input: Partial<CreateTransactionInput>) {
  const { data } = await apiClient.patch<{ success: true; data: Transaction }>(`/transactions/${id}`, input);
  return data.data;
}

export async function deleteTransaction(id: number) {
  await apiClient.delete(`/transactions/${id}`);
}

export async function getTransactionSummary(params?: { from?: string; to?: string }) {
  const { data } = await apiClient.get<{ success: true; data: TransactionSummary }>(
    '/transactions/summary',
    { params }
  );
  return data.data;
}
