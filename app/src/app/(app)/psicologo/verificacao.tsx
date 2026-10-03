// Para que serve este arquivo: Recebe um CRP e mostra o andamento da verificação demonstrativa.
// Onde é usado: O layout do psicólogo redireciona para esta tela enquanto o CRP não estiver verificado.

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { useAuth } from "../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../context/AlertaContext";
import { enviarCrp, getPsychologistById } from "../../../services/api";
import { validarCrp } from "../../../validacoes/crp";
import { Psychologist } from "../../../types/clinic";
import { COLORS } from "../../../constants/cores";

// O caminho da logo precisa de um nível a mais que os imports para constants.
const LOGO = require("../../../../assets/images/elo-logo-branca.png");

const NOMES_STATUS: Record<Psychologist["statusCrp"], string> = {
    SEM_ENVIO: "Documentação não enviada",
    AGUARDANDO: "Aguardando confirmação",
    VERIFICADO: "CRP verificado"
};

// Mostra o formulário, envia o CRP e acompanha o estado do mock. Exemplo: profissional recém-cadastrado.
export default function VerificacaoCrp() {
    const roteador = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { mostrarErro } = useAlerta();
    const [crp, setCrp] = useState("");
    const [statusCrp, setStatusCrp] = useState<Psychologist["statusCrp"]>("SEM_ENVIO");
    const [enviando, setEnviando] = useState(false);

    // Busca o estado salvo ao abrir a tela para manter o formulário sincronizado.
    const atualizarStatus = useCallback(async () => {
        if (!user) return;
        try {
            const perfil = await getPsychologistById(user.userId, user.userId);
            if (perfil) {
                setCrp(perfil.crp ?? "");
                setStatusCrp(perfil.statusCrp);
            }
        } catch (erro) {
            mostrarErro("Erro ao carregar verificação", motivoDoErro(erro));
        }
    }, [user, mostrarErro]);

    useEffect(() => { void atualizarStatus(); }, [atualizarStatus]);

    // Enquanto aguarda, consulta o perfil a cada segundo para refletir a mudança automática do mock.
    useEffect(() => {
        if (statusCrp !== "AGUARDANDO") return;
        const temporizador = setInterval(() => { void atualizarStatus(); }, 1000);
        return () => clearInterval(temporizador);
    }, [statusCrp, atualizarStatus]);

    // Valida o padrão informado e grava o estado AGUARDANDO. Exemplo: enviar "06/12345".
    async function enviarParaVerificacao() {
        if (!user) return;
        if (!validarCrp(crp)) {
            mostrarErro("CRP inválido", "Digite o CRP no formato 00/00000, por exemplo 06/12345.");
            return;
        }
        setEnviando(true);
        try {
            const perfil = await enviarCrp(user.userId, crp.trim());
            setStatusCrp(perfil.statusCrp);
        } catch (erro) {
            mostrarErro("Erro ao enviar CRP", motivoDoErro(erro));
        } finally {
            setEnviando(false);
        }
    }

    const aguarda = statusCrp === "AGUARDANDO";
    const verificado = statusCrp === "VERIFICADO";
    const corStatus = verificado ? COLORS.primaryDark : aguarda ? "#B4232F" : COLORS.textSecondary;

    return (
        <View style={estilos.tela}>
            <View style={[estilos.hero, { paddingTop: insets.top + 16 }]}>
                <View style={estilos.decorCircle} />
                <View style={estilos.topRow}>
                    <Image source={LOGO} style={estilos.logo} resizeMode="contain" accessibilityLabel="Elo" />
                    <MenuSanduiche />
                </View>
                <View style={estilos.conteudo}>
                    <Text style={estilos.tituloHero}>Verificação profissional</Text>
                    <Text style={estilos.subtituloHero}>Informe seu registro para liberar o aplicativo.</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={estilos.lista}>
                <View style={estilos.conteudo}>
                    <View style={estilos.aviso}>
                        <Ionicons name="alert-circle-outline" size={20} color="#B4232F" />
                        <Text style={estilos.textoAviso}>Verifique seu CRP para liberar o app</Text>
                    </View>
                    <View style={estilos.cartao}>
                        <Text style={estilos.rotulo}>Número do CRP</Text>
                        <View style={estilos.campo}>
                            <Ionicons name="ribbon-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput value={crp} onChangeText={setCrp} placeholder="06/12345" keyboardType="numbers-and-punctuation" style={estilos.entrada} editable={!aguarda && !verificado} />
                        </View>
                        <View style={[estilos.selo, { backgroundColor: verificado ? COLORS.primaryLight : aguarda ? "#FBEAEA" : "#EEF0F0" }]}>
                            {aguarda && <ActivityIndicator size="small" color={corStatus} />}
                            <Text style={[estilos.textoSelo, { color: corStatus }]}>{NOMES_STATUS[statusCrp]}</Text>
                        </View>
                        <Text style={estilos.nota}>Esta conferência é FALSA e serve somente para demonstração.</Text>
                        {!verificado && (
                            <Pressable onPress={() => void enviarParaVerificacao()} disabled={enviando || aguarda} style={({ pressed }) => [estilos.botao, (pressed || enviando) && estilos.pressionado]}>
                                {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="send-outline" size={18} color="#FFFFFF" />}
                                <Text style={estilos.textoBotao}>{aguarda ? "Aguardando confirmação" : "Enviar para verificação"}</Text>
                            </Pressable>
                        )}
                        {verificado && (
                            <Pressable onPress={() => roteador.replace("/psicologo" as any)} style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}>
                                <Text style={estilos.textoBotao}>Continuar para o aplicativo</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Estes estilos mantêm a hero verde, os cartões arredondados e os estados de CRP fáceis de distinguir.
const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: COLORS.background },
    hero: { backgroundColor: COLORS.primary, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden", gap: 16 },
    decorCircle: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -90, right: -50, backgroundColor: COLORS.accent, opacity: 0.3 },
    topRow: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
    logo: { width: 162, height: 60 },
    conteudo: { width: "100%", maxWidth: 900, alignSelf: "center", paddingHorizontal: 20 },
    tituloHero: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
    subtituloHero: { color: "#E8F3F1", fontSize: 14, marginTop: 5 },
    lista: { paddingTop: 24, paddingBottom: 40 },
    aviso: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, marginBottom: 16, borderRadius: 14, backgroundColor: "#FBEAEA" },
    textoAviso: { flex: 1, color: "#B4232F", fontWeight: "700", fontSize: 14 },
    cartao: { padding: 20, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)" },
    rotulo: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 8 },
    campo: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
    entrada: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
    selo: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, paddingHorizontal: 13, marginTop: 18, borderRadius: 999 },
    textoSelo: { fontSize: 13, fontWeight: "700" },
    nota: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 16 },
    botao: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, paddingHorizontal: 18, borderRadius: 999, backgroundColor: COLORS.primary },
    textoBotao: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    pressionado: { opacity: 0.82, transform: [{ scale: 0.99 }] }
});
