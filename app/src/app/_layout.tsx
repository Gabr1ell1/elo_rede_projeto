// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/_layout.tsx é importado pelas telas ou componentes correspondentes.

import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { Slot, useSegments } from "expo-router";
import { useEffect } from "react";
import { TelaAbertura } from "@/src/components/tela-abertura";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

void SplashScreen.preventAutoHideAsync();

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
function AppContent() {
    const { isLoading } = useAuth();
    const segments = useSegments();
// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        if (!isLoading) void SplashScreen.hideAsync();
    }, [isLoading]);

    if (isLoading) return <TelaAbertura />;
    return <><StatusBar style={segments[0] === "(auth)" ? "dark" : "light"} /><Slot /></>;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function RootLayout() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
