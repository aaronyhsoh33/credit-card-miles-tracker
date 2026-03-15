export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
};
