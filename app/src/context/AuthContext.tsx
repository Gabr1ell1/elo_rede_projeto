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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    async function persistSession(sessionUser: SessionUser) {
        setUser(sessionUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem("@Auth:user", JSON.stringify(sessionUser));
    }

    async function clearSession() {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem("@Auth:user");
    }

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

    useEffect(() => {
        setUnauthorizeHandler(() => {
            clearSession();
            router.replace("/(auth)");
        });
    }, []);

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
