// Para que serve este arquivo: Mostra os dados de um pedido e permite confirmar ou recusar.
// Onde é usado: A lista de solicitações abre esta rota ao tocar em um cartão.

import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../../components/avatar";
import { ConfirmDialog } from "../../../../components/confirmar-dialogo";
import { useAuth } from "../../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../../context/AlertaContext";
import { getAppointmentById, listAttachments, updateAppointmentStatus } from "../../../../services/api";
import { Appointment, Attachment } from "../../../../types/clinic";
import { formatarDia, formatarHora } from "../../../../formatacao/data-hora";
import { COLORS } from "../../../../constants/cores";
import { baixarAnexo } from "../../../../services/download";
import { CartaoAnexo } from "../../../../components/cartao-anexo";

type AcaoSolicitacao = "CONFIRMED" | "CANCELLED";

// Carrega um pedido do profissional logado e pede confirmação antes de alterar seu estado.
export default function DetalheSolicitacao() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const { user } = useAuth();
    const { mostrarErro, mostrarSucesso } = useAlerta();
    // Guarda os dados de paciente e horário devolvidos pelo serviço.
    const [consulta, setConsulta] = useState<Appointment | null>(null);
    // Controla a espera enquanto o pedido é carregado.
    const [carregando, setCarregando] = useState(true);
    // Guarda a confirmação ou recusa que aguarda resposta no diálogo.
    const [acao, setAcao] = useState<AcaoSolicitacao | null>(null);
    // Desativa ações enquanto a mudança está sendo salva.
    const [salvando, setSalvando] = useState(false);
    const [anexos, setAnexos] = useState<Attachment[]>([]);
    const [baixando, setBaixando] = useState<string | null>(null);

    // Busca os dados permitidos deste pedido ao abrir a tela.
    // Busca a solicitação assim que os parâmetros da rota e a sessão estiverem prontos.
    useEffect(() => {
        if (!id || !user) return;
        Promise.all([
            getAppointmentById(id, user.userId, "PSYCHOLOGIST"),
            listAttachments(id, user.userId, "PSYCHOLOGIST"),
        ])
            .then(([pedido, documentos]) => { setConsulta(pedido); setAnexos(documentos); })
            .catch((erro) => mostrarErro("Erro ao carregar solicitação", motivoDoErro(erro)))
            .finally(() => setCarregando(false));
    }, [id, user, mostrarErro]);

    // Baixa um documento depois que o serviço confirma o acesso do psicólogo.
    async function baixar(item: Attachment) {
        if (!user) return;
        setBaixando(item.id);
        try {
            const resultado = await baixarAnexo(item, user.userId, "PSYCHOLOGIST");
            mostrarSucesso("Arquivo salvo", `Arquivo salvo em ${resultado.pasta}.`);
        } catch (erro) { mostrarErro("Erro ao baixar arquivo", motivoDoErro(erro)); }
        finally { setBaixando(null); }
    }

    // Baixa todos os documentos de forma sequencial na pasta escolhida.
    async function baixarTodos() {
        if (!user) return;
        setBaixando("todos");
        try {
            let destino = "pasta selecionada";
            for (const item of anexos) destino = (await baixarAnexo(item, user.userId, "PSYCHOLOGIST")).pasta;
            mostrarSucesso("Arquivos salvos", `${anexos.length} arquivos salvos em ${destino}.`);
        } catch (erro) { mostrarErro("Erro ao baixar arquivos", motivoDoErro(erro)); }
        finally { setBaixando(null); }
    }

    // Confirma a ação escolhida e volta à lista quando a atualização termina.
    async function confirmarAcao() {
        if (!id || !user || !acao) return;
        setSalvando(true);
        try {
            // O serviço grava o novo estado e gera o link quando a ação é confirmar.
            await updateAppointmentStatus(id, acao, user.userId);
            roteador.replace("/psicologo/solicitacoes" as any);
        } catch (erro) {
            mostrarErro(acao === "CONFIRMED" ? "Erro ao confirmar consulta" : "Erro ao recusar consulta", motivoDoErro(erro));
        } finally {
            setSalvando(false);
            setAcao(null);
        }
    }

    if (carregando) return <View style={estilos.centro}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!consulta) return <View style={estilos.centro}><Text style={estilos.meta}>Solicitação não encontrada.</Text><Pressable onPress={() => roteador.replace("/psicologo/solicitacoes" as any)}><Text style={estilos.link}>Voltar às solicitações</Text></Pressable></View>;

    return (
        <ScrollView contentContainerStyle={estilos.tela}>
            <Pressable onPress={() => roteador.back()} style={estilos.voltar}><Ionicons name="chevron-back" size={18} color={COLORS.primaryDark} /><Text style={estilos.link}>Voltar</Text></Pressable>
            <Text style={estilos.titulo}>Solicitação de consulta</Text>
            <View style={estilos.cartao}>
                <View style={estilos.paciente}>
                    <Avatar userId={consulta.patientId} size={72} />
                    <View style={estilos.dados}><Text style={estilos.nome}>{consulta.patientName}</Text><Text style={estilos.meta}>Paciente</Text></View>
                </View>
                <View style={estilos.linhaInfo}><Ionicons name="calendar-outline" size={19} color={COLORS.primaryDark} /><Text style={estilos.valor}>{formatarDia(consulta.date)}</Text></View>
                <View style={estilos.linhaInfo}><Ionicons name="time-outline" size={19} color={COLORS.primaryDark} /><Text style={estilos.valor}>{formatarHora(consulta.date)}</Text></View>
                {/* Navega para o perfil do paciente com os dados já existentes. */}
                <Pressable onPress={() => roteador.push(`/psicologo/paciente/${consulta.patientId}` as any)} style={({ pressed }) => [estilos.botaoSecundario, pressed && estilos.pressionado]}>
                    <Ionicons name="person-outline" size={18} color={COLORS.primaryDark} /><Text style={estilos.textoSecundario}>Ver perfil do paciente</Text>
                </Pressable>
                {consulta.status === "PENDING" ? (
                    <View style={estilos.acoes}>
                        <Pressable disabled={salvando} onPress={() => setAcao("CONFIRMED")} style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}><Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" /><Text style={estilos.textoBotao}>Confirmar consulta</Text></Pressable>
                        <Pressable disabled={salvando} onPress={() => setAcao("CANCELLED")} style={({ pressed }) => [estilos.botaoRecusar, pressed && estilos.pressionado]}><Ionicons name="close-circle-outline" size={19} color="#B4232F" /><Text style={estilos.textoRecusar}>Recusar</Text></Pressable>
                    </View>
                ) : <Text style={estilos.meta}>Esta solicitação já foi respondida.</Text>}
            </View>
            <Text style={estilos.tituloDocumentos}>Documentos enviados pelo paciente</Text>
            {anexos.length === 0 ? <Text style={estilos.meta}>Nenhum documento anexado a esta solicitação.</Text> : <>
                {anexos.map((anexo) => <CartaoAnexo key={anexo.id} anexo={anexo} aoBaixar={() => void baixar(anexo)} carregando={baixando === anexo.id} />)}
                {anexos.length > 1 && <Pressable disabled={baixando === "todos"} onPress={() => void baixarTodos()} style={estilos.baixarTodos}><Ionicons name="download-outline" size={18} color={COLORS.primaryDark} /><Text style={estilos.baixarTodosTexto}>{baixando === "todos" ? "Baixando..." : "Baixar todos"}</Text></Pressable>}
            </>}
            <ConfirmDialog visible={!!acao} title={acao === "CONFIRMED" ? "Confirmar consulta?" : "Recusar consulta?"} message={acao === "CONFIRMED" ? "A consulta ficará confirmada e receberá um link falso para a chamada." : "A consulta será marcada como cancelada."} confirmLabel={acao === "CONFIRMED" ? "Confirmar" : "Recusar"} onCancel={() => setAcao(null)} onConfirm={() => void confirmarAcao()} />
        </ScrollView>
    );
}

// Estes estilos organizam os dados do paciente e os botões de resposta em um cartão.
const estilos = StyleSheet.create({
    tela: { flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor: COLORS.background },
    centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: COLORS.background },
    voltar: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, padding: 8 },
    link: { color: COLORS.primaryDark, fontWeight: "700" },
    titulo: { color: COLORS.text, fontSize: 24, fontWeight: "700", marginBottom: 18 },
    cartao: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, gap: 16 },
    paciente: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 4 },
    dados: { flex: 1, gap: 4 },
    nome: { color: COLORS.text, fontSize: 19, fontWeight: "700" },
    meta: { color: COLORS.textSecondary, fontSize: 14 },
    linhaInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    valor: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
    botaoSecundario: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    textoSecundario: { color: COLORS.primaryDark, fontSize: 14, fontWeight: "700" },
    acoes: { gap: 10, marginTop: 6 },
    botao: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, backgroundColor: COLORS.primary },
    textoBotao: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    botaoRecusar: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, backgroundColor: "#FBEAEA" },
    textoRecusar: { color: "#B4232F", fontSize: 14, fontWeight: "700" },
    tituloDocumentos: { color: COLORS.text, fontSize: 19, fontWeight: "700", marginTop: 24, marginBottom: 8 },
    baixarTodos: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10, borderRadius: 999, backgroundColor: COLORS.primaryLight },
    baixarTodosTexto: { color: COLORS.primaryDark, fontWeight: "700" },
    pressionado: { opacity: 0.82, transform: [{ scale: 0.99 }] }
});
