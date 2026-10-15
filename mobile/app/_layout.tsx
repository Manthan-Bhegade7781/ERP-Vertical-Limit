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
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0];

    const inAuthGroup = firstSegment === '(auth)';

    const roles = user?.roles ?? [];
    const dashboardRoles = [
      'super_admin',
      'admin',
      'teacher',
      'student',
    ];

    // Require exactly one dashboard role.
    const assignedRoles = roles.filter((role) =>
      dashboardRoles.includes(role)
    );

    const role =
      assignedRoles.length === 1 ? assignedRoles[0] : null;

    // Map each role to its dashboard route.
    const dashboardRoutes: Record<string, string> = {
      super_admin: '/(super_admin)',
      admin: '/admin',
      teacher: '/(tabs)',
      student: '/(student)',
    };

    // Allow unauthenticated users only on login/register.
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
      return;
    }

    // Never allow an unsupported or ambiguous role to enter a dashboard.
    if (!role) {
      router.replace('/(auth)');
      return;
    }

    const expectedRoute = dashboardRoutes[role];

    // Send authenticated users away from login/register.
    if (inAuthGroup) {
      router.replace(expectedRoute as any);
      return;
    }

    // Allow access only to the dashboard matching the user's role.
    const isCorrectRoute =
      (role === 'student' && firstSegment === '(student)') ||
      (role === 'teacher' && firstSegment === '(tabs)') ||
      (role === 'super_admin' && firstSegment === '(super_admin)') ||
      (role === 'admin' && firstSegment === 'admin');

    if (!isCorrectRoute) {
      router.replace(expectedRoute as any);
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    segments,
    router,
  ]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="(student)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="(super_admin)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="admin"
        options={{ headerShown: false }}
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

  if (!fontsLoaded) return null;

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
