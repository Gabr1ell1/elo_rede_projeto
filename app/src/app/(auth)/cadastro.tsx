// Esta página mostra e envia o formulário de criação de conta.
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { AuthInput } from "../../components/entrada-autenticacao";
import { Role } from "../../types/auth";


export default function Register() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PATIENT");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  async function handleRegister() {
    setError("");
    const result = await signUp({
      username,
      email,
      password,
      role,
    });

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.replace("/(auth)");
      }, 1200);
    } else {
      setError(result.error ?? "Erro ao cadastrar");
    }
  }

  return (
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

      {/* CARD */}
      <View
        style={[
          styles.card,
          isMobile && styles.cardMobile,
        ]}
      >

        {/* =========================
            FORMULÁRIO
        ========================= */}
        <View
          style={[
            styles.formContainer,
            isMobile && styles.formContainerMobile,
          ]}
        >

          <Text style={styles.welcome}>
            FAÇA PARTE
          </Text>

          <Text style={styles.formTitle}>
            Crie sua conta
          </Text>

          <Text style={styles.formSubtitle}>
            Conecte-se à nossa rede profissional.
          </Text>

          {/* USUÁRIO */}

          <View style={styles.inputGroup}>
            <AuthInput
              label="Usuário"
              placeholder="Digite aqui..."
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* E-MAIL */}

          <View style={styles.inputGroup}>
            <AuthInput
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* SENHA */}

          <View style={styles.inputGroup}>
            <AuthInput
              label="Senha"
              placeholder="Crie uma senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* TIPO DE USUÁRIO */}

          <Text style={styles.roleLabel}>
            Eu sou:
          </Text>

          <View style={styles.roleRow}>

            <RoleOption
              label="Paciente"
              selected={role === "PATIENT"}
              onPress={() => setRole("PATIENT")}
            />

            <RoleOption
              label="Psicólogo(a)"
              selected={role === "PSYCHOLOGIST"}
              onPress={() => setRole("PSYCHOLOGIST")}
            />

          </View>

          {/* ERRO */}

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          {/* SUCESSO */}

          {success ? (
            <Text style={styles.success}>
              Conta criada! Redirecionando...
            </Text>
          ) : null}

          {/* BOTÃO */}

          <Pressable
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              CRIAR CONTA
            </Text>
          </Pressable>

          {/* LOGIN */}

          <View style={styles.loginContainer}>

            <Text style={styles.loginText}>
              Já possui uma conta?
            </Text>

            <Pressable
              onPress={() => router.push("/(auth)")}
            >
              <Text style={styles.loginLink}>
                Entrar
              </Text>
            </Pressable>

          </View>

        </View>

        {/* =========================
            LADO DIREITO
        ========================= */}

        <View
          style={[
            styles.presentation,
            isMobile && styles.presentationMobile,
          ]}
        >

          <View>

            <Text style={styles.brand}>
              ELO
            </Text>

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

          <View style={styles.imagePlaceholder}>
          </View>
        </View>
      </View>
    </View>
  );
}

function RoleOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleOption,
        selected && styles.roleOptionSelected,
      ]}
    >
      <Text
        style={
          selected
            ? styles.roleTextSelected
            : styles.roleText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({

  /* =========================
     BACKGROUND
  ========================= */

  background: {
    flex: 1,

    backgroundColor: "#F4F7F6",

    justifyContent: "center",
    alignItems: "center",

    padding: 24,

    overflow: "hidden",
  },

  /* =========================
     DECORAÇÕES
  ========================= */

  decorTop: {
    position: "absolute",

    width: 330,
    height: 180,

    backgroundColor: "#DDEDEA",

    top: -90,
    left: 80,

    borderRadius: 100,
  },

  decorBottom: {
    position: "absolute",

    width: 300,
    height: 170,

    backgroundColor: "#E9B872",

    bottom: -80,
    right: 40,

    borderRadius: 100,
  },

  decorMobile: {
    opacity: 0.7,
  },

  /* =========================
     CARD
  ========================= */

  card: {
    width: "92%",

    maxWidth: 1050,

    minHeight: 650,

    backgroundColor: "#FFFFFF",

    borderRadius: 10,

    flexDirection: "row",

    overflow: "hidden",

    elevation: 8,

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

  /* =========================
     FORMULÁRIO
  ========================= */

  formContainer: {
    flex: 1,

    paddingHorizontal: 55,

    paddingVertical: 45,

    justifyContent: "center",
  },

  formContainerMobile: {
    paddingHorizontal: 30,

    paddingVertical: 40,
  },

  welcome: {
    color: "#4F8F8A",

    fontSize: 13,

    fontWeight: "700",

    letterSpacing: 2,

    marginBottom: 10,
  },

  formTitle: {
    color: "#29413F",

    fontSize: 28,

    fontWeight: "700",

    marginBottom: 8,
  },

  formSubtitle: {
    color: "#71807E",

    fontSize: 14,

    marginBottom: 28,
  },

  /* =========================
     INPUTS
  ========================= */

  inputGroup: {
    marginBottom: 8,
  },

  /* =========================
     ROLE
  ========================= */

  roleLabel: {
    color: "#526562",

    fontSize: 13,

    fontWeight: "600",

    marginTop: 4,

    marginBottom: 8,
  },

  roleRow: {
    flexDirection: "row",

    gap: 8,

    marginBottom: 8,
  },

  roleOption: {
    flex: 1,

    padding: 10,

    borderWidth: 1,

    borderColor: "#BFCFCC",

    borderRadius: 8,

    alignItems: "center",
  },

  roleOptionSelected: {
    backgroundColor: "#4F8F8A",

    borderColor: "#4F8F8A",
  },

  roleText: {
    color: "#526562",

    fontSize: 13,
  },

  roleTextSelected: {
    color: "#FFFFFF",

    fontWeight: "600",

    fontSize: 13,
  },

  /* =========================
     ERRO / SUCESSO
  ========================= */

  error: {
    color: "#C95C5C",

    fontSize: 13,

    marginTop: 5,

    marginBottom: 10,
  },

  success: {
    color: "#2E7D32",

    fontSize: 13,

    marginTop: 5,

    marginBottom: 10,
  },

  /* =========================
     BOTÃO
  ========================= */

  registerButton: {
    height: 52,

    backgroundColor: "#4F8F8A",

    borderRadius: 26,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 8,

    elevation: 2,
  },

  registerButtonText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "700",

    letterSpacing: 2,
  },

  /* =========================
     LOGIN
  ========================= */

  loginContainer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 25,

    gap: 5,
  },

  loginText: {
    color: "#71807E",

    fontSize: 13,
  },

  loginLink: {
    color: "#4F8F8A",

    fontSize: 13,

    fontWeight: "700",
  },

  /* =========================
     LADO DIREITO
  ========================= */

  presentation: {
    flex: 1,

    backgroundColor: "#4F8F8A",

    paddingHorizontal: 55,

    paddingVertical: 55,

    justifyContent: "space-between",
  },

  presentationMobile: {
    paddingHorizontal: 30,

    paddingVertical: 35,

    minHeight: 280,
  },

  brand: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",

    letterSpacing: 3,

    marginBottom: 45,
  },

  presentationTitle: {
    color: "#FFFFFF",

    fontSize: 32,

    fontWeight: "700",

    lineHeight: 42,

    marginBottom: 20,
  },

  presentationText: {
    color: "#E8F3F1",

    fontSize: 15,

    lineHeight: 24,

    maxWidth: 400,
  },

  /* =========================
     ILUSTRAÇÃO
  ========================= */

  imagePlaceholder: {
    height: 170,

    justifyContent: "center",

    alignItems: "center",
  },

  image: {
    width: "100%",

    height: "100%",
  },
});
