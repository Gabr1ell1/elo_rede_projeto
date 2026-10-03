// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/index.tsx é importado pelas telas ou componentes correspondentes.

// Esta é a agenda do psicólogo, com ações para confirmar ou recusar consultas.
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { useCallback, useEffect, useState } from "react";
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
import { getMyAppointmentsAsPsychologist, updateAppointmentStatus } from "../../../services/api";
import { Appointment } from "../../../types/clinic";
import { Avatar } from "../../../components/avatar";
import { COLORS } from "../../../constants/cores";
// A agenda importa os formatadores compartilhados para manter datas consistentes.
import { formatarDia, formatarHora } from "../../../formatacao/data-hora";

const LOGO = require("../../../../assets/images/elo-logo-branca.png");

const STATUS_LABEL: Record<Appointment["status"], string> = {
    PENDING: "Aguardando sua confirmação",
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

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PsychologistAgenda() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [loading, setLoading] = useState(true);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [error, setError] = useState("");

    const username = (user?.username ?? "").trim();

    const load = useCallback(() => {
        if (!user) return;
        setLoading(true);
        getMyAppointmentsAsPsychologist(user.userId)
            .then(setAppointments)
            .catch((reason) =>
                setError(
                    reason instanceof Error ? reason.message : "Não foi possível carregar a agenda."
                )
            )
            .finally(() => setLoading(false));
    }, [user]);

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        load();
    }, [load]);

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function handleUpdateStatus(id: string, status: Appointment["status"]) {
        try {
            setError("");
            await updateAppointmentStatus(id, status, user!.userId);
            load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível atualizar a consulta.");
        }
    }

    const listHeader = (
        <View style={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Minha agenda</Text>
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
            {/* BARRA SUPERIOR */}
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
                    <View style={styles.userRow}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatarClip48}>
                                <Avatar userId={user?.userId ?? ""} size={48} />
                            </View>
                        </View>
                        <View style={{ flexShrink: 1 }}>
                            <Text style={styles.heroLabel}>Bem-vindo(a)</Text>
                            <Text style={styles.heroTitle} numberOfLines={1}>
                                {`Olá, Dr(a). ${username}!`}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* LISTA */}
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
                                <Ionicons name="calendar-outline" size={28} color={COLORS.textSecondary} />
                                <Text style={styles.emptyText}>Nenhuma consulta recebida ainda.</Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => {
                    const status = STATUS_STYLE[item.status];
                    return (
                        <View style={styles.content}>
                            <Pressable
                                onPress={() => router.push(`/psicologo/consulta/${item.id}` as any)}
                                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                            >
                                <View style={styles.cardRow}>
                                    <View style={styles.cardIcon}>
                                        <Ionicons name="person" size={24} color={COLORS.primaryDark} />
                                    </View>

                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName} numberOfLines={1}>
                                            {item.patientName}
                                        </Text>

                                        <View style={styles.metaRow}>
                                            <View style={styles.meta}>
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={15}
                                                    color={COLORS.textSecondary}
                                                />
                                                <Text style={styles.metaText}>{formatarDia(item.date)}</Text>
                                            </View>
                                            <View style={styles.meta}>
                                                <Ionicons
                                                    name="time-outline"
                                                    size={15}
                                                    color={COLORS.textSecondary}
                                                />
                                                <Text style={styles.metaText}>{formatarHora(item.date)}</Text>
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

                                {item.status === "PENDING" && (
                                    <View style={styles.actions}>
                                        <Pressable
                                            onPress={() => handleUpdateStatus(item.id, "CONFIRMED")}
                                            style={({ pressed }) => [
                                                styles.actionButton,
                                                styles.confirm,
                                                pressed && styles.pressed
                                            ]}
                                        >
                                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                            <Text style={styles.confirmText}>Confirmar</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
                                            style={({ pressed }) => [
                                                styles.actionButton,
                                                styles.refuse,
                                                pressed && styles.pressed
                                            ]}
                                        >
                                            <Ionicons name="close" size={16} color="#C95C5C" />
                                            <Text style={styles.refuseText}>Recusar</Text>
                                        </Pressable>
                                    </View>
                                )}
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
        gap: 6
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

    // ===== AÇÕES =====
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 11,
        borderRadius: 999
    },
    confirm: {
        backgroundColor: COLORS.primary
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700"
    },
    refuse: {
        backgroundColor: "#FBEAEA",
        borderWidth: 1,
        borderColor: "#C95C5C"
    },
    refuseText: {
        color: "#C95C5C",
        fontSize: 13,
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
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    }
});
