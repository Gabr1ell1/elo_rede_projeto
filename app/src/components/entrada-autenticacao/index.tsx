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
};

export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    color: "#526562",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    height: 50,

    borderBottomWidth: 1.5,
    borderBottomColor: "#BFCFCC",

    color: "#29413F",
    fontSize: 15,

    paddingHorizontal: 4,
  },
});
