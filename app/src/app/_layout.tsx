import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { AlertaProvider } from "@/src/context/AlertaContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { TelaAbertura } from "@/src/components/tela-abertura";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

void SplashScreen.preventAutoHideAsync();

function AppContent() {
    // isAuthenticated diz se a pessoa já fez login; isLoading, se ainda está verificando.
    const { isAuthenticated, isLoading } = useAuth();

    // Esconde a splash nativa assim que a verificação de login termina.
    useEffect(() => {
        if (!isLoading) void SplashScreen.hideAsync();
    }, [isLoading]);

    // Enquanto verifica o login, não decide rota nenhuma (evita o loop).
    if (isLoading) return <TelaAbertura />;

    return (
        <>
            <StatusBar style={isAuthenticated ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
                {/* Só quem está logado acessa o grupo (app) */}
                <Stack.Protected guard={isAuthenticated}>
                    <Stack.Screen name="(app)" />
                </Stack.Protected>

                {/* Só quem NÃO está logado acessa o grupo (auth) */}
                <Stack.Protected guard={!isAuthenticated}>
                    <Stack.Screen name="(auth)" />
                </Stack.Protected>
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <AlertaProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </AlertaProvider>
    );
}