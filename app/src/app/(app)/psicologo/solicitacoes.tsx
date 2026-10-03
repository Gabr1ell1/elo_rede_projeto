// Para que serve este arquivo: Lista os pedidos de consulta que aguardam resposta do psicólogo.
// Onde é usado: O menu do psicólogo abre esta rota pelo ícone mail-unread-outline.

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { Avatar } from "../../../components/avatar";
import { useAuth } from "../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../context/AlertaContext";
import { getMyAppointmentsAsPsychologist } from "../../../services/api";
import { Appointment } from "../../../types/clinic";
import { formatarDia, formatarHora } from "../../../formatacao/data-hora";
import { COLORS } from "../../../constants/cores";

// O caminho da logo precisa de um nível a mais que os imports para constants.
const LOGO = require("../../../../assets/images/elo-logo-branca.png");

// Carrega somente os pedidos pendentes do psicólogo logado. Exemplo: atualizar a lista ao entrar.
export default function Solicitacoes() {
    const roteador = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { mostrarErro } = useAlerta();
    // Guarda somente as consultas pendentes deste profissional.
    const [solicitacoes, setSolicitacoes] = useState<Appointment[]>([]);
    // Controla o indicador enquanto a lista é carregada.
    const [carregando, setCarregando] = useState(true);

    // Busca a agenda e mantém apenas os itens que ainda esperam confirmação.
    const carregarSolicitacoes = useCallback(async () => {
        if (!user) return;
        setCarregando(true);
        try {
            const consultas = await getMyAppointmentsAsPsychologist(user.userId);
            setSolicitacoes(consultas.filter((consulta) => consulta.status === "PENDING"));
        } catch (erro) {
            mostrarErro("Erro ao carregar solicitações", motivoDoErro(erro));
        } finally {
            setCarregando(false);
        }
    }, [user, mostrarErro]);

    // Carrega novamente a lista sempre que o usuário atual muda.
    useEffect(() => { void carregarSolicitacoes(); }, [carregarSolicitacoes]);

    return (
        <View style={estilos.tela}>
            <View style={[estilos.hero, { paddingTop: insets.top + 16 }]}>
                <View style={estilos.decorCircle} />
                <View style={estilos.topRow}>
                    <Image source={LOGO} style={estilos.logo} resizeMode="contain" accessibilityLabel="Elo" />
                    <MenuSanduiche />
                </View>
                <View style={estilos.conteudo}>
                    <Text style={estilos.tituloHero}>Solicitações</Text>
                    <Text style={estilos.subtituloHero}>Pedidos de consulta aguardando sua resposta.</Text>
                </View>
            </View>
            <FlatList
                data={carregando ? [] : solicitacoes}
                keyExtractor={(consulta) => consulta.id}
                contentContainerStyle={estilos.lista}
                ListHeaderComponent={<View style={estilos.conteudo}><View style={estilos.cabecalho}><Text style={estilos.tituloSecao}>Pendentes</Text><View style={estilos.badge}><Text style={estilos.badgeTexto}>{solicitacoes.length}</Text></View></View></View>}
                ListEmptyComponent={<View style={estilos.vazio}>{carregando ? <ActivityIndicator size="large" color={COLORS.primary} /> : <><Ionicons name="mail-open-outline" size={30} color={COLORS.textSecondary} /><Text style={estilos.textoVazio}>Nenhuma solicitação pendente.</Text></>}</View>}
                renderItem={({ item }) => (
                    <View style={estilos.conteudo}>
                        {/* Abre a rota de resposta para este pedido. */}
                        <Pressable onPress={() => roteador.push(`/psicologo/solicitacao/${item.id}` as any)} style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}>
                            <View style={estilos.linha}>
                                <Avatar userId={item.patientId} size={54} />
                                <View style={estilos.dados}>
                                    <Text style={estilos.nome}>{item.patientName}</Text>
                                    <Text style={estilos.meta}>{formatarDia(item.date)}</Text>
                                    <Text style={estilos.meta}>{formatarHora(item.date)}</Text>
                                </View>
                                <View style={estilos.contagem}><Text style={estilos.contagemTexto}>1</Text></View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                            </View>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}

// Estes estilos mantêm os cartões de solicitação arredondados e fáceis de tocar.
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
    cabecalho: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    tituloSecao: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
    badge: { minWidth: 26, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: COLORS.primaryLight, alignItems: "center" },
    badgeTexto: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "700" },
    cartao: { padding: 17, marginBottom: 14, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)" },
    linha: { flexDirection: "row", alignItems: "center", gap: 13 },
    dados: { flex: 1, gap: 4 },
    nome: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
    meta: { color: COLORS.textSecondary, fontSize: 13 },
    contagem: { width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#FBEAEA" },
    contagemTexto: { color: "#B4232F", fontSize: 12, fontWeight: "700" },
    vazio: { minHeight: 150, alignItems: "center", justifyContent: "center", gap: 10 },
    textoVazio: { color: COLORS.textSecondary, fontSize: 14 },
    pressionado: { opacity: 0.85, transform: [{ scale: 0.99 }] }
});
