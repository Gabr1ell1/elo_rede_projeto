// Esta página mostra uma consulta e seus anexos para o paciente responsável.
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/AuthContext";
import {
    cancelAppointment,
    deleteAttachment,
    getAppointmentById,
    listAttachments,
    uploadAttachment
} from "../../../../services/api";
import { pickDocument, pickImage, takePhoto, save, remove } from "../../../../services/fileStorage";
import { Appointment, Attachment, AttachmentCategory } from "../../../../types/clinic";
import { ConfirmDialog } from "../../../../components/confirmar-dialogo";
import { Avatar } from "../../../../components/avatar";
import { COLORS } from "../../../../constants/cores";

const LOGO = require("../../../../../assets/images/elo-logo-branca.png");

const categories: AttachmentCategory[] = ["EXAM", "CERTIFICATE", "REPORT", "OTHER"];

const labels: Record<AttachmentCategory, string> = {
    EXAM: "Exame",
    CERTIFICATE: "Atestado",
    REPORT: "Laudo",
    OTHER: "Outro"
};

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

const SOURCES: { key: "camera" | "gallery" | "file"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "camera", label: "Tirar foto", icon: "camera-outline" },
    { key: "gallery", label: "Galeria", icon: "images-outline" },
    { key: "file", label: "Arquivo", icon: "document-outline" }
];

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

export default function AppointmentDetail() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, signOut } = useAuth();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [items, setItems] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [category, setCategory] = useState<AttachmentCategory>("OTHER");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!id || !user) return;
        try {
            const item = await getAppointmentById(id, user.userId, "PATIENT");
            setAppointment(item);
            setItems(await listAttachments(id, user.userId, "PATIENT"));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível abrir a consulta.");
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        load();
    }, [load]);

    async function addFile(source: "camera" | "gallery" | "file") {
        try {
            setError("");
            const asset =
                source === "camera"
                    ? await takePhoto()
                    : source === "gallery"
                    ? await pickImage()
                    : await pickDocument();
            if (!asset) return;

            const fileInfo = asset as {
                uri: string;
                name?: string;
                mimeType?: string;
                fileSize?: number;
                size?: number;
                file?: Blob;
            };
            const mimeType =
                fileInfo.mimeType ||
                (fileInfo.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
            const file = {
                uri: await save(fileInfo.uri, fileInfo.name || "anexo"),
                name: fileInfo.name || `anexo-${Date.now()}`,
                mimeType,
                size: fileInfo.fileSize ?? fileInfo.size ?? 0,
                blob: fileInfo.file
            };

            await uploadAttachment(id!, file, category, user!.userId);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao anexar arquivo.");
        }
    }

    async function cancel() {
        try {
            await cancelAppointment(id!, user!.userId);
            setDialog(false);
            await load();
        } catch (e) {
            setDialog(false);
            setError(e instanceof Error ? e.message : "Não foi possível cancelar.");
        }
    }

    async function removeAttachment(item: Attachment) {
        try {
            setError("");
            await deleteAttachment(item.id, user!.userId);
            await remove(item.uri);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível remover o anexo.");
        }
    }

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

                <View style={styles.navActions}>
                    {/* Voltar à lista usa agora o caminho em português. */}
                    <Pressable
                        onPress={() => router.push("/paciente/consultas" as any)}
                        accessibilityLabel="Minhas consultas"
                        style={({ pressed }) => [
                            styles.navIcon,
                            styles.navIconActive,
                            pressed && styles.pressed
                        ]}
                    >
                        <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </Pressable>

                    {/* O acesso ao perfil agora usa a rota com nome em português. */}
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

            <View style={styles.content}>
                <Pressable
                    onPress={() =>
                        router.canGoBack()
                            ? router.back()
                            // Depois de cancelar, a lista abre pela rota atualizada.
                            : router.replace("/paciente/consultas" as any)
                    }
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                    <Text style={styles.backText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );

    if (loading || !appointment) {
        return (
            <View style={styles.screen}>
                {hero}
                <View style={styles.center}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                        <>
                            <Ionicons name="search-outline" size={28} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>{error || "Consulta não encontrada."}</Text>
                        </>
                    )}
                </View>
            </View>
        );
    }

    const status = STATUS_STYLE[appointment.status];

    return (
        <View style={styles.screen}>
            {hero}

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator
            >
                <View style={styles.content}>
                    {/* ===== DETALHE DA CONSULTA ===== */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Detalhe da consulta</Text>
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle-outline" size={18} color="#C95C5C" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <View style={styles.avatarClip64}>
                                <Avatar userId={appointment.psychologistId} size={64} />
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={styles.label}>Psicólogo(a)</Text>
                                <Text style={styles.cardName} numberOfLines={2}>
                                    {appointment.psychologistName}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoIcon}>
                                    <Ionicons name="calendar-outline" size={20} color={COLORS.primaryDark} />
                                </View>
                                <View style={{ flexShrink: 1 }}>
                                    <Text style={styles.label}>Data</Text>
                                    <Text style={styles.infoValue}>{formatDay(appointment.date)}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <View style={styles.infoIcon}>
                                    <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
                                </View>
                                <View>
                                    <Text style={styles.label}>Horário</Text>
                                    <Text style={styles.infoValue}>{formatTime(appointment.date)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.status, { backgroundColor: status.bg }]}>
                            <Ionicons name={status.icon} size={15} color={status.fg} />
                            <Text style={[styles.statusText, { color: status.fg }]}>
                                {STATUS_LABEL[appointment.status]}
                            </Text>
                        </View>

                        {appointment.status !== "CANCELLED" && (
                            <Pressable
                                onPress={() => setDialog(true)}
                                style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
                            >
                                <Ionicons name="close-circle-outline" size={18} color="#C95C5C" />
                                <Text style={styles.dangerText}>Cancelar consulta</Text>
                            </Pressable>
                        )}
                    </View>

                    {/* ===== ANEXOS ===== */}
                    <View style={[styles.sectionHeader, { marginTop: 28 }]}>
                        <Text style={styles.sectionTitle}>Anexos</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{items.length}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Tipo do documento</Text>
                        <View style={styles.chipsWrap}>
                            {categories.map((c) => {
                                const selected = category === c;
                                return (
                                    <Pressable
                                        key={c}
                                        onPress={() => setCategory(c)}
                                        style={({ pressed }) => [
                                            styles.chip,
                                            selected && styles.chipSelected,
                                            pressed && styles.pressed
                                        ]}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                                            {labels[c]}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={[styles.label, { marginTop: 18 }]}>Enviar arquivo</Text>
                        <View style={styles.sourcesRow}>
                            {SOURCES.map((s) => (
                                <Pressable
                                    key={s.key}
                                    onPress={() => addFile(s.key)}
                                    style={({ pressed }) => [styles.source, pressed && styles.pressed]}
                                >
                                    <View style={styles.sourceIcon}>
                                        <Ionicons name={s.icon} size={22} color={COLORS.primaryDark} />
                                    </View>
                                    <Text style={styles.sourceText}>{s.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {items.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="folder-open-outline" size={28} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Nenhum anexo enviado.</Text>
                        </View>
                    ) : (
                        <View style={{ marginTop: 16 }}>
                            {items.map((item) => {
                                const isPdf = item.name.toLowerCase().endsWith(".pdf");
                                return (
                                    <View key={item.id} style={styles.attachment}>
                                        <Pressable
                                            onPress={() => Linking.openURL(item.uri)}
                                            style={({ pressed }) => [
                                                styles.attachmentMain,
                                                pressed && styles.pressed
                                            ]}
                                        >
                                            <View style={styles.attachmentIcon}>
                                                <Ionicons
                                                    name={isPdf ? "document-text-outline" : "image-outline"}
                                                    size={22}
                                                    color={COLORS.primaryDark}
                                                />
                                            </View>

                                            <View style={styles.cardInfo}>
                                                <Text style={styles.attachmentName} numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <View style={styles.attachmentMeta}>
                                                    <View style={styles.tag}>
                                                        <Text style={styles.tagText}>{labels[item.category]}</Text>
                                                    </View>
                                                    <Text style={styles.metaText}>
                                                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Pressable>

                                        {item.uploadedBy === user?.userId && (
                                            <Pressable
                                                onPress={() => removeAttachment(item)}
                                                accessibilityLabel="Remover anexo"
                                                style={({ pressed }) => [
                                                    styles.removeButton,
                                                    pressed && styles.pressed
                                                ]}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#C95C5C" />
                                            </Pressable>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            <ConfirmDialog
                visible={dialog}
                title="Cancelar consulta?"
                message="A consulta será marcada como cancelada e o horário ficará disponível novamente."
                onCancel={() => setDialog(false)}
                onConfirm={cancel}
                confirmLabel="Cancelar consulta"
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
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 20
    },

    // ===== TÍTULOS =====
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
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
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600"
    },

    // ===== CARD =====
    card: {
        padding: 20,
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
    avatarClip64: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: "hidden",
        backgroundColor: COLORS.primaryLight
    },
    cardInfo: {
        flex: 1,
        gap: 4
    },
    cardName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700"
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 18
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 28,
        rowGap: 14,
        marginBottom: 18
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    infoIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    infoValue: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700"
    },
    status: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700"
    },
    danger: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 18,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#C95C5C",
        backgroundColor: "#FBEAEA"
    },
    dangerText: {
        color: "#C95C5C",
        fontSize: 13,
        fontWeight: "700"
    },

    // ===== ANEXOS =====
    chipsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 10
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card
    },
    chipSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: "600"
    },
    chipTextSelected: {
        color: COLORS.primaryDark,
        fontWeight: "700"
    },
    sourcesRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 10
    },
    source: {
        flex: 1,
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background
    },
    sourceIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    sourceText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center"
    },
    attachment: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        marginBottom: 12,
        borderRadius: 18,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    attachmentMain: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    attachmentIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    attachmentName: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700"
    },
    attachmentMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    tag: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight
    },
    tagText: {
        color: COLORS.primaryDark,
        fontSize: 11,
        fontWeight: "700"
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: 12
    },
    removeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FBEAEA"
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
        paddingVertical: 32
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
