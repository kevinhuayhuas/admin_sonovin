export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  activo: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    user: User;
  };
  statusCode: number;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
}
