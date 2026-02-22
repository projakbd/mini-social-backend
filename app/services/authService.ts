import { api, setAuthToken } from './api';

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    username,
    email,
    password,
  });
  await setAuthToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  await setAuthToken(data.token);
  return data;
}

export async function logout() {
  await setAuthToken(null);
}

export async function saveFCMToken(fcmToken: string, authToken?: string): Promise<void> {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  await api.post('/auth/fcm-token', { fcmToken }, { headers });
}
