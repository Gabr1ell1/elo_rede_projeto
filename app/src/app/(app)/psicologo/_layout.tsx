import { Redirect, Slot, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

// Guard do grupo do psicólogo: só cuida do papel (role) e do CRP.
// O controle de "está logado ou não" é do layout raiz (Stack.Protected).
export default function PsychologistLayout() {
    const { isAuthenticated, isLoading, user, statusCrp, isStatusCrpLoading } = useAuth();
    const pathname = usePathname();
    const verificacaoPath = "/psicologo/verificacao";

    // Enquanto carrega o login ou o status do CRP, não decide nada.
    if (isLoading || isStatusCrpLoading || (isAuthenticated && !user?.role)) return <Loading />;

    // Deslogado: o layout raiz já está trocando de grupo. Não redireciona aqui.
    if (!isAuthenticated) return null;

    // Paciente tentando abrir área do psicólogo vai para a área dele.
    if (user?.role === "PATIENT") {
        return <Redirect href="/paciente/consultas" />;
    }

    // CRP não verificado: só a tela de verificação fica liberada.
    if (statusCrp !== "VERIFICADO" && pathname !== verificacaoPath) {
        return <Redirect href={verificacaoPath} />;
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
