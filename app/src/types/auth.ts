// Para que serve este arquivo: Define os formatos de dados compartilhados pelo app.
// Onde ele é usado: src/types/auth.ts é importado pelas telas ou componentes correspondentes.

export type Role = "PATIENT" | "PSYCHOLOGIST";

export type AuthRequest = {
    username: string;
    password: string;
};

export type RegisterRequest = AuthRequest & {
    email: string;
    cep: string;
    role: Role;
    avatarUrl?: string;
};

export type SessionUser = {
    userId: string;
    username: string;
    role: Role | null;
};
