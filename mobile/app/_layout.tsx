import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./global.css";
import MyStatusBar from "./components/AppStatusBar";
import { Provider } from "react-redux";
import { store } from "@/src/store";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { Provider as PaperProvider } from "react-native-paper";
import LoadingOverlay from "./components/LoadingOverlay";
import InfoOverlay from "./components/popup/InfoOverLay";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 700,
});
export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-Black": require("../assets/fonts/Pretendard-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isAuthenticated !== null) {
      // await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated]);

  const checkTokenExists = async () => {
    let token = await storage.retreive(STORAGE_KEYS.AUTH.TOKEN);
    console.log("token here", token);
    setIsAuthenticated(token !== null);
  };
  useEffect(() => {
    //check if token is present
    checkTokenExists();
  }, []);

  useEffect(() => {}, [pathname]);
  if (!fontsLoaded || isAuthenticated === null) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <GluestackUIProvider config={config}>
          <SafeAreaProvider>
            <SafeAreaView
              edges={["top", "bottom"]}
              style={{ flex: 1 }}
              onLayout={onLayoutRootView}
              className="bg-black-1000"
            >
              <MyStatusBar />
              {/* <StatusBar style="auto" backgroundColor="black"/> */}
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: "#1F1F1F",
                  },
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    headerShown: false,
                  }}
                  initialParams={{
                    sessionTokenExists: isAuthenticated,
                  }}
                />
              </Stack>
              <LoadingOverlay />
              <InfoOverlay />
              <Toast />
            </SafeAreaView>
          </SafeAreaProvider>
        </GluestackUIProvider>
      </PaperProvider>
    </Provider>
  );
}
