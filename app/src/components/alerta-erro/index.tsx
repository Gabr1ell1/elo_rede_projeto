// Para que serve este arquivo: Mostra um alerta de erro em uma janela centralizada.
// Onde é usado: O AlertaProvider controla esta janela para as telas do aplicativo.

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/cores";

type Props = { visivel: boolean; titulo: string; mensagem: string; fechar: () => void };

// Recebe a visibilidade, o texto e a ação de fechar; devolve o modal de erro. Exemplo: erro de login.
export function AlertaErro({ visivel, titulo, mensagem, fechar }: Props) {
    return (
        <Modal visible={visivel} transparent animationType="fade" onRequestClose={fechar}>
            <Pressable style={estilos.fundo} onPress={fechar} accessibilityLabel="Fechar alerta">
                <Pressable style={estilos.cartao} onPress={(evento) => evento.stopPropagation()}>
                    <View style={estilos.faixa} />
                    <Pressable style={estilos.fechar} onPress={fechar} accessibilityLabel="Fechar">
                        <Text style={estilos.x}>X</Text>
                    </Pressable>
                    <Text style={estilos.titulo}>{titulo}</Text>
                    <Text style={estilos.mensagem}>{mensagem}</Text>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// Estes estilos criam um fundo escuro e um cartão branco com destaque vermelho para o erro.
const estilos = StyleSheet.create({
    fundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.48)", justifyContent: "center", padding: 24 },
    cartao: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, paddingLeft: 30, minHeight: 130, justifyContent: "center", overflow: "hidden" },
    faixa: { position: "absolute", left: 0, top: 0, bottom: 0, width: 7, backgroundColor: "#B4232F" },
    fechar: { position: "absolute", top: 12, right: 14, padding: 6 },
    x: { color: "#B4232F", fontWeight: "800", fontSize: 18 },
    titulo: { color: "#8E1B25", fontSize: 18, fontWeight: "700", paddingRight: 32, marginBottom: 10 },
    mensagem: { color: COLORS.text, fontSize: 15, lineHeight: 22 }
});
