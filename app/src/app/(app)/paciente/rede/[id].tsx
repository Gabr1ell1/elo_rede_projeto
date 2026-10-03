// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/paciente/rede/[id].tsx é importado pelas telas ou componentes correspondentes.

// Esta página mostra o perfil do profissional e os horários para agendamento.
import { MenuSanduiche } from "../../../../components/menu-sanduiche";
import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/AuthContext";
import { getPsychologistById, requestAppointment } from "../../../../services/api";
import { Psychologist } from "../../../../types/clinic";
import { ConfirmDialog } from "../../../../components/confirmar-dialogo";
import { Avatar } from "../../../../components/avatar";
import { COLORS } from "../../../../constants/cores";
// O perfil de profissional e seus horários usam os formatadores compartilhados.
import { formatarDia, formatarHora } from "../../../../formatacao/data-hora";
import { formatarPreco } from "../../../../formatacao/preco";

const LOGO = require("../../../../../assets/images/elo-logo-branca.png");

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PsychologistProfile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, signOut } = useAuth();
    const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [loading, setLoading] = useState(true);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [requesting, setRequesting] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [error, setError] = useState("");

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        if (!id) return;
        getPsychologistById(id)
            .then((p) => setPsychologist(p ?? null))
            .finally(() => setLoading(false));
    }, [id]);

    // agrupa os horários por dia, em ordem cronológica
    const days = useMemo(() => {
        const slots = [...(psychologist?.availableSlots ?? [])].sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        const map = new Map<string, string[]>();
        slots.forEach((slot) => {
            const label = formatarDia(slot);
            map.set(label, [...(map.get(label) ?? []), slot]);
        });
        return Array.from(map.entries());
    }, [psychologist]);

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function handleRequest() {
        const slot = selectedSlot;
        if (!psychologist || !user || !slot) return;

        setRequesting(true);
        try {
            await requestAppointment(user.userId, user.username, psychologist, slot);
            setSelectedSlot(null);
            // Após o agendamento, abre a lista no novo endereço em português.
            router.replace("/paciente/consultas" as any);
        } catch (e) {
            setSelectedSlot(null);
            setError(e instanceof Error ? e.message : "Não foi possível solicitar a consulta.");
        } finally {
            setRequesting(false);
        }
    }

    // barra superior igual à da home + botão voltar
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
                    onPress={() => (router.canGoBack() ? router.back() : router.replace("/paciente" as any))}
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                    <Text style={styles.backText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );

    if (loading || !psychologist) {
        return (
            <View style={styles.screen}>
                {hero}
                <View style={styles.center}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                        <>
                            <Ionicons name="search-outline" size={28} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Psicólogo não encontrado.</Text>
                        </>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            {hero}

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator
            >
                <View style={styles.content}>
                    {/* CARD DO PERFIL */}
                    <View style={styles.card}>
                        <View style={styles.profileTop}>
                            <View style={styles.avatarClip84}>
                                <Avatar userId={psychologist.userId} size={84} />
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{psychologist.name}</Text>
                                <View style={styles.chip}>
                                    <Text style={styles.chipText} numberOfLines={1}>
                                        {psychologist.specialty}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.priceRow}>
                            <View style={styles.priceIcon}>
                                <Ionicons name="cash-outline" size={20} color={COLORS.primaryDark} />
                            </View>
                            <View>
                                <Text style={styles.priceLabel}>Valor da sessão</Text>
                                <Text style={styles.price}>{formatarPreco(psychologist.price)}</Text>
                            </View>
                        </View>

                        {!!psychologist.bio && (
                            <>
                                <Text style={styles.sectionLabel}>Sobre</Text>
                                <Text style={styles.bio}>{psychologist.bio}</Text>
                            </>
                        )}
                    </View>

                    {/* HORÁRIOS */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Horários disponíveis</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{psychologist.availableSlots.length}</Text>
                        </View>
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle-outline" size={18} color="#C95C5C" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {days.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="calendar-outline" size={28} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Sem horários disponíveis no momento.</Text>
                        </View>
                    ) : (
                        days.map(([label, slots]) => (
                            <View key={label} style={styles.dayCard}>
                                <View style={styles.dayHeader}>
                                    <Ionicons name="calendar-outline" size={18} color={COLORS.primaryDark} />
                                    <Text style={styles.dayTitle}>{label}</Text>
                                </View>

                                <View style={styles.slotsWrap}>
                                    {slots.map((slot) => (
                                        <Pressable
                                            key={slot}
                                            disabled={requesting}
                                            onPress={() => {
                                                setError("");
                                                setSelectedSlot(slot);
                                            }}
                                            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
                                        >
                                            <Ionicons name="time-outline" size={15} color={COLORS.primaryDark} />
                                            <Text style={styles.slotText}>{formatarHora(slot)}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <ConfirmDialog
                visible={!!selectedSlot}
                title="Confirmar agendamento"
                message={`${psychologist.name}\n${
                    selectedSlot ? new Date(selectedSlot).toLocaleString("pt-BR") : ""
                }\nValor: ${formatarPreco(psychologist.price)}`}
                onCancel={() => setSelectedSlot(null)}
                onConfirm={handleRequest}
                confirmLabel={requesting ? "Agendando…" : "Confirmar"}
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
        paddingTop: 24,
        paddingBottom: 40
    },
    content: {
        width: "100%",
        maxWidth: 900,
        alignSelf: "center",
        paddingHorizontal: 20
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },

    // ===== CARD DO PERFIL =====
    card: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    profileTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    avatarClip84: {
        width: 84,
        height: 84,
        borderRadius: 42,
        overflow: "hidden",
        backgroundColor: COLORS.primaryLight
    },
    profileInfo: {
        flex: 1,
        gap: 10
    },
    name: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "700"
    },
    chip: {
        alignSelf: "flex-start",
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
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 18
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    priceIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    priceLabel: {
        color: COLORS.textSecondary,
        fontSize: 12
    },
    price: {
        color: COLORS.primaryDark,
        fontSize: 18,
        fontWeight: "700"
    },
    sectionLabel: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 6
    },
    bio: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 21
    },

    // ===== HORÁRIOS =====
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 28,
        marginBottom: 16
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
    dayCard: {
        padding: 16,
        marginBottom: 14,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)",
        gap: 14
    },
    dayHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    dayTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700"
    },
    slotsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },
    slot: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    slotText: {
        color: COLORS.primaryDark,
        fontSize: 14,
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
