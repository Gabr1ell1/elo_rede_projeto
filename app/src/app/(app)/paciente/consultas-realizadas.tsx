// Para que serve este arquivo: Lista as consultas confirmadas cuja data já passou.
// Onde é usado: O menu do paciente abre esta rota para consultar documentos anteriores.

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuSanduiche } from "../../../components/menu-sanduiche";
import { useAuth } from "../../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../../context/AlertaContext";
import { getMyAppointmentsAsPatient, listAttachments } from "../../../services/api";
import { Appointment } from "../../../types/clinic";
import { formatarDia, formatarHora } from "../../../formatacao/data-hora";
import { COLORS } from "../../../constants/cores";

const LOGO = require("../../../../assets/images/elo-logo-branca.png");

// Busca as consultas passadas e prepara as contagens de documentos para cada cartão.
export default function ConsultasRealizadas() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { mostrarErro } = useAlerta();
    const [consultas, setConsultas] = useState<Appointment[]>([]);
    const [contagens, setContagens] = useState<Record<string, number>>({});
    const [carregando, setCarregando] = useState(true);

    const carregar = useCallback(async () => {
        if (!user) return;
        setCarregando(true);
        try {
            const passadas = (await getMyAppointmentsAsPatient(user.userId))
                .filter((consulta) => consulta.status === "CONFIRMED" && new Date(consulta.date).getTime() < Date.now())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setConsultas(passadas);
            const pares = await Promise.all(passadas.map(async (consulta) => [consulta.id, (await listAttachments(consulta.id, user.userId, "PATIENT")).length] as const));
            setContagens(Object.fromEntries(pares));
        } catch (erro) {
            mostrarErro("Erro ao carregar consultas realizadas", motivoDoErro(erro));
        } finally { setCarregando(false); }
    }, [user, mostrarErro]);

    useEffect(() => { void carregar(); }, [carregar]);

    return (
        <View style={styles.tela}>
            <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
                <View style={styles.decoracao} />
                <View style={styles.topo}><Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Elo" /><MenuSanduiche /></View>
                <View style={styles.conteudo}><Text style={styles.titulo}>Consultas realizadas</Text><Text style={styles.subtitulo}>Acesse seus documentos enviados pelo psicólogo.</Text></View>
            </View>
            <FlatList
                data={consultas}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.lista}
                ListEmptyComponent={<View style={styles.vazio}>{carregando ? <ActivityIndicator size="large" color={COLORS.primary} /> : <><Ionicons name="document-text-outline" size={32} color={COLORS.textSecondary} /><Text style={styles.textoVazio}>Nenhuma consulta realizada ainda.</Text></>}</View>}
                renderItem={({ item }) => (
                    <Pressable onPress={() => router.push(`/paciente/consulta/${item.id}` as never)} style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}>
                        <View style={styles.icone}><Ionicons name="person-outline" size={21} color={COLORS.primaryDark} /></View>
                        <View style={styles.dados}><Text style={styles.nome}>{item.psychologistName}</Text><Text style={styles.meta}>{formatarDia(item.date)} · {formatarHora(item.date)}</Text></View>
                        <View style={styles.badge}><Text style={styles.badgeTexto}>{contagens[item.id] ?? 0}</Text></View>
                        <Ionicons name="chevron-forward" size={19} color={COLORS.textSecondary} />
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: COLORS.background },
    hero: { paddingBottom: 22, gap: 16, overflow: "hidden", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, backgroundColor: COLORS.primary },
    decoracao: { position: "absolute", top: -90, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.accent, opacity: 0.3 },
    topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
    logo: { width: 162, height: 60 },
    conteudo: { paddingHorizontal: 20 },
    titulo: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
    subtitulo: { marginTop: 5, color: "#E8F3F1", fontSize: 14 },
    lista: { width: "100%", maxWidth: 940, alignSelf: "center", gap: 12, padding: 20, paddingBottom: 40 },
    cartao: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, backgroundColor: COLORS.card },
    icone: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: COLORS.primaryLight },
    dados: { flex: 1, gap: 5 },
    nome: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
    meta: { color: COLORS.textSecondary, fontSize: 12 },
    badge: { minWidth: 27, height: 27, alignItems: "center", justifyContent: "center", paddingHorizontal: 7, borderRadius: 14, backgroundColor: COLORS.primaryLight },
    badgeTexto: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "700" },
    vazio: { minHeight: 200, alignItems: "center", justifyContent: "center", gap: 12, padding: 22 },
    textoVazio: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center" },
    pressionado: { opacity: 0.78 }
});
