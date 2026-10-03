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
