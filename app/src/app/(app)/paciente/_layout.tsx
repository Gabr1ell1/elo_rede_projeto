import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

// Guard do grupo do paciente: só cuida do papel (role).
// "Está logado ou não" é do layout raiz (Stack.Protected).
export default function PatientLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Enquanto carrega o login, não decide nada.
    if (isLoading || (isAuthenticated && !user?.role)) return <Loading />;

    // Deslogado: o layout raiz já está trocando de grupo.
    if (!isAuthenticated || !user) return null;

    // Psicólogo caiu na área do paciente: manda para a área dele.
    // Não precisa comparar pathname, porque /psicologo fica fora deste grupo.
    if (user.role === "PSYCHOLOGIST") {
        return <Redirect href="/psicologo" />;
    }

    return <Slot />;
}

function Loading() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
        </View>
    );
}
