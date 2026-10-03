import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { AuthInput } from "../../components/entrada-autenticacao";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/cores";

const LOGO = require("../../../assets/images/elo-logo-branca.png");

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  async function handleLogin() {
    setError("");

    const result = await signIn({
      username,
      password,
    });

    if (!result.ok) {
      setError("Usuário ou senha inválidos");
    }

    // Se der certo, o AuthContext já pode fazer o redirecionamento.
    // Se ele NÃO fizer, podemos usar router.replace aqui.
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <View style={styles.background}>
      {/* DECORAÇÕES */}
      <View
        style={[
          styles.decorTop,
          isMobile && styles.decorMobile,
        ]}
      />

      <View
        style={[
          styles.decorBottom,
          isMobile && styles.decorMobile,
        ]}
      />

      {/* O cartão rola quando o teclado reduz a altura disponível no celular. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 12 }} keyboardShouldPersistTaps="handled">
      <View
        style={[
          styles.card,
          isMobile && styles.cardMobile,
        ]}
      >
        {/* =========================
            LADO ESQUERDO
        ========================= */}

        <View
          style={[
            styles.presentation,
            isMobile && styles.presentationMobile,
          ]}
        >
          <View>
            <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Elo" />

            <Text style={styles.presentationTitle}>
              Conectando pessoas
              {"\n"}
              ao cuidado que elas
              {"\n"}
              precisam.
            </Text>

            <Text style={styles.presentationText}>
              Encontre profissionais de psicologia,
              compartilhe experiências e construa
              conexões que fazem a diferença.
            </Text>

          </View>

          {/* ILUSTRAÇÃO */}
          <View style={styles.imagePlaceholder}>
           
          </View>
        </View>

        {/* =========================
            LADO DO LOGIN
        ========================= */}
        <View
          style={[
            styles.formContainer,
            isMobile && styles.formContainerMobile,
          ]}
        >

          <Text style={styles.welcome}>
            BEM-VINDO(A)
          </Text>

          <Text style={styles.formTitle}>
            Entre na sua conta
          </Text>

          <Text style={styles.formSubtitle}>
            Acesse sua rede profissional.
          </Text>

          {/* USUÁRIO */}
          <View style={styles.inputGroup}>
            <AuthInput
              label="Usuário"
              placeholder="Digite seu usuário"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          {/* SENHA */}

          <View style={styles.inputGroup}>
            <AuthInput
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* ERRO */}
          {error ? (
            <Text style={styles.errorBox}>
              {error}
            </Text>
          ) : null}

          {/* ESQUECI SENHA */}
          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>
              Esqueci minha senha
            </Text>
          </Pressable>

          {/* BOTÃO */}
          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>
              ENTRAR
            </Text>
          </Pressable>

          {/* CADASTRO */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Ainda não possui uma conta?
            </Text>

            {/* Esta rota aponta para o arquivo de cadastro com nome em português. */}
            <Pressable
              onPress={() => router.push("/(auth)/cadastro" as any)}
            >
              <Text style={styles.registerLink}>
                Cadastre-se
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    overflow: "hidden",
  },

  decorTop: {
    position: "absolute",
    width: 330,
    height: 180,
    top: -90,
    left: 80,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
  },

  decorBottom: {
    position: "absolute",
    width: 300,
    height: 170,
    bottom: -80,
    right: 40,
    borderRadius: 100,
    backgroundColor: COLORS.accent,
  },

  decorMobile: {
    opacity: 0.7,
  },

  // =========================================================
  // CARD PRINCIPAL
  // =========================================================
  card: {
    width: "92%",
    maxWidth: 1050,
    minHeight: 570,
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: "hidden",
    // Android
    elevation: 8,
    // iOS / Web
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  cardMobile: {
    width: "100%",
    minHeight: 0,
    flexDirection: "column",
  },

  // =========================================================
  // LADO DE APRESENTAÇÃO
  // =========================================================
  presentation: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 55,
    paddingVertical: 55,
    justifyContent: "space-between",
  },

  presentationMobile: {
    paddingHorizontal: 30,
    paddingVertical: 35,
    minHeight: 280,
  },

  // =========================================================
  // MARCA
  // =========================================================

  brandLogo: { width: 100, height: 42, marginBottom: 32 },

  // =========================================================
  // TEXTOS DA APRESENTAÇÃO
  // =========================================================

  presentationTitle: {
    color: COLORS.card,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 42,
    marginBottom: 20,
  },

  presentationText: {
    color: COLORS.primaryLight,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 400,
  },

  // =========================================================
  // ILUSTRAÇÃO
  // =========================================================

  imagePlaceholder: {
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  // ========================================================
  // ÁREA DO FORMULÁRIO
  // =========================================================
  formContainer: {
    flex: 1,
    paddingHorizontal: 60,
    paddingVertical: 55,
    justifyContent: "center",
  },

  formContainerMobile: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  // =========================================================
  // CABEÇALHO DO FORMULÁRIO
  // =========================================================
  welcome: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  formTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },

  formSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 35,
  },

  inputGroup: {
    marginBottom: 20,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 10,
  },
  errorBox: { color: COLORS.error, fontSize: 13, marginBottom: 10, padding: 12, borderRadius: 12, backgroundColor: "rgba(201, 92, 92, 0.12)" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 25,
  },

  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  // =========================================================
  // BOTÃO ENTRAR
  // =========================================================

  loginButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  loginButtonText: {
    color: COLORS.card,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // =========================================================
  // CADASTRO
  // =========================================================

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 5,
  },

  registerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  registerLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
