// Para que serve este arquivo: Apresenta uma tela ou layout; o Expo Router usa a pasta para organizar as rotas.
// Onde ele é usado: src/app/(auth)/index.tsx é importado pelas telas ou componentes correspondentes.

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
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Esta tela mostra falhas de autenticação no alerta compartilhado.
import { useAlerta } from "../../context/AlertaContext";

const LOGO = require("../../../assets/images/elo-logo-branca.png");

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export default function Login() {
  const { signIn } = useAuth();
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
  const [username, setUsername] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
  const [password, setPassword] = useState("");
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
  const { mostrarErro } = useAlerta();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const insets = useSafeAreaInsets();

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
  async function handleLogin() {
    const result = await signIn({
      username,
      password,
    });

    if (!result.ok && !result.errorAlreadyShown) {
      mostrarErro("Erro de login", result.error ?? "Usuário ou senha inválidos.");
    }

    // Se der certo, o AuthContext já pode fazer o redirecionamento.
    // Se ele NÃO fizer, podemos usar router.replace aqui.
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <View style={[styles.background, isMobile && styles.backgroundMobile, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
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
      <ScrollView style={styles.authScroll} contentContainerStyle={[styles.authScrollContent, isMobile && styles.authScrollContentMobile]} keyboardShouldPersistTaps="handled">
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
          <View style={[styles.imagePlaceholder, isMobile && styles.imagePlaceholderMobile]}>
           
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

// Este bloco concentra os estilos para manter o visual desta tela ou componente organizado.
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: 24,
    overflow: "hidden"
  },
  backgroundMobile: { paddingHorizontal: 12, alignItems: "stretch" },
  authScroll: { width: "100%", flex: 1 },
  authScrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 12 },
  authScrollContentMobile: { alignItems: "stretch" },

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
    alignSelf: "stretch",
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  // =========================================================
  // MARCA
  // =========================================================

  brandLogo: { width: 132, height: 52, marginBottom: 22 },
  imagePlaceholderMobile: { height: 0 },

  // =========================================================
  // TEXTOS DA APRESENTAÇÃO
  // =========================================================

  presentationTitle: {
    color: COLORS.card,
    fontSize: 32,
    flexShrink: 1,
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
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 24,
    paddingVertical: 30,
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
    flexShrink: 1,
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
    flexWrap: "wrap",
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
