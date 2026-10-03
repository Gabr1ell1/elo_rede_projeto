// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/paciente/consultas.tsx é importado pelas telas ou componentes correspondentes.

// Esta página mostra as consultas do paciente e permite abrir cada detalhe.
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    Pressable,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getMyAppointmentsAsPatient } from "../../../services/api";
import { Appointment } from "../../../types/clinic";
import { COLORS } from "../../../constants/cores";

const LOGO = require("../../../../assets/images/elo-logo-branca.png");

const STATUS_LABEL: Record<Appointment["status"], string> = {
    PENDING: "Aguardando confirmação",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada"
};

const STATUS_STYLE: Record<
    Appointment["status"],
    { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
    PENDING: { bg: "#FFF4D6", fg: "#9A6B00", icon: "hourglass-outline" },
    CONFIRMED: { bg: COLORS.primaryLight, fg: COLORS.primaryDark, icon: "checkmark-circle-outline" },
    CANCELLED: { bg: "#FBEAEA", fg: "#C95C5C", icon: "close-circle-outline" }
};

const formatDay = (iso: string) => {
    const text = new Date(iso).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PatientAppointments() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [loading, setLoading] = useState(true);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [error, setError] = useState("");

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        if (!user) return;
        getMyAppointmentsAsPatient(user.userId)
            .then(setAppointments)
            .catch((reason) =>
                setError(
                    reason instanceof Error
                        ? reason.message
                        : "Não foi possível carregar suas consultas."
                )
            )
            .finally(() => setLoading(false));
    }, [user]);

    const hero = (
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
            <View style={styles.decorCircle} />

            <View style={styles.topRow}>
                <Image
                    source={LOGO}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Elo - Psicologia clínica em rede"
                />

                <MenuSanduiche />
            </View>

            <View style={styles.content}>
                <Pressable
                    onPress={() =>
                        router.canGoBack() ? router.back() : router.replace("/paciente" as any)
                    }
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                    <Text style={styles.backText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );

    const listHeader = (
        <View style={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Minhas consultas</Text>
                {!loading && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{appointments.length}</Text>
                    </View>
                )}
            </View>

            {!!error && (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={18} color="#C95C5C" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.screen}>
            {hero}

            <FlatList
                data={loading ? [] : appointments}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={listHeader}
                contentContainerStyle={styles.list}
                style={styles.scroll}
                showsVerticalScrollIndicator
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
                                <Ionicons
                                    name="calendar-outline"
                                    size={28}
                                    color={COLORS.textSecondary}
                                />
                                <Text style={styles.emptyText}>Nenhuma consulta ainda.</Text>
                                <Pressable
                                    onPress={() => router.push("/paciente" as any)}
                                    style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                                >
                                    <Text style={styles.emptyButtonText}>Ver psicólogos</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => {
                    const status = STATUS_STYLE[item.status];
                    return (
                        <View style={styles.content}>
                            <Pressable
                                onPress={() => router.push(`/paciente/consulta/${item.id}` as any)}
                                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                            >
                                <View style={styles.cardRow}>
                                    <View style={styles.cardIcon}>
                                        <Ionicons name="person" size={24} color={COLORS.primaryDark} />
                                    </View>

                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName} numberOfLines={1}>
                                            {item.psychologistName}
                                        </Text>

                                        <View style={styles.metaRow}>
                                            <View style={styles.meta}>
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={15}
                                                    color={COLORS.textSecondary}
                                                />
                                                <Text style={styles.metaText}>{formatDay(item.date)}</Text>
                                            </View>
                                            <View style={styles.meta}>
                                                <Ionicons
                                                    name="time-outline"
                                                    size={15}
                                                    color={COLORS.textSecondary}
                                                />
                                                <Text style={styles.metaText}>{formatTime(item.date)}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.status, { backgroundColor: status.bg }]}>
                                            <Ionicons name={status.icon} size={14} color={status.fg} />
                                            <Text style={[styles.statusText, { color: status.fg }]}>
                                                {STATUS_LABEL[item.status]}
                                            </Text>
                                        </View>
                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={COLORS.textSecondary}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    );
                }}
            />
        </View>
    );
}

// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    // ===== BARRA SUPERIOR =====
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
    topRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24
    },
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
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    navIconActive: {
        backgroundColor: "rgba(255,255,255,0.34)"
    },
    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)"
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600"
    },
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
    backText: {
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

    // ===== CARD DA CONSULTA =====
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
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    cardInfo: {
        flex: 1,
        gap: 8
    },
    cardName: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700"
    },
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 14,
        rowGap: 4
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: 13
    },
    status: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700"
    },

    // ===== ESTADOS =====
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginBottom: 14,
        borderRadius: 14,
        backgroundColor: "#FBEAEA"
    },
    errorText: {
        flex: 1,
        color: "#C95C5C",
        fontSize: 13
    },
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
    emptyButton: {
        marginTop: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 999,
        backgroundColor: COLORS.primary
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700"
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    }
});
