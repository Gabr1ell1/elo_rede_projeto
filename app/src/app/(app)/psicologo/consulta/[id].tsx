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
import { getAppointmentById, listAttachments, uploadAttachment } from "../../../../services/api";
import { Appointment, Attachment, AttachmentCategory } from "../../../../types/clinic";
import { formatarDataHora } from "../../../../formatacao/data-hora";
import { COLORS } from "../../../../constants/cores";
import { pickDocument, pickImage, save, takePhoto } from "../../../../services/fileStorage";
import { baixarAnexo } from "../../../../services/download";
import { CartaoAnexo } from "../../../../components/cartao-anexo";

// Carrega os dados da consulta e os anexos que pertencem ao paciente e profissional. Exemplo: abrir pelo cartão da agenda.
export default function DetalheConsultaPsicologo() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const { user } = useAuth();
    const { mostrarErro, mostrarSucesso } = useAlerta();
    // Guarda as informações da consulta atual.
    const [consulta, setConsulta] = useState<Appointment | null>(null);
    // Guarda os anexos associados ao agendamento.
    const [anexos, setAnexos] = useState<Attachment[]>([]);
    // Controla o indicador durante as chamadas de carregamento.
    const [carregando, setCarregando] = useState(true);
    const [categoria, setCategoria] = useState<AttachmentCategory>("REPORT");
    const [enviando, setEnviando] = useState(false);
    const [baixando, setBaixando] = useState<string | null>(null);

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

    // Carrega novamente quando o identificador da rota ou o usuário muda.
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

    // Permite ao psicólogo anexar documentos somente depois que a consulta foi confirmada.
    async function anexarArquivo(origem: "camera" | "gallery" | "file") {
        if (!id || !user || consulta?.status !== "CONFIRMED") return;
        setEnviando(true);
        try {
            const arquivoEscolhido = origem === "camera" ? await takePhoto() : origem === "gallery" ? await pickImage() : await pickDocument();
            if (!arquivoEscolhido) return;
            const arquivo = arquivoEscolhido as { uri: string; name?: string; mimeType?: string; fileSize?: number; size?: number; file?: Blob };
            const nome = arquivo.name || `documento-${Date.now()}.jpg`;
            const mimeType = arquivo.mimeType || (nome.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
            await uploadAttachment(id, { uri: await save(arquivo.uri, nome), name: nome, mimeType, size: arquivo.fileSize ?? arquivo.size ?? 0, blob: arquivo.file }, categoria, user.userId, "PSYCHOLOGIST");
            await carregar();
        } catch (erro) { mostrarErro("Erro ao anexar documento", motivoDoErro(erro)); }
        finally { setEnviando(false); }
    }

    // Baixa documentos recebidos ou enviados pelo psicólogo com validação do participante.
    async function baixar(item: Attachment) {
        if (!user) return;
        setBaixando(item.id);
        try {
            const resultado = await baixarAnexo(item, user.userId, "PSYCHOLOGIST");
            mostrarSucesso("Arquivo salvo", `Arquivo salvo em ${resultado.pasta}.`);
        } catch (erro) { mostrarErro("Erro ao baixar arquivo", motivoDoErro(erro)); }
        finally { setBaixando(null); }
    }

    // Baixa todos os documentos desta consulta em sequência.
    async function baixarTodos() {
        if (!user) return;
        setBaixando("todos");
        try {
            let destino = "pasta selecionada";
            for (const anexo of anexos) destino = (await baixarAnexo(anexo, user.userId, "PSYCHOLOGIST")).pasta;
            mostrarSucesso("Arquivos salvos", `${anexos.length} arquivos salvos em ${destino}.`);
        } catch (erro) { mostrarErro("Erro ao baixar arquivos", motivoDoErro(erro)); }
        finally { setBaixando(null); }
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
                        {/* Abre o endereço FALSO no aplicativo de navegação disponível. */}
                        <Pressable onPress={() => void entrarNaConsulta()} style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}><Ionicons name="videocam-outline" size={18} color="#FFFFFF" /><Text style={estilos.textoBotao}>Entrar na consulta</Text></Pressable>
                        {/* Copia o endereço FALSO para a área de transferência. */}
                        <Pressable onPress={() => void copiarLink()} style={({ pressed }) => [estilos.copiar, pressed && estilos.pressionado]}><Ionicons name="copy-outline" size={17} color={COLORS.primaryDark} /><Text style={estilos.textoCopiar}>Copiar link</Text></Pressable>
                    </View>
                )}
            </View>
            <Text style={estilos.tituloSecao}>Anexos</Text>
            {anexos.length === 0 && <Text style={estilos.meta}>Nenhum anexo enviado.</Text>}
            {anexos.map((anexo) => <CartaoAnexo key={anexo.id} anexo={anexo} aoBaixar={() => void baixar(anexo)} carregando={baixando === anexo.id} enviadoPeloPsicologo={anexo.uploadedBy === user?.userId} />)}
            {anexos.length > 1 && <Pressable disabled={baixando === "todos"} onPress={() => void baixarTodos()} style={estilos.baixarTodos}><Ionicons name="download-outline" size={18} color={COLORS.primaryDark} /><Text style={estilos.baixarTodosTexto}>{baixando === "todos" ? "Baixando..." : "Baixar todos"}</Text></Pressable>}
            {consulta.status === "CONFIRMED" && <View style={estilos.uploadCard}>
                <Text style={estilos.rotulo}>Enviar documento para o paciente</Text>
                <View style={estilos.categorias}>{(["REPORT", "CERTIFICATE", "EXAM"] as AttachmentCategory[]).map((tipo) => <Pressable key={tipo} onPress={() => setCategoria(tipo)} style={[estilos.categoria, categoria === tipo && estilos.categoriaAtiva]}><Text style={[estilos.categoriaTexto, categoria === tipo && estilos.categoriaTextoAtiva]}>{tipo === "REPORT" ? "Laudo" : tipo === "CERTIFICATE" ? "Atestado" : "Exame"}</Text></Pressable>)}</View>
                <View style={estilos.fontes}>{(["camera", "gallery", "file"] as const).map((origem) => <Pressable key={origem} disabled={enviando} onPress={() => void anexarArquivo(origem)} style={estilos.fonte}><Ionicons name={origem === "camera" ? "camera-outline" : origem === "gallery" ? "images-outline" : "document-outline"} size={20} color={COLORS.primaryDark} /><Text style={estilos.fonteTexto}>{origem === "camera" ? "Câmera" : origem === "gallery" ? "Galeria" : "Arquivo"}</Text></Pressable>)}</View>
                {enviando && <ActivityIndicator color={COLORS.primary} />}
            </View>}
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
    baixarTodos: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8, borderRadius: 999, backgroundColor: COLORS.primaryLight },
    baixarTodosTexto: { color: COLORS.primaryDark, fontWeight: "700" },
    uploadCard: { gap: 12, marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
    categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    categoria: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border },
    categoriaAtiva: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    categoriaTexto: { color: COLORS.textSecondary, fontSize: 12 },
    categoriaTextoAtiva: { color: COLORS.primaryDark, fontWeight: "700" },
    fontes: { flexDirection: "row", gap: 8 },
    fonte: { flex: 1, alignItems: "center", gap: 6, padding: 12, borderRadius: 12, backgroundColor: COLORS.background },
    fonteTexto: { color: COLORS.text, fontSize: 11, fontWeight: "600" },
    pressionado: { opacity: 0.82, transform: [{ scale: 0.99 }] }
});
