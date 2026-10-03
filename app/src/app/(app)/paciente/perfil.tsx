// Esta página mostra as informações e a foto de perfil do paciente.
import {
    View,
    Text,
    Image,
    Pressable,
    ScrollView,
    StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { Avatar } from "../../../components/avatar";
import { COLORS } from "../../../constants/cores";

const LOGO = require("../../../../assets/images/elo-logo-branca.png");

export default function PatientProfile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();

    const username = (user?.username ?? "").trim();

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

                    <View style={styles.navActions}>
                        {/* O botão abre a lista de consultas pelo endereço atualizado. */}
                        <Pressable
                            onPress={() => router.push("/paciente/consultas" as any)}
                            accessibilityLabel="Minhas consultas"
                            style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                        </Pressable>

                        {/* O botão de perfil agora usa a rota em português. */}
                        <Pressable
                            onPress={() => router.push("/paciente/perfil" as any)}
                            accessibilityLabel="Meu perfil"
                            style={({ pressed }) => [
                                styles.navIcon,
                                styles.navIconActive,
                                pressed && styles.pressed
                            ]}
                        >
                            <Ionicons name="person" size={20} color="#FFFFFF" />
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
                            router.canGoBack() ? router.back() : router.replace("/paciente" as any)
                        }
                        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                    >
                        <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                        <Text style={styles.backText}>Voltar</Text>
                    </Pressable>
                </View>
            </View>

            {/* CONTEÚDO */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator
            >
                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Meu perfil</Text>
                    </View>

                    {/* CARD DA FOTO */}
                    <View style={[styles.card, styles.photoCard]}>
                        {user && <Avatar userId={user.userId} editable size={112} />}

                        <Text style={styles.name} numberOfLines={1}>
                            {username}
                        </Text>

                        <View style={styles.chip}>
                            <Ionicons name="heart-outline" size={14} color={COLORS.primaryDark} />
                            <Text style={styles.chipText}>Paciente</Text>
                        </View>
                    </View>

                    {/* CARD DOS DADOS */}
                    <View style={[styles.sectionHeader, { marginTop: 28 }]}>
                        <Text style={styles.sectionTitle}>Meus dados</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="person-outline" size={20} color={COLORS.primaryDark} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.label}>Nome de usuário</Text>
                                <Text style={styles.infoValue} numberOfLines={1}>
                                    {username || "—"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primaryDark} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.label}>Tipo de conta</Text>
                                <Text style={styles.infoValue}>Paciente</Text>
                            </View>
                        </View>
                    </View>

                    {/* ATALHO */}
                    {/* O botão abre a lista de consultas pelo endereço atualizado. */}
                    <Pressable
                        onPress={() => router.push("/paciente/consultas" as any)}
                        style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
                    >
                        <View style={styles.infoIcon}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primaryDark} />
                        </View>
                        <Text style={styles.shortcutText}>Minhas consultas</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </Pressable>
                </View>
            </ScrollView>
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

    // ===== CARDS =====
    card: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    photoCard: {
        alignItems: "center",
        gap: 12,
        paddingVertical: 28
    },
    name: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "700",
        marginTop: 4
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
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

    // ===== DADOS =====
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },
    infoIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center"
    },
    infoText: {
        flex: 1,
        gap: 2
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600"
    },
    infoValue: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700"
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16
    },

    // ===== ATALHO =====
    shortcut: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        boxShadow: "0px 4px 14px rgba(41, 65, 63, 0.08)"
    },
    shortcutText: {
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700"
    },

    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    }
});
