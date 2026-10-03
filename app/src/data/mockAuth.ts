// Para que serve este arquivo: Fornece dados de demonstração para os modos mock.
// Onde ele é usado: src/data/mockAuth.ts é importado pelas telas ou componentes correspondentes.

// Estes dados simulam usuários para testar login e cadastro sem o backend.
import { AuthRequest, RegisterRequest, SessionUser } from "../types/auth";
// O cadastro mock também prepara o perfil clínico dos novos psicólogos.
import { mockGarantirPerfilPsicologo } from "./mockClinic";

type FakeUserRecord = {
    password: string;
    user: SessionUser;
};

// Dois usuários de teste prontos, um de cada papel.
const FAKE_USERS: Record<string, FakeUserRecord> = {
    paciente1: {
        password: "123456",
        user: { userId: "p1", username: "paciente1", role: "PATIENT" }
    },
    psi1: {
        password: "123456",
        user: { userId: "psi1", username: "psi1", role: "PSYCHOLOGIST" }
    }
};

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
function delay<T>(value: T, ms = 500): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockLogin(data: AuthRequest): Promise<SessionUser> {
    const record = FAKE_USERS[data.username];

    if (!record || record.password !== data.password) {
        const error: any = new Error("Credenciais inválidas");
        error.response = {
            status: 401,
            data: { message: "Usuário ou senha inválidos" }
        };
        throw error;
    }

    return delay(record.user);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockRegister(data: RegisterRequest): Promise<void> {
    const userId = `mock-${Object.keys(FAKE_USERS).length + 1}`;

    FAKE_USERS[data.username] = {
        password: data.password,
        user: { userId, username: data.username, role: data.role }
    };

    // Usa o mesmo userId no cadastro e no perfil profissional.
    if (data.role === "PSYCHOLOGIST") await mockGarantirPerfilPsicologo(userId);

    await delay(undefined);
}
