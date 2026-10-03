// Para que serve este arquivo: Fornece dados de demonstração para os modos mock.
// Onde ele é usado: src/data/mockAuth.ts é importado pelas telas ou componentes correspondentes.

// Estes dados simulam usuários para testar login e cadastro sem o backend.
import { AuthRequest, RegisterRequest, SessionUser } from "../types/auth";
// O cadastro mock também prepara o perfil clínico dos novos psicólogos.
import { mockGarantirPerfilPsicologo } from "./mockClinic";

// Os usuarios iniciais ficam em arquivo e as novas contas sao salvas no aparelho.
import { carregarDados, salvarDados } from "./armazenamento";
import { MOCK_USUARIOS, UsuarioMock } from "./mockUsuarios";

let FAKE_USERS: Record<string, UsuarioMock> = JSON.parse(JSON.stringify(MOCK_USUARIOS)) as Record<string, UsuarioMock>;
let usuariosCarregados: Promise<void> | null = null;

// Le as contas salvas ou cria a lista inicial na primeira operacao.
async function garantirUsuariosCarregados(): Promise<void> {
    if (!usuariosCarregados) {
        usuariosCarregados = carregarDados("@Elo:usuarios", MOCK_USUARIOS).then((usuarios) => { FAKE_USERS = usuarios; });
    }
    await usuariosCarregados;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
function delay<T>(value: T, ms = 500): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe nome de usuario e senha; devolve a sessao ou informa a causa da falha. Exemplo: entrar com paciente1.
export async function mockLogin(data: AuthRequest): Promise<SessionUser> {
    await garantirUsuariosCarregados();
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
// Recebe os campos de cadastro; cria usuario e perfil profissional quando necessario. Exemplo: cadastrar um psicologo.
export async function mockRegister(data: RegisterRequest): Promise<void> {
    await garantirUsuariosCarregados();
    const userId = `mock-${Object.keys(FAKE_USERS).length + 1}`;

    FAKE_USERS[data.username] = {
        password: data.password,
        user: { userId, username: data.username, role: data.role }
    };

    await salvarDados("@Elo:usuarios", FAKE_USERS);

    // Usa o mesmo userId no cadastro e no perfil profissional.
    if (data.role === "PSYCHOLOGIST") await mockGarantirPerfilPsicologo(userId);

    await delay(undefined);
}

// Restaura as contas de exemplo depois de o armazenamento remover os dados salvos.
export function mockRestaurarUsuarios(): void {
    FAKE_USERS = JSON.parse(JSON.stringify(MOCK_USUARIOS)) as Record<string, UsuarioMock>;
    usuariosCarregados = Promise.resolve();
}
