export type Role = "PATIENT" | "PSYCHOLOGIST";

export type AuthRequest = {
    username: string;
    password: string;
};

export type RegisterRequest = AuthRequest & {
    email: string;
    role: Role;
    avatarUrl?: string;
};

export type SessionUser = {
    userId: string;
    username: string;
    role: Role;
};
