// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/_layout.tsx é importado pelas telas ou componentes correspondentes.

// Este layout protege as páginas internas e aguarda a restauração da sessão.
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
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
