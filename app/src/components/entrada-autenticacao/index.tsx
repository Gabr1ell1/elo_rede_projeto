// Para que serve este arquivo: Cria um componente visual que as telas podem reutilizar.
// Onde ele é usado: src/components/entrada-autenticacao/index.tsx é importado pelas telas ou componentes correspondentes.

// Este campo reúne rótulo e caixa de texto para os formulários de acesso.
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

type AuthInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
};

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9AA8A6"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({
  container: {
    width: "100%",
    minWidth: 0,
    marginBottom: 20,
  },

  label: {
    color: "#526562",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minWidth: 0,
    height: 50,

    borderBottomWidth: 1.5,
    borderBottomColor: "#BFCFCC",

    color: "#29413F",
    fontSize: 15,

    paddingHorizontal: 4,
  },
});
