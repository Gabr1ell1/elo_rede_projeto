import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { Slot, useSegments } from "expo-router";
import { useEffect } from "react";
import { TelaAbertura } from "@/src/components/tela-abertura";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

void SplashScreen.preventAutoHideAsync();

function AppContent() {
    const { isLoading } = useAuth();
    const segments = useSegments();
    useEffect(() => {
        if (!isLoading) void SplashScreen.hideAsync();
    }, [isLoading]);

    if (isLoading) return <TelaAbertura />;
    return <><StatusBar style={segments[0] === "(auth)" ? "dark" : "light"} /><Slot /></>;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
