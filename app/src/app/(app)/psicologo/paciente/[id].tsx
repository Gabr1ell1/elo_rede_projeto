// Para que serve este arquivo: Mostra os dados existentes do paciente e suas consultas com este psicólogo.
// Onde é usado: O detalhe de uma solicitação abre esta rota pelo botão de perfil do paciente.

import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../../components/avatar";
import { useAuth } from "../../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../../context/AlertaContext";
import { getMyAppointmentsAsPsychologist } from "../../../../services/api";
import { Appointment } from "../../../../types/clinic";
import { formatarDataHora } from "../../../../formatacao/data-hora";
import { COLORS } from "../../../../constants/cores";

// Mostra apenas o nome e as consultas presentes nos dados do profissional. Exemplo: paciente ligado a uma solicitação.
export default function PerfilPaciente() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const { user } = useAuth();
    const { mostrarErro } = useAlerta();
    // Guarda apenas os horários e estados de consulta que pertencem ao paciente.
    const [consultas, setConsultas] = useState<Appointment[]>([]);
    // Controla o indicador enquanto as consultas são buscadas.
    const [carregando, setCarregando] = useState(true);

    // Filtra as consultas visíveis do próprio psicólogo para exibir somente as do paciente escolhido.
    // Carrega consultas quando o paciente e o psicólogo da sessão estão identificados.
    useEffect(() => {
        if (!user || !id) return;
        getMyAppointmentsAsPsychologist(user.userId)
            .then((itens) => setConsultas(itens.filter((consulta) => consulta.patientId === id)))
            .catch((erro) => mostrarErro("Erro ao carregar perfil do paciente", motivoDoErro(erro)))
            .finally(() => setCarregando(false));
    }, [user, id, mostrarErro]);

    const nome = consultas[0]?.patientName ?? "Paciente";

    return (
        <ScrollView contentContainerStyle={estilos.tela}>
            <Pressable onPress={() => roteador.back()} style={estilos.voltar}><Ionicons name="chevron-back" size={18} color={COLORS.primaryDark} /><Text style={estilos.link}>Voltar</Text></Pressable>
            <View style={estilos.cartao}>
                <Avatar userId={id ?? ""} size={86} />
                <Text style={estilos.nome}>{nome}</Text>
                <Text style={estilos.subtitulo}>Consultas com você</Text>
                {/* Abre o detalhe da consulta escolhida ao tocar em um item da lista. */}
                {carregando ? <ActivityIndicator color={COLORS.primary} /> : consultas.length ? consultas.map((consulta) => (
                    <Pressable key={consulta.id} onPress={() => roteador.push(`/psicologo/consulta/${consulta.id}` as any)} style={({ pressed }) => [estilos.consulta, pressed && estilos.pressionado]}>
                        <Text style={estilos.data}>{formatarDataHora(consulta.date)}</Text>
                        <Text style={estilos.status}>{consulta.status === "PENDING" ? "Aguardando confirmação" : consulta.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}</Text>
                    </Pressable>
                )) : <Text style={estilos.vazio}>Nenhuma consulta encontrada.</Text>}
            </View>
        </ScrollView>
    );
}

// Estes estilos destacam a foto e a lista de consultas sem acrescentar dados pessoais ausentes.
const estilos = StyleSheet.create({
    tela: { flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor: COLORS.background },
    voltar: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, padding: 8 },
    link: { color: COLORS.primaryDark, fontWeight: "700" },
    cartao: { width: "100%", maxWidth: 680, alignSelf: "center", alignItems: "center", padding: 22, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
    nome: { color: COLORS.text, fontSize: 22, fontWeight: "700" },
    subtitulo: { alignSelf: "flex-start", color: COLORS.textSecondary, fontSize: 14, fontWeight: "600", marginTop: 16 },
    consulta: { width: "100%", padding: 14, borderRadius: 15, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
    data: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
    status: { color: COLORS.textSecondary, fontSize: 13 },
    vazio: { color: COLORS.textSecondary, fontSize: 14, paddingVertical: 12 },
    pressionado: { opacity: 0.82 }
});
