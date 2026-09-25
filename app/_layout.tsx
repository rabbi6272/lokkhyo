import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { useCourses } from '@/hooks/useCourses';
import { useRoutines } from '@/hooks/useRoutines';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, initializing } = useAuth();
  const { isLoading: isCoursesLoading } = useCourses();
  const { isLoading: isRoutinesLoading } = useRoutines();
  useScheduledNotifications();

  const [loaded] = useFonts({
    'InterRegular': require('../assets/fonts/Inter-Regular.ttf'),
    'InterMedium': require('../assets/fonts/Inter-Medium.ttf'),
    'InterSemiBold': require('../assets/fonts/Inter-SemiBold.ttf')
  });

  useEffect(() => {
    if (!initializing && loaded && !isCoursesLoading && !isRoutinesLoading) {
      SplashScreen.hideAsync();
    }
  }, [initializing, loaded, isCoursesLoading, isRoutinesLoading]);

  if (initializing || !loaded) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="course/new" options={{ headerShown: false }} />
        <Stack.Screen name="assessment/new" options={{ headerShown: false }} />
        <Stack.Screen name="routine/new" options={{ headerShown: false }} />
        <Stack.Screen name="target/new" options={{ headerShown: false }} />
        <Stack.Screen name="targets" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="settings/settings" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryProvider>
      <StatusBar barStyle={'dark-content'} />
    </>
  );
}
