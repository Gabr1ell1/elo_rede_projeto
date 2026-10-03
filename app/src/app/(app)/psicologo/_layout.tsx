// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/_layout.tsx é importado pelas telas ou componentes correspondentes.

// Este layout limita a área do psicólogo ao papel PSYCHOLOGIST.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PsychologistLayout() {
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

    // Paciente tentando acessar rota de psicólogo -> manda para a área do paciente
    if (user?.role !== "PSYCHOLOGIST") {
        // A tela inicial do paciente está na rota atualizada de consultas.
        return <Redirect href="/paciente/consultas" />;
    }

    return <Slot />;
}
