import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredTokens: () => Promise<string | null>;
  setAccessToken: (token: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, accessToken, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, isLoading: false });
  },

  loadStoredTokens: async () => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    set({ accessToken: token, isLoading: false });
    return token;
  },

  setAccessToken: (token: string) => set({ accessToken: token }),
}));

export async function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}
