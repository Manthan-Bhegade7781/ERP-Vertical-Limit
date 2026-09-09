import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  AuthProvider,
  useAuth,
} from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const firstSegment = segments[0];

    const inAuthGroup = firstSegment === '(auth)';
    const inTabsGroup = firstSegment === '(tabs)';
    const inSuperAdminRoute = firstSegment === '(super_admin)';

    const isSuperAdmin =
      user?.roles?.includes('super_admin') ?? false;

    const isTeacher =
      user?.roles?.includes('teacher') ?? false;

    // Not authenticated → only allow Auth screens
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }

      return;
    }

    // Super Admin → only allow Super Admin Dashboard
    if (isSuperAdmin) {
      if (!inSuperAdminRoute) {
        router.replace('/(super_admin)');
      }

      return;
    }

    // Teacher → only allow Teacher Dashboard
    if (isTeacher) {
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }

      return;
    }

    // Authenticated user with an unsupported role
    router.replace('/(auth)');
  }, [
    isLoading,
    isAuthenticated,
    user,
    segments,
    router,
  ]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(super_admin)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    PoppinsRegular: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider
        value={
          colorScheme === 'dark'
            ? DarkTheme
            : DefaultTheme
        }
      >
        <RootNavigator />

        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}