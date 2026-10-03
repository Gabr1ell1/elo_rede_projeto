// Este layout limita a área do paciente ao papel PATIENT.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

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
