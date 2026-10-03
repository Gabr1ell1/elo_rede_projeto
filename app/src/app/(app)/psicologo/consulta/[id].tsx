// Para que serve este arquivo: Mostra uma consulta, o link online demonstrativo e seus anexos.
// Onde é usado: A agenda e as solicitações do psicólogo abrem esta rota.

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Avatar } from "../../../../components/avatar";
import { useAuth } from "../../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../../context/AlertaContext";
import { getAppointmentById, listAttachments } from "../../../../services/api";
import { Appointment, Attachment } from "../../../../types/clinic";
import { formatarDataHora } from "../../../../formatacao/data-hora";
import { COLORS } from "../../../../constants/cores";

// Carrega os dados da consulta e os anexos que pertencem ao paciente e profissional. Exemplo: abrir pelo cartão da agenda.
export default function DetalheConsultaPsicologo() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const { user } = useAuth();
    const { mostrarErro } = useAlerta();
    const [consulta, setConsulta] = useState<Appointment | null>(null);
    const [anexos, setAnexos] = useState<Attachment[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Busca consulta e anexos ao abrir a rota, mostrando o motivo se o serviço falhar.
    const carregar = useCallback(async () => {
        if (!id || !user) return;
        try {
            const item = await getAppointmentById(id, user.userId, "PSYCHOLOGIST");
            setConsulta(item);
            setAnexos(await listAttachments(id, user.userId, "PSYCHOLOGIST"));
        } catch (erro) {
            mostrarErro("Erro ao carregar consulta", motivoDoErro(erro));
        } finally {
            setCarregando(false);
        }
    }, [id, user, mostrarErro]);

    useEffect(() => { void carregar(); }, [carregar]);

    // Abre o link FALSO da sala de demonstração.
    async function entrarNaConsulta() {
        if (!consulta?.linkConsulta) return;
        try { await Linking.openURL(consulta.linkConsulta); }
        catch (erro) { mostrarErro("Erro ao abrir consulta", motivoDoErro(erro)); }
    }

    // Copia para a área de transferência o link FALSO salvo na consulta.
    async function copiarLink() {
        if (!consulta?.linkConsulta) return;
        try { await Clipboard.setStringAsync(consulta.linkConsulta); }
        catch (erro) { mostrarErro("Erro ao copiar link", motivoDoErro(erro)); }
    }

    // Abre um anexo usando o endereço que já existe nos dados da consulta.
    async function abrirAnexo(anexo: Attachment) {
        try { await Linking.openURL(anexo.uri); }
        catch (erro) { mostrarErro("Erro ao abrir anexo", motivoDoErro(erro)); }
    }

    if (carregando) return <View style={estilos.centro}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!consulta) return <View style={estilos.centro}><Text style={estilos.meta}>Consulta não encontrada.</Text><Pressable onPress={() => roteador.replace("/psicologo" as any)}><Text style={estilos.link}>Voltar para agenda</Text></Pressable></View>;

    return (
        <View style={estilos.tela}>
            <Pressable onPress={() => roteador.back()} style={estilos.voltar}><Ionicons name="chevron-back" size={18} color={COLORS.primaryDark} /><Text style={estilos.link}>Voltar</Text></Pressable>
            <Text style={estilos.titulo}>Detalhe da consulta</Text>
            <View style={estilos.cartao}>
                <View style={estilos.paciente}><Avatar userId={consulta.patientId} size={58} /><View style={estilos.dados}><Text style={estilos.rotulo}>Paciente</Text><Text style={estilos.nome}>{consulta.patientName}</Text></View></View>
                <Text style={estilos.valor}>{formatarDataHora(consulta.date)}</Text>
                <Text style={estilos.status}>Status: {consulta.status === "PENDING" ? "Aguardando confirmação" : consulta.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}</Text>
                {consulta.status === "CONFIRMED" && !!consulta.linkConsulta && (
                    <View style={estilos.linkCard}>
                        <Text style={estilos.avisoLink}>Link FALSO para demonstração</Text>
                        <Text style={estilos.linkUrl}>{consulta.linkConsulta}</Text>
                        <Pressable onPress={() => void entrarNaConsulta()} style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}><Ionicons name="videocam-outline" size={18} color="#FFFFFF" /><Text style={estilos.textoBotao}>Entrar na consulta</Text></Pressable>
                        <Pressable onPress={() => void copiarLink()} style={({ pressed }) => [estilos.copiar, pressed && estilos.pressionado]}><Ionicons name="copy-outline" size={17} color={COLORS.primaryDark} /><Text style={estilos.textoCopiar}>Copiar link</Text></Pressable>
                    </View>
                )}
            </View>
            <Text style={estilos.tituloSecao}>Anexos</Text>
            <FlatList data={anexos} keyExtractor={(anexo) => anexo.id} ListEmptyComponent={<Text style={estilos.meta}>Nenhum anexo enviado.</Text>} renderItem={({ item }) => <Pressable onPress={() => void abrirAnexo(item)} style={({ pressed }) => [estilos.anexo, pressed && estilos.pressionado]}><Ionicons name="document-outline" size={20} color={COLORS.primaryDark} /><Text style={estilos.anexoTexto}>{item.name} · {item.category}</Text><Ionicons name="open-outline" size={16} color={COLORS.textSecondary} /></Pressable>} />
        </View>
    );
}

// Estes estilos separam os dados, o link demonstrativo e a lista de anexos.
const estilos = StyleSheet.create({
    tela: { flex: 1, padding: 20, paddingTop: 44, backgroundColor: COLORS.background },
    centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: COLORS.background },
    voltar: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12, padding: 8 },
    link: { color: COLORS.primaryDark, fontWeight: "700" },
    titulo: { color: COLORS.text, fontSize: 22, fontWeight: "700", marginBottom: 14 },
    cartao: { padding: 18, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, gap: 13 },
    paciente: { flexDirection: "row", alignItems: "center", gap: 12 },
    dados: { flex: 1, gap: 3 },
    rotulo: { color: COLORS.textSecondary, fontSize: 12 },
    nome: { color: COLORS.text, fontSize: 17, fontWeight: "700" },
    valor: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
    status: { color: COLORS.textSecondary, fontSize: 14 },
    linkCard: { gap: 9, padding: 14, borderRadius: 16, backgroundColor: COLORS.background },
    avisoLink: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" },
    linkUrl: { color: COLORS.primaryDark, fontSize: 12 },
    botao: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, backgroundColor: COLORS.primary },
    textoBotao: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    copiar: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, backgroundColor: COLORS.primaryLight },
    textoCopiar: { color: COLORS.primaryDark, fontSize: 14, fontWeight: "700" },
    tituloSecao: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: 22, marginBottom: 8 },
    meta: { color: COLORS.textSecondary, fontSize: 14 },
    anexo: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginBottom: 8, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
    anexoTexto: { flex: 1, color: COLORS.text, fontSize: 13 },
    pressionado: { opacity: 0.82, transform: [{ scale: 0.99 }] }
});
