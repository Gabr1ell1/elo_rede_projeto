// Para que serve este arquivo: Salva o papel local que não existe no serviço de login.
// Onde é usado: O login abre esta tela quando a conta ainda não tem um perfil escolhido.

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useAlerta, motivoDoErro } from "../../context/AlertaContext";
import { COLORS } from "../../constants/cores";

// Permite que uma conta autenticada escolha entre paciente e psicólogo uma única vez.
export default function EscolherPerfil() {
    const { selecionarPerfil } = useAuth();
    const { mostrarErro } = useAlerta();

    async function escolher(role: "PATIENT" | "PSYCHOLOGIST") {
        try {
            await selecionarPerfil(role);
        } catch (erro) {
            mostrarErro("Erro ao salvar perfil", motivoDoErro(erro));
        }
    }

    return (
        <View style={styles.tela}>
            <View style={styles.cartao}>
                <Text style={styles.titulo}>Como você vai usar o Elo?</Text>
                <Text style={styles.descricao}>Escolha o perfil desta conta para continuar.</Text>
                <Pressable onPress={() => void escolher("PATIENT")} style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
                    <Text style={styles.textoBotao}>Sou paciente</Text>
                </Pressable>
                <Pressable onPress={() => void escolher("PSYCHOLOGIST")} style={({ pressed }) => [styles.botao, styles.secundario, pressed && styles.pressionado]}>
                    <Text style={[styles.textoBotao, styles.textoSecundario]}>Sou psicólogo(a)</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: COLORS.background },
    cartao: { width: "100%", maxWidth: 460, gap: 14, padding: 24, borderRadius: 22, backgroundColor: COLORS.card },
    titulo: { color: COLORS.text, fontSize: 23, fontWeight: "700" },
    descricao: { color: COLORS.textSecondary, fontSize: 15, marginBottom: 8 },
    botao: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: COLORS.primary },
    secundario: { backgroundColor: COLORS.primaryLight },
    textoBotao: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    textoSecundario: { color: COLORS.primaryDark },
    pressionado: { opacity: 0.8 }
});
