// Este layout protege as páginas internas e aguarda a restauração da sessão.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedAppLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    // Quem ainda não entrou volta para a tela de login.
    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }

    return <Slot />;
}
