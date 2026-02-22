import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { token, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (token) {
    return <Redirect href="/(tabs)/feed" />;
  }
  return <Redirect href="/(auth)/login" />;
}
