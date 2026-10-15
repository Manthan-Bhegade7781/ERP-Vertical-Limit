import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function StudentLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isStudent =
      user?.roles?.includes('student') ?? false;

    if (!isAuthenticated || !isStudent) {
      router.replace('/(auth)');
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (!user?.roles?.includes('student')) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
