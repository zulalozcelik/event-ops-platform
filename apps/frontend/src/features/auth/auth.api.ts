import { api } from '@/lib/api';
import type { AuthResponse, AuthUser } from '@/types/auth';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: 'ATTENDEE' | 'ORGANIZER';
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function register(input: RegisterInput) {
  const response = await api.post<AuthResponse>('/auth/register', input);
  return response.data;
}

export async function login(input: LoginInput) {
  const response = await api.post<AuthResponse>('/auth/login', input);
  return response.data;
}

export async function getMe() {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}
