// Esta é a página inicial do paciente, com a lista de profissionais.
import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    Pressable,
    Platform,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getPsychologists } from "../../../services/api";
import { Psychologist } from "../../../types/clinic";
import { Avatar } from "../../../components/avatar";
import { COLORS } from "../../../constants/cores";

// Coloque o arquivo em: app/assets/images/elo-logo-branca.png
const LOGO = require("../../../../assets/images/elo-logo-branca.png");

export default function PatientHome() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
    const [loading, setLoading] = useState(true);

    const username = (user?.username ?? "").trim();

    useEffect(() => {
        getPsychologists()
            .then(setPsychologists)
            .catch(() => setPsychologists([]))
            .finally(() => setLoading(false));
    }, []);

    const header = (
        <View style={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Psicólogos disponíveis</Text>
                {!loading && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{psychologists.length}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.screen}>
            {/* BARRA SUPERIOR (fixa) */}
            <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
                <View style={styles.decorCircle} />

                {/* NAVBAR: logo no canto esquerdo, ações no direito */}
                <View style={styles.topRow}>
                    <Image
                        source={LOGO}
                        style={styles.logo}
                        resizeMode="contain"
                        accessibilityLabel="Elo - Psicologia clínica em rede"
                    />

                    <View style={styles.navActions}>
                        {/* Este botão abre a rota de consultas, renomeada em português. */}
                        <Pressable
                            onPress={() => router.push("/paciente/consultas" as any)}
                            accessibilityLabel="Minhas consultas"
                            style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                        </Pressable>

                        {/* Este botão abre a rota de perfil, renomeada em português. */}
                        <Pressable
                            onPress={() => router.push("/paciente/perfil" as any)}
                            accessibilityLabel="Meu perfil"
                            style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}
                        >
                            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                        </Pressable>

                        <Pressable
                            onPress={signOut}
                            style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
                        >
                            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.logoutText}>Sair</Text>
                        </Pressable>
                    </View>
                </View>

                {/* boas-vindas: mesmo container da lista, então alinha com ela */}
                <View style={styles.content}>
                    <View style={styles.userRow}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatarClip48}>
                                <Avatar userId={user?.userId ?? ""} size={48} />
                            </View>
                        </View>
                        <View style={{ flexShrink: 1 }}>
                            <Text style={styles.heroLabel}>Bem-vindo(a)</Text>
                            <Text style={styles.heroTitle} numberOfLines={1}>
                                {`Olá, ${username}!`}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* CONTEÚDO COM ROLAGEM */}
            <FlatList
                data={loading ? [] : psychologists}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                contentContainerStyle={styles.list}
                style={styles.scroll}
                showsVerticalScrollIndicator
                persistentScrollbar={Platform.OS === "android"}
                ListEmptyComponent={
                    <View style={styles.content}>
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={COLORS.primary}
                                style={{ marginTop: 32 }}
                            />
                        ) : (
                            <View style={styles.empty}>
                                <Ionicons name="search-outline" size={28} color={COLORS.textSecondary} />
                                <Text style={styles.emptyText}>
                                    Nenhum psicólogo disponível no momento.
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.content}>
                        {/* Esta tela abre os horários pela rota rede. */}
                        <Pressable
                            onPress={() => router.push(`/paciente/rede/${item.id}` as any)}
                            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                        >
                            <View style={styles.cardRow}>
                                <View style={styles.avatarClip56}>
                                    <Avatar userId={item.userId} size={56} />
                                </View>

                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName} numberOfLines={1}>
                                        {item.name}
                                    </Text>

                                    {/* tag da especialidade + valor lado a lado */}
                                    <View style={styles.tagRow}>
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText} numberOfLines={1}>
                                                {item.specialty}
                                            </Text>
                                        </View>

                                        <Text style={styles.cardPrice}>
                                            R$ {item.price.toFixed(2).replace(".", ",")}
                                            <Text style={styles.cardPriceUnit}> / sessão</Text>
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cta}>
                                    <Text style={styles.ctaText}>Ver horários</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                                </View>
                            </View>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    // ===== BARRA SUPERIOR =====
  hero: {
    backgroundColor: COLORS.primary,
    paddingBottom: 20,   // era 26
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    gap: 6               // era 22
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
    // largura total: logo encosta no canto esquerdo
    topRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24
    },
    // proporção do arquivo: 431 x 160
    logo: {
        width: 162,
        height: 60
    },
    navActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    navIcon: {
        width: 44,
        height: 44,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    avatarRing: {
        padding: 3,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.7)"
    },
    avatarClip48: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: COLORS.primaryLight
    },
    heroLabel: {
        color: "#E8F3F1",
        fontSize: 13,
        marginBottom: 2
    },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700"
    },
    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600"
    },

    // ===== CONTEÚDO =====
    scroll: {
        flex: 1
    },
    list: {
        paddingTop: 28,
        paddingBottom: 40
    },
    content: {
        width: "100%",
        maxWidth: 900,
        alignSelf: "center",
        paddingHorizontal: 20
    },

    // ===== TÍTULO DA LISTA =====
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 18
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "700"
    },
    badge: {
        minWidth: 26,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center"
    },
    badgeText: {
        color: COLORS.primaryDark,
        fontSize: 13,
        fontWeight: "700"
    },

    // ===== CARD DO PSICÓLOGO =====
    card: {
        padding: 18,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    avatarClip56: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: COLORS.primaryLight
    },
    cardInfo: {
        flex: 1,
        gap: 10
    },
    cardName: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700"
    },
    // tag + preço; quebra de linha automática em telas estreitas
    tagRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: 12,
        rowGap: 6
    },
    chip: {
        maxWidth: "100%",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight
    },
    chipText: {
        color: COLORS.primaryDark,
        fontSize: 12,
        fontWeight: "600"
    },
    cardPrice: {
        color: COLORS.primaryDark,
        fontSize: 14,
        fontWeight: "700"
    },
    cardPriceUnit: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "400"
    },
    cta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 12,
        borderRadius: 999,
        backgroundColor: COLORS.primary
    },
    ctaText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700"
    },

    // ===== ESTADOS =====
    empty: {
        alignItems: "center",
        gap: 10,
        paddingVertical: 40
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center"
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    }
});
