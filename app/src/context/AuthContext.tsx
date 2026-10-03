// Para que serve este arquivo: Compartilha estado de autenticação e ações entre telas.
// Onde ele é usado: src/context/AuthContext.tsx é importado pelas telas ou componentes correspondentes.

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi,
    getPsychologistById,
    garantirConsultasDeDemonstracaoPaciente
} from "../services/api";
import { setUnauthorizeHandler } from "../integration/httpClient";
import { AuthRequest, RegisterRequest, Role, SessionUser } from "../types/auth";
import { Psychologist } from "../types/clinic";
import { salvarPerfilUsuario } from "../data/armazenamento";
// Esta função converte erros de serviço em mensagens claras para a tela de acesso.
import { motivoDoErro } from "./AlertaContext";

type AuthContextData = {
    isAuthenticated: boolean;
    user: SessionUser | null;
    isLoading: boolean;
    statusCrp: Psychologist["statusCrp"] | null;
    isStatusCrpLoading: boolean;
    atualizarStatusCrp: (status: Psychologist["statusCrp"]) => void;
    recarregarStatusCrp: () => Promise<void>;
    selecionarPerfil: (role: Role) => Promise<void>;
    signIn: (data: AuthRequest) => Promise<{ ok: boolean; error?: string }>;
    signUp: (data: RegisterRequest) => Promise<{ ok: boolean; error?: string }>;
    signOut: () => void;
};

const AuthContext = createContext({} as AuthContextData);

// Pra onde mandar o usuário logo após autenticar, conforme o papel.
function redirectByRole(role: SessionUser["role"]) {
    if (!role) {
        router.replace("/(auth)/escolher-perfil" as never);
        return;
    }
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
    const [statusCrp, setStatusCrp] = useState<Psychologist["statusCrp"] | null>(null);
    const [isStatusCrpLoading, setIsStatusCrpLoading] = useState(true);

    const recarregarStatusCrp = useCallback(async () => {
        if (user?.role !== "PSYCHOLOGIST") {
            setStatusCrp(null);
            setIsStatusCrpLoading(false);
            return;
        }
        setIsStatusCrpLoading(true);
        try {
            const perfil = await getPsychologistById(user.userId, user.userId);
            setStatusCrp(perfil?.statusCrp ?? "SEM_ENVIO");
        } finally {
            setIsStatusCrpLoading(false);
        }
    }, [user?.role, user?.userId]);

    const atualizarStatusCrp = useCallback((status: Psychologist["statusCrp"]) => {
        setStatusCrp(status);
        setIsStatusCrpLoading(false);
    }, []);

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
        setStatusCrp(null);
        await AsyncStorage.multiRemove(["@Auth:user", "@Auth:cookie"]);
    }

    async function selecionarPerfil(role: Role) {
        if (!user) return;
        await salvarPerfilUsuario(user.username, role);
        const atualizado = { ...user, role };
        setUser(atualizado);
        await AsyncStorage.setItem("@Auth:user", JSON.stringify(atualizado));
        if (role === "PATIENT") await garantirConsultasDeDemonstracaoPaciente(user.userId, user.username);
        redirectByRole(role);
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

    useEffect(() => {
        let ativo = true;
        if (user?.role !== "PSYCHOLOGIST") {
            setStatusCrp(null);
            setIsStatusCrpLoading(false);
            return () => { ativo = false; };
        }
        setIsStatusCrpLoading(true);
        getPsychologistById(user.userId, user.userId)
            .then((perfil) => { if (ativo) setStatusCrp(perfil?.statusCrp ?? "SEM_ENVIO"); })
            .catch(() => { if (ativo) setStatusCrp("SEM_ENVIO"); })
            .finally(() => { if (ativo) setIsStatusCrpLoading(false); });
        return () => { ativo = false; };
    }, [user?.role, user?.userId]);

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
            if (sessionUser.role === "PATIENT") {
                await garantirConsultasDeDemonstracaoPaciente(sessionUser.userId, sessionUser.username);
            }
            redirectByRole(sessionUser.role);
            return { ok: true };
        } catch (erro) {
            return { ok: false, error: motivoDoErro(erro) };
        }
    }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
    async function signUp(data: RegisterRequest) {
        try {
            await registerApi(data);
            return { ok: true };
        } catch (err) {
            return {
                ok: false,
                error: motivoDoErro(err)
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
            value={{ user, isAuthenticated, isLoading, statusCrp, isStatusCrpLoading, atualizarStatusCrp, recarregarStatusCrp, selecionarPerfil, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
