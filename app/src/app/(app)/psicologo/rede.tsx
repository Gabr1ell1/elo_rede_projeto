// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/rede.tsx é importado pelas telas ou componentes correspondentes.

// Esta tela lista os colegas que aceitaram aparecer na rede profissional.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { buscarRedeDePsicologos } from "../../../services/api";
import { Psychologist } from "../../../types/clinic";
import { Avatar } from "../../../components/avatar";
import { COLORS } from "../../../constants/cores";

// A logo precisa subir uma pasta a mais que o caminho das constantes.
const LOGO_REDE = require("../../../../assets/images/elo-logo-branca.png");

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function RedeDePsicologos() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();

    // Esta lista contém apenas colegas visíveis e diferentes do usuário logado.
    const [listaPsicologos, setListaPsicologos] = useState<Psychologist[]>([]);
    // Este texto é usado para procurar por nome, especialidade ou abordagem.
    const [textoBusca, setTextoBusca] = useState("");
    // Este estado controla o indicador enquanto os dados são carregados.
    const [carregando, setCarregando] = useState(true);
    // Esta mensagem mostra falhas ao carregar ou abrir um contato.
    const [erro, setErro] = useState("");
    // Este estado destaca o campo de busca enquanto ele está em uso.
    const [buscaEmFoco, setBuscaEmFoco] = useState(false);

    // Busca os colegas autorizados e mantém a tela atualizada se o usuário mudar.
    const carregarRede = useCallback(async () => {
        if (!user?.userId) {
            setCarregando(false);
            return;
        }
        setCarregando(true);
        setErro("");
        try {
            const psicologos = await buscarRedeDePsicologos(user.userId);
            setListaPsicologos(psicologos);
        } catch (motivo) {
            setErro(motivo instanceof Error ? motivo.message : "Não foi possível carregar a rede.");
        } finally {
            setCarregando(false);
        }
    }, [user?.userId]);

    // Carrega a rede ao abrir a página ou trocar de usuário.
    useEffect(() => {
        void carregarRede();
    }, [carregarRede]);

    // Filtra os profissionais sem diferenciar letras maiúsculas e minúsculas.
    const listaFiltrada = useMemo(() => {
        const busca = textoBusca.trim().toLocaleLowerCase("pt-BR");
        if (!busca) return listaPsicologos;
        return listaPsicologos.filter((psicologo) =>
            [psicologo.name, psicologo.specialty, psicologo.approach ?? ""]
                .some((texto) => texto.toLocaleLowerCase("pt-BR").includes(busca))
        );
    }, [listaPsicologos, textoBusca]);

    // Abre o WhatsApp ou o e-mail e mostra um aviso se o aparelho não conseguir.
    async function abrirContato(endereco: string) {
        setErro("");
        try {
            await Linking.openURL(endereco);
        } catch {
            setErro("Não foi possível abrir esse contato. Tente novamente.");
        }
    }

    // Esta área repete a barra de navegação usada nas telas do psicólogo.
    const hero = (
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
            <View style={styles.decorCircle} />

            <View style={styles.topRow}>
                <Image
                    source={LOGO_REDE}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Elo - Psicologia clínica em rede"
                />

                <View style={styles.navActions}>
                    {/* Este botão volta para a agenda do psicólogo. */}
                    <Pressable
                        onPress={() => router.push("/psicologo" as any)}
                        accessibilityLabel="Minha agenda"
                        style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                    </Pressable>

                    {/* Este botão abre o perfil profissional. */}
                    <Pressable
                        onPress={() => router.push("/psicologo/perfil" as any)}
                        accessibilityLabel="Editar meu perfil"
                        style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}
                    >
                        <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                    </Pressable>

                    {/* Este botão mostra que a pessoa está na rede de psicólogos. */}
                    <Pressable
                        onPress={() => router.push("/psicologo/rede" as any)}
                        accessibilityLabel="Rede de psicólogos"
                        style={({ pressed }) => [styles.navIcon, styles.navIconActive, pressed && styles.pressed]}
                    >
                        <Ionicons name="globe" size={20} color="#FFFFFF" />
                    </Pressable>

                    {/* Este botão encerra a sessão, igual nas outras telas. */}
                    <Pressable
                        onPress={signOut}
                        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.logoutText}>Sair</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.content}>
                {/* Este botão retorna à agenda ou à tela anterior. */}
                <Pressable
                    onPress={() => router.canGoBack() ? router.back() : router.replace("/psicologo" as any)}
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                    <Text style={styles.backText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );

    // O título, a contagem, a busca e os avisos ficam antes dos cartões.
    const cabecalhoLista = (
        <View style={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Rede de psicólogos</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{listaFiltrada.length}</Text>
                </View>
            </View>

            <Text style={styles.subtitle}>
                Converse com outros psicólogos e conheça a abordagem de cada um
            </Text>

            {/* Este campo procura colegas por nome, especialidade ou abordagem. */}
            <View style={[styles.searchField, buscaEmFoco && styles.searchFieldFocused]}>
                <Ionicons name="search-outline" size={20} color={COLORS.primaryDark} />
                <TextInput
                    style={styles.searchInput}
                    value={textoBusca}
                    onChangeText={setTextoBusca}
                    onFocus={() => setBuscaEmFoco(true)}
                    onBlur={() => setBuscaEmFoco(false)}
                    placeholder="Buscar psicólogo, especialidade ou abordagem"
                    placeholderTextColor={COLORS.textSecondary}
                    accessibilityLabel="Buscar psicólogos na rede"
                />
                {!!textoBusca && (
                    <Pressable onPress={() => setTextoBusca("")} accessibilityLabel="Limpar busca">
                        <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                    </Pressable>
                )}
            </View>

            {!!erro && (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{erro}</Text>
                </View>
            )}
        </View>
    );

    // Esta tela junta a barra fixa, os estados de carregamento e a lista filtrada.
    return (
        <View style={styles.screen}>
            {hero}
            <FlatList
                data={carregando ? [] : listaFiltrada}
                keyExtractor={(psicologo) => psicologo.id}
                ListHeaderComponent={cabecalhoLista}
                contentContainerStyle={styles.list}
                style={styles.scroll}
                showsVerticalScrollIndicator
                ListEmptyComponent={
                    <View style={styles.content}>
                        {carregando ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loading} />
                        ) : (
                            <View style={styles.empty}>
                                <Ionicons name="people-outline" size={28} color={COLORS.textSecondary} />
                                <Text style={styles.emptyText}>Nenhum psicólogo encontrado</Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item: psicologo }) => {
                    const numero = (psicologo.whatsapp ?? "").replace(/\D/g, "");
                    const numeroSemPais = numero.startsWith("55") ? numero.slice(2) : numero;
                    return (
                        <View style={styles.content}>
                            {/* Este cartão resume o perfil sem cortar a bio depois de três linhas. */}
                            <View style={[styles.card, styles.pressedCard]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatarClip}>
                                        <Avatar userId={psicologo.userId} size={64} />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName} numberOfLines={1}>{psicologo.name}</Text>
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText} numberOfLines={1}>{psicologo.specialty}</Text>
                                        </View>
                                    </View>
                                </View>

                                {psicologo.yearsOfExperience !== undefined && (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="time-outline" size={16} color={COLORS.primaryDark} />
                                        <Text style={styles.detailText}>
                                            {psicologo.yearsOfExperience} {psicologo.yearsOfExperience === 1 ? "ano" : "anos"} de experiência
                                        </Text>
                                    </View>
                                )}
                                {!!psicologo.approach && (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primaryDark} />
                                        <Text style={styles.detailText}>{psicologo.approach}</Text>
                                    </View>
                                )}
                                {!!psicologo.bio && <Text style={styles.bio} numberOfLines={3}>{psicologo.bio}</Text>}

                                <View style={styles.contactActions}>
                                    {!!numero && (
                                        <Pressable
                                            onPress={() => void abrirContato(`https://wa.me/55${numeroSemPais}`)}
                                            style={({ pressed }) => [styles.contactButton, pressed && styles.pressed]}
                                        >
                                            <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
                                            <Text style={styles.contactButtonText}>WhatsApp</Text>
                                        </Pressable>
                                    )}
                                    {!!psicologo.email && (
                                        <Pressable
                                            onPress={() => void abrirContato(`mailto:${psicologo.email}`)}
                                            style={({ pressed }) => [styles.contactButton, pressed && styles.pressed]}
                                        >
                                            <Ionicons name="mail-outline" size={17} color="#FFFFFF" />
                                            <Text style={styles.contactButtonText}>E-mail</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

// Estes estilos repetem os mesmos elementos visuais da agenda e do perfil.
const styles = StyleSheet.create({
    // A tela usa o fundo e o espaço de conteúdo comuns ao restante do app.
    screen: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flex: 1 },
    list: { paddingTop: 28, paddingBottom: 40 },
    content: { width: "100%", maxWidth: 900, alignSelf: "center", paddingHorizontal: 20 },
    loading: { marginTop: 32 },

    // A hero verde e o círculo decorativo combinam com as telas do psicólogo.
    hero: {
        backgroundColor: COLORS.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: "hidden",
        gap: 10
    },
    decorCircle: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -90,
        right: -50,
        backgroundColor: COLORS.accent,
        opacity: 0.3
    },

    // A linha de navegação mantém a logo, os ícones redondos e o botão de sair.
    topRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24
    },
    logo: { width: 162, height: 60 },
    navActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    navIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    navIconActive: { backgroundColor: "rgba(255,255,255,0.34)" },
    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    logoutText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
    back: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 8,
        paddingLeft: 10,
        paddingRight: 16,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    backText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

    // O título e o número usam o cabeçalho e o badge das outras listas.
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: "700", flexShrink: 1 },
    badge: {
        minWidth: 26,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center"
    },
    badgeText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "700" },
    subtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 16 },

    // O campo de busca usa a borda verde que já aparece nos formulários do perfil.
    searchField: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        marginBottom: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card
    },
    searchFieldFocused: { borderColor: COLORS.primary },
    searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },

    // A caixa vermelha é a mesma usada para erros nas telas atuais.
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginBottom: 14,
        borderRadius: 14,
        backgroundColor: "#FBEAEA"
    },
    errorText: { flex: 1, color: COLORS.error, fontSize: 13 },
    empty: { alignItems: "center", gap: 10, paddingVertical: 40 },
    emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center" },

    // Os cartões têm fundo, borda, sombra e cantos iguais aos cartões da agenda.
    card: {
        padding: 18,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    pressedCard: { opacity: 1 },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
    avatarClip: { width: 64, height: 64, borderRadius: 32, overflow: "hidden", backgroundColor: COLORS.primaryLight },
    cardInfo: { flex: 1, gap: 8 },
    cardName: { color: COLORS.text, fontSize: 17, fontWeight: "700" },
    chip: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight
    },
    chipText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "600" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6 },
    detailText: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
    bio: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginTop: 12 },

    // Os botões de contato reutilizam a cor principal e o efeito de toque do app.
    contactActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: COLORS.primary
    },
    contactButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] }
});
