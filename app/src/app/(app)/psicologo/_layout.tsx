// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/_layout.tsx é importado pelas telas ou componentes correspondentes.

// Este layout limita a área do psicólogo ao papel PSYCHOLOGIST.
import { Redirect, Slot, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import { getPsychologistById } from "../../../services/api";
import { useAlerta, motivoDoErro } from "../../../context/AlertaContext";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PsychologistLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const caminho = usePathname();
    const { mostrarErro } = useAlerta();
    const [carregandoCrp, setCarregandoCrp] = useState(true);
    const [crpVerificado, setCrpVerificado] = useState(false);

    // Consulta o status do perfil sempre que a rota muda para liberar a área depois da verificação.
    useEffect(() => {
        if (user?.role !== "PSYCHOLOGIST") return;
        let ativo = true;
        setCarregandoCrp(true);
        getPsychologistById(user.userId, user.userId)
            .then((perfil) => { if (ativo) setCrpVerificado(perfil?.statusCrp === "VERIFICADO"); })
            .catch((erro) => mostrarErro("Erro ao verificar CRP", motivoDoErro(erro)))
            .finally(() => { if (ativo) setCarregandoCrp(false); });
        return () => { ativo = false; };
    }, [user?.userId, user?.role, caminho]);

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

    // Enquanto o perfil carrega, evita mostrar por engano uma rota ainda bloqueada.
    if (carregandoCrp) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>;
    if (!crpVerificado && !caminho.endsWith("/psicologo/verificacao")) {
        return <Redirect href="/psicologo/verificacao" />;
    }

    return <Slot />;
}
