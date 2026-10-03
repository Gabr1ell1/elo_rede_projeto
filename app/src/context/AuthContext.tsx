// Para que serve este arquivo: Compartilha estado de autenticação e ações entre telas.
// Onde ele é usado: src/context/AuthContext.tsx é importado pelas telas ou componentes correspondentes.

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi
} from "../services/api";
import { setUnauthorizeHandler } from "../integration/httpClient";
import { AuthRequest, RegisterRequest, SessionUser } from "../types/auth";

type AuthContextData = {
    isAuthenticated: boolean;
    user: SessionUser | null;
    isLoading: boolean;
    signIn: (data: AuthRequest) => Promise<{ ok: boolean }>;
    signUp: (data: RegisterRequest) => Promise<{ ok: boolean; error?: string }>;
    signOut: () => void;
};

const AuthContext = createContext({} as AuthContextData);

// Pra onde mandar o usuário logo após autenticar, conforme o papel.
function redirectByRole(role: SessionUser["role"]) {
    if (role === "PSYCHOLOGIST") {
        router.replace("/psicologo");
    } else {
        // O arquivo index do grupo protegido representa a URL pública /paciente.
        router.replace("/paciente" as any);
    }
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [isAuthenticated, setIsAuthenticated] = useState(false);
// Estes estados guardam valores que mudam durante o uso da tela ou do componente.
    const [isLoading, setIsLoading] = useState(true);

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function persistSession(sessionUser: SessionUser) {
        setUser(sessionUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem("@Auth:user", JSON.stringify(sessionUser));
    }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function clearSession() {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem("@Auth:user");
    }

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        (async () => {
            // Modo mock: como não existe cookie de verdade, restauramos
            // a sessão salva localmente. Modo real: o ideal é validar
            // com getMe() (ver AuthContext do projeto com backend real).
            const raw = await AsyncStorage.getItem("@Auth:user");
            if (raw) {
                const sessionUser: SessionUser = JSON.parse(raw);
                setUser(sessionUser);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        })();
    }, []);

// Este efeito sincroniza a tela com dados, autenticacao ou ciclo de vida do componente.
    useEffect(() => {
        setUnauthorizeHandler(() => {
            clearSession();
            router.replace("/(auth)");
        });
    }, []);

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function signIn(data: AuthRequest) {
        try {
            const sessionUser = await loginApi(data);
            await persistSession(sessionUser);
            redirectByRole(sessionUser.role);
            return { ok: true };
        } catch {
            return { ok: false };
        }
    }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function signUp(data: RegisterRequest) {
        try {
            await registerApi(data);
            return { ok: true };
        } catch (err: any) {
            return {
                ok: false,
                error: err.response?.data?.message ?? "Erro desconhecido"
            };
        }
    }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function signOut() {
        try {
            await logoutApi();
        } finally {
            await clearSession();
            router.replace("/(auth)");
        }
    }

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, isLoading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
