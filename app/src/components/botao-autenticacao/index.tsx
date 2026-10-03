// Para que serve este arquivo: Cria um componente visual que as telas podem reutilizar.
// Onde ele é usado: src/components/botao-autenticacao/index.tsx é importado pelas telas ou componentes correspondentes.

// Este botão mantém o mesmo visual nas telas de login e cadastro.
import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

type AuthButtonProps = {
  title: string;
  onPress: () => void;
};

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function AuthButton({
  title,
  onPress,
}: AuthButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </Pressable>
  );
}

// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({
  button: {
    height: 52,

    backgroundColor: "#4F8F8A",

    borderRadius: 26,

    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "700",

    letterSpacing: 2,
  },
});
