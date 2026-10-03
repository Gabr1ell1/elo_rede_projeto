// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/paciente/_layout.tsx é importado pelas telas ou componentes correspondentes.

// Este layout limita a área do paciente ao papel PATIENT.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PatientLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }

    // Psicólogo tentando acessar rota de paciente -> manda pro dashboard dele
    if (user?.role !== "PATIENT") {
        return <Redirect href="/psicologo" />;
    }

    return <Slot />;
}
