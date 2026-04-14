import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/contexts/AuthContext";
import { ExtractProvider } from "@/contexts/ExtractContext";
import { theme } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <ExtractProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </ExtractProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
