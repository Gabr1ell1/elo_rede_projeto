// Estes dados simulam usuários para testar login e cadastro sem o backend.
import { AuthRequest, RegisterRequest, SessionUser } from "../types/auth";

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

function delay<T>(value: T, ms = 500): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

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

export async function mockRegister(data: RegisterRequest): Promise<void> {
    const userId = `mock-${Object.keys(FAKE_USERS).length + 1}`;

    FAKE_USERS[data.username] = {
        password: data.password,
        user: { userId, username: data.username, role: data.role }
    };

    await delay(undefined);
}
