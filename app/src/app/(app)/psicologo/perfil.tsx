// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(app)/psicologo/perfil.tsx é importado pelas telas ou componentes correspondentes.

// Esta página mostra e atualiza o perfil profissional do psicólogo.
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    Pressable,
    Switch,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getPsychologistById, updatePsychologistProfile } from "../../../services/api";
import { Psychologist } from "../../../types/clinic";
import { Avatar } from "../../../components/avatar";
import { COLORS } from "../../../constants/cores";
// A tela usa validações comuns e apresenta erros pelo alerta compartilhado.
import { validarEmail } from "../../../validacoes/email";
import { validarNumeroPositivo } from "../../../validacoes/numero";
import { useAlerta, motivoDoErro } from "../../../context/AlertaContext";

const LOGO = require("../../../../assets/images/elo-logo-branca.png");

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function PsychologistProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const { mostrarErro } = useAlerta();
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [specialty, setSpecialty] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [price, setPrice] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [bio, setBio] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [loading, setLoading] = useState(true);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [message, setMessage] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [success, setSuccess] = useState(false);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [saving, setSaving] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    // Este estado guarda os anos de experiência digitados pelo profissional.
    const [anosExperiencia, setAnosExperiencia] = useState("");
    // Este estado guarda o nome da abordagem usada pelo profissional.
    const [abordagem, setAbordagem] = useState("");
    // Estes estados guardam contatos para os colegas, quando a rede estiver ligada.
    const [whatsapp, setWhatsapp] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [email, setEmail] = useState("");
    // Este estado controla se o perfil aparece na rede de psicólogos.
    const [visivelNaRede, setVisivelNaRede] = useState(false);
    // Este estado apresenta no perfil o estado de verificação do CRP.
    const [statusCrp, setStatusCrp] = useState<Psychologist["statusCrp"]>("SEM_ENVIO");

    const username = (user?.username ?? "").trim();

    // Carrega o perfil do próprio usuário para preencher os campos do formulário.
    useEffect(() => {
        if (!user) return;
        getPsychologistById(user.userId, user.userId)
            .then((p) => {
                if (p) {
                    setSpecialty(p.specialty);
                    setPrice(String(p.price));
                    setBio(p.bio);
                    // O usuário é dono deste perfil, então também pode editar seus contatos.
                    setAnosExperiencia(p.yearsOfExperience === undefined ? "" : String(p.yearsOfExperience));
                    setAbordagem(p.approach ?? "");
                    setWhatsapp(p.whatsapp ?? "");
                    setEmail(p.email ?? "");
                    setVisivelNaRede(p.visibleInNetwork === true);
                    setStatusCrp(p.statusCrp);
                }
            })
            .catch((erro) => mostrarErro("Erro ao carregar perfil", motivoDoErro(erro)))
            .finally(() => setLoading(false));
    }, [user]);

    // Valida os campos novos e salva todos os dados profissionais juntos.
    async function handleSave() {
        if (!user) return;
        const anosNumericos = anosExperiencia.trim() === "" ? undefined : Number(anosExperiencia);
        if (anosNumericos !== undefined && !validarNumeroPositivo(anosNumericos)) {
            mostrarErro("Erro ao salvar perfil", "Anos de experiência precisa ser um número igual ou maior que zero.");
            return;
        }
        if (email.trim() && !validarEmail(email)) {
            mostrarErro("Erro ao salvar perfil", "Digite um e-mail válido.");
            return;
        }
        setSaving(true);
        setMessage("");
        try {
            await updatePsychologistProfile(user.userId, {
                specialty,
                price: Number(price.replace(",", ".")),
                bio,
                yearsOfExperience: anosNumericos,
                approach: abordagem,
                whatsapp,
                email: email.trim(),
                visibleInNetwork: visivelNaRede
            });
            setSuccess(true);
            setMessage("Perfil atualizado.");
        } catch (error) {
            setSuccess(false);
            setMessage("");
            mostrarErro("Erro ao salvar perfil", motivoDoErro(error));
        } finally {
            setSaving(false);
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

                <MenuSanduiche />
            </View>

            <View style={styles.content}>
                <Pressable
                    onPress={() =>
                        router.canGoBack() ? router.back() : router.replace("/psicologo" as any)
                    }
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                    <Text style={styles.backText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.screen}>
                {hero}
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.screen}>
            {hero}

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
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
                            <Ionicons name="medkit-outline" size={14} color={COLORS.primaryDark} />
                            <Text style={styles.chipText}>Psicólogo(a)</Text>
                        </View>
                        <Pressable onPress={() => router.push("/psicologo/verificacao" as any)} style={({ pressed }) => [styles.seloCrp, pressed && styles.pressed]}>
                            <Text style={styles.textoSeloCrp}>{statusCrp === "VERIFICADO" ? "CRP verificado" : statusCrp === "AGUARDANDO" ? "Aguardando confirmação" : "Documentação não enviada"}</Text>
                            <Ionicons name="chevron-forward" size={15} color={COLORS.primaryDark} />
                        </Pressable>
                    </View>

                    {/* DADOS PROFISSIONAIS */}
                    <View style={[styles.sectionHeader, { marginTop: 28 }]}>
                        <Text style={styles.sectionTitle}>Dados profissionais</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Especialidade</Text>
                        <View style={[styles.field, focused === "specialty" && styles.fieldFocused]}>
                            <Ionicons name="ribbon-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={specialty}
                                onChangeText={setSpecialty}
                                onFocus={() => setFocused("specialty")}
                                onBlur={() => setFocused(null)}
                                placeholder="Ex.: Ansiedade e Estresse"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        <Text style={[styles.label, styles.labelSpace]}>Preço da sessão (R$)</Text>
                        <View style={[styles.field, focused === "price" && styles.fieldFocused]}>
                            <Ionicons name="cash-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                onFocus={() => setFocused("price")}
                                onBlur={() => setFocused(null)}
                                keyboardType="numeric"
                                placeholder="150,00"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        <Text style={[styles.label, styles.labelSpace]}>Sobre você</Text>
                        <View
                            style={[
                                styles.field,
                                styles.fieldMultiline,
                                focused === "bio" && styles.fieldFocused
                            ]}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={20}
                                color={COLORS.primaryDark}
                                style={{ marginTop: 2 }}
                            />
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                value={bio}
                                onChangeText={setBio}
                                onFocus={() => setFocused("bio")}
                                onBlur={() => setFocused(null)}
                                multiline
                                placeholder="Conte um pouco sobre sua experiência e abordagem"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        {/* Este campo guarda quantos anos o profissional trabalha na área. */}
                        <Text style={[styles.label, styles.labelSpace]}>Anos de experiência</Text>
                        <View style={[styles.field, focused === "anosExperiencia" && styles.fieldFocused]}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={anosExperiencia}
                                onChangeText={setAnosExperiencia}
                                onFocus={() => setFocused("anosExperiencia")}
                                onBlur={() => setFocused(null)}
                                keyboardType="numeric"
                                placeholder="Ex.: 8"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        {/* Este campo descreve a abordagem terapêutica do profissional. */}
                        <Text style={[styles.label, styles.labelSpace]}>Abordagem</Text>
                        <View style={[styles.field, focused === "abordagem" && styles.fieldFocused]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={abordagem}
                                onChangeText={setAbordagem}
                                onFocus={() => setFocused("abordagem")}
                                onBlur={() => setFocused(null)}
                                placeholder="Ex.: Terapia Cognitivo-Comportamental"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        {/* Este campo guarda o WhatsApp que será mostrado na rede se ela estiver ligada. */}
                        <Text style={[styles.label, styles.labelSpace]}>WhatsApp</Text>
                        <View style={[styles.field, focused === "whatsapp" && styles.fieldFocused]}>
                            <Ionicons name="logo-whatsapp" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={whatsapp}
                                onChangeText={setWhatsapp}
                                onFocus={() => setFocused("whatsapp")}
                                onBlur={() => setFocused(null)}
                                keyboardType="phone-pad"
                                placeholder="DDD + número"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        {/* Este campo guarda o e-mail que será mostrado na rede se ela estiver ligada. */}
                        <Text style={[styles.label, styles.labelSpace]}>E-mail</Text>
                        <View style={[styles.field, focused === "email" && styles.fieldFocused]}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.primaryDark} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocused("email")}
                                onBlur={() => setFocused(null)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="voce@exemplo.com"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        {/* Este controle decide se os colegas podem encontrar o perfil e os contatos. */}
                        <View style={styles.linhaVisibilidade}>
                            <View style={styles.textoVisibilidade}>
                                <Text style={styles.tituloVisibilidade}>Aparecer na rede de psicólogos</Text>
                                <Text style={styles.ajudaVisibilidade}>
                                    Seu WhatsApp e e-mail ficam visíveis para outros psicólogos só se isto estiver ligado
                                </Text>
                            </View>
                            <Switch
                                value={visivelNaRede}
                                onValueChange={setVisivelNaRede}
                                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                                thumbColor={visivelNaRede ? COLORS.primary : COLORS.card}
                            />
                        </View>

                        {!!message && (
                            <View style={[styles.messageBox, success ? styles.okBox : styles.errorBox]}>
                                <Ionicons
                                    name={success ? "checkmark-circle-outline" : "alert-circle-outline"}
                                    size={18}
                                    color={success ? COLORS.primaryDark : "#C95C5C"}
                                />
                                <Text style={[styles.messageText, { color: success ? COLORS.primaryDark : "#C95C5C" }]}>
                                    {message}
                                </Text>
                            </View>
                        )}

                        <Pressable
                            onPress={handleSave}
                            disabled={saving}
                            style={({ pressed }) => [
                                styles.save,
                                saving && styles.saveDisabled,
                                pressed && styles.pressed
                            ]}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                            )}
                            <Text style={styles.saveText}>{saving ? "Salvando…" : "Salvar"}</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
        </KeyboardAvoidingView>
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
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
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
    // Este selo abre a tela onde o profissional pode acompanhar ou enviar seu CRP.
    seloCrp: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: COLORS.primaryLight },
    textoSeloCrp: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "700" },

    // ===== FORMULÁRIO =====
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8
    },
    labelSpace: {
        marginTop: 18
    },
    field: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background
    },
    fieldMultiline: {
        alignItems: "flex-start",
        paddingTop: 14
    },
    fieldFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.card
    },
    // Estes estilos alinham o botão de visibilidade com seu texto de ajuda.
    linhaVisibilidade: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 22,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background
    },
    textoVisibilidade: {
        flex: 1,
        gap: 4
    },
    tituloVisibilidade: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600"
    },
    ajudaVisibilidade: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 17
    },
    input: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 15,
        color: COLORS.text,
    },
    textarea: {
        minHeight: 110,
        paddingTop: 0,
        textAlignVertical: "top"
    },
    messageBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginTop: 18,
        borderRadius: 14
    },
    okBox: {
        backgroundColor: COLORS.primaryLight
    },
    errorBox: {
        backgroundColor: "#FBEAEA"
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600"
    },
    save: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 22,
        paddingVertical: 14,
        borderRadius: 999,
        backgroundColor: COLORS.primary
    },
    saveDisabled: {
        opacity: 0.7
    },
    saveText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700"
    },

    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    }
});
