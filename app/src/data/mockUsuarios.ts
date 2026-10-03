// Para que serve: usuários de exemplo do modo mock (login/cadastro de demonstração).
// Onde é usado: src/data/mockAuth.ts, que carrega estes dados como padrão inicial.

import { SessionUser } from "../types/auth";

// Formato de cada conta: a senha e os dados da sessão do usuário.
export type UsuarioMock = {
    password: string;
    user: SessionUser;
};

// A chave é o username. O mockAuth usa FAKE_USERS[username] para fazer o login.
// ATENÇÃO: confira os campos de SessionUser em src/types/auth.ts.
export const MOCK_USUARIOS: Record<string, UsuarioMock> = {
    paciente1: {
        password: "123456",
        user: { userId: "mock-paciente-1", username: "paciente1", role: "PATIENT" }
    },
    psicologo1: {
        password: "123456",
        user: { userId: "mock-psicologo-1", username: "psicologo1", role: "PSYCHOLOGIST" }
    },
    kleber: {
        password: "senha@senha",
        user: { userId: "mock-kleber", username: "kleber", role: "PSYCHOLOGIST" }
    }
};