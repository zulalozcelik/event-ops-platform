import axios from 'axios';
import { clientEnv } from '@/lib/config/env';

export const api = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
