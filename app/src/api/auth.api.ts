import { apiClient } from './client';
import { AuthUser } from '../types';

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function register(email: string, password: string, name?: string) {
  const { data } = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/register', {
    email,
    password,
    name,
  });
  return data.data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/login', {
    email,
    password,
  });
  return data.data;
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function getMe() {
  const { data } = await apiClient.get<{ success: true; data: AuthUser }>('/me');
  return data.data;
}
