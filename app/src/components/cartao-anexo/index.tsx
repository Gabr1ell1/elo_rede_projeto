// Para que serve este arquivo: Apresenta os dados de um documento e o botão para baixá-lo.
// Onde é usado: As telas de solicitações e consultas exibem este cartão para cada anexo.

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attachment } from "../../types/clinic";
import { COLORS } from "../../constants/cores";

type Props = {
    anexo: Attachment;
    aoBaixar: () => void;
    carregando?: boolean;
    enviadoPeloPsicologo?: boolean;
};

// Mostra nome, categoria, tipo, tamanho e a origem profissional quando aplicável.
export function CartaoAnexo({ anexo, aoBaixar, carregando = false, enviadoPeloPsicologo = false }: Props) {
    return (
        <View style={styles.cartao}>
            <View style={styles.icone}><Ionicons name="document-text-outline" size={21} color={COLORS.primaryDark} /></View>
            <View style={styles.dados}>
                <Text style={styles.nome} numberOfLines={2}>{anexo.name}</Text>
                <Text style={styles.meta}>{nomeCategoria(anexo.category)} · {anexo.mimeType} · {formatarTamanho(anexo.size)}</Text>
                {enviadoPeloPsicologo && <Text style={styles.origem}>Enviado pelo psicólogo</Text>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Baixar ${anexo.name}`} disabled={carregando} onPress={aoBaixar} style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
                {carregando ? <ActivityIndicator size="small" color={COLORS.primaryDark} /> : <><Ionicons name="download-outline" size={17} color={COLORS.primaryDark} /><Text style={styles.botaoTexto}>Baixar</Text></>}
            </Pressable>
        </View>
    );
}

function nomeCategoria(categoria: Attachment["category"]): string {
    return categoria === "EXAM" ? "Exame" : categoria === "CERTIFICATE" ? "Atestado" : categoria === "REPORT" ? "Laudo" : "Outro";
}

function formatarTamanho(bytes: number): string {
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

const styles = StyleSheet.create({
    cartao: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginTop: 9, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
    icone: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: COLORS.primaryLight },
    dados: { flex: 1, gap: 3 },
    nome: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
    meta: { color: COLORS.textSecondary, fontSize: 10 },
    origem: { color: COLORS.primaryDark, fontSize: 10, fontWeight: "700" },
    botao: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: COLORS.primaryLight },
    botaoTexto: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "700" },
    pressionado: { opacity: 0.7 }
});
