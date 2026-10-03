// Para que serve este arquivo: Guarda contas de demonstração para login e cadastro mock.
// Onde é usado: mockAuth.ts lê estes usuários como estado inicial.

import { SessionUser } from "../types/auth";

export type UsuarioMock = { password: string; user: SessionUser };

// Estas contas facilitam a entrada inicial no app durante a demonstração.
export const MOCK_USUARIOS: Record<string, UsuarioMock> = {
    paciente1: { password: "123456", user: { userId: "p1", username: "paciente1", role: "PATIENT" } },
    psi1: { password: "123456", user: { userId: "psi1", username: "psi1", role: "PSYCHOLOGIST" } },
    paciente2: { password: "123456", user: { userId: "p2", username: "paciente2", role: "PATIENT" } },
    psi2: { password: "123456", user: { userId: "psi2", username: "psi2", role: "PSYCHOLOGIST" } }
};
