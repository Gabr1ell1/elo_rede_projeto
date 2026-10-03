// Este layout limita a área do psicólogo ao papel PSYCHOLOGIST.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

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
