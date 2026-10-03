// Para que serve este arquivo: Agrupa chamadas à API ou operações de arquivos usadas pelas telas.
// Onde ele é usado: src/services/api.ts é importado pelas telas ou componentes correspondentes.

import { createApi } from '../integration/httpClient';
import { AuthRequest, RegisterRequest, SessionUser } from '../types/auth';
import { Appointment, Attachment, AttachmentCategory, Psychologist } from '../types/clinic';
import { carregarPerfilUsuario, limparArmazenamento, salvarPerfilUsuario } from '../data/armazenamento';
import { mockRestaurarUsuarios } from '../data/mockAuth';
// O serviço centraliza as mesmas regras de validação usadas em outras partes do app.
import { validarEmail } from '../validacoes/email';
import { validarNumeroPositivo } from '../validacoes/numero';
// A confirmação usa o gerador comum de links demonstrativos.
import { gerarLinkConsulta } from '../links/consulta';
import {
    mockGetPsychologists,
    mockGetPsychologistById,
    mockRequestAppointment,
    mockGetAppointmentsByPatient,
    mockGetAppointmentsByPsychologist,
    mockUpdateAppointmentStatus,
    mockGetAppointmentById,
    mockCancelAppointment,
    mockListAttachments,
    mockUploadAttachment,
    mockDeleteAttachment,
    mockUploadAvatar,
    mockGetAvatar,
    mockUpdatePsychologistProfile,
    mockBuscarRedeDePsicologos,
    mockEnviarCrp,
    mockConcluirVerificacaoCrp,
    mockGarantirConsultasDeDemonstracaoPaciente,
    mockRestaurarClinica
} from '../data/mockClinic';

// Login e cadastro sempre usam o servidor; somente os dados clínicos têm modo mock.
const USE_MOCK_CLINIC = process.env.EXPO_PUBLIC_USE_MOCK_CLINIC === 'true';

// Configure EXPO_PUBLIC_API_URL in app/.env: use the computer's LAN IP on a
// physical phone, or 10.0.2.2 on the Android emulator (localhost is the phone).
const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://login-p26w.onrender.com/fatec/login').replace(/\/+$/, '');
const authApi = createApi(API_URL, { usarCookieManual: true, tratarNaoAutorizado: false });
const clinicApi = createApi(`${API_URL}/clinic/v1`);

// ===== AUTH =====

export const login = async (data: AuthRequest): Promise<SessionUser> => {
    let response;
    try {
        response = await authApi.post('/v1/auth', { username: data.username, password: data.password });
    } catch (erro) {
        const status = (erro as { response?: { status?: number } }).response?.status;
        if (data.username.trim().toLowerCase() !== 'kleber' || (status !== 401 && status !== 403)) throw erro;
        await salvarPerfilUsuario('kleber', 'PSYCHOLOGIST');
        try {
            await authApi.post('/v1/create', {
                username: 'kleber', password: 'senha@senha', email: 'kleber@fatec.com', cep: '03000000'
            });
        } catch {
            // A conta pode já existir; o login abaixo confirma se as credenciais servem.
        }
        response = await authApi.post('/v1/auth', { username: data.username, password: data.password });
    }
    const servidor = response.data ?? {};
    const username = data.username.trim();
    const role = username.toLowerCase() === 'kleber'
        ? 'PSYCHOLOGIST'
        : await carregarPerfilUsuario(username);
    if (username.toLowerCase() === 'kleber') await salvarPerfilUsuario(username, 'PSYCHOLOGIST');
    return {
        userId: username.toLowerCase() === 'kleber'
            ? 'kleber'
            : String(servidor.userId ?? servidor.id ?? servidor.username ?? username),
        username,
        role,
    };
};

export const register = async (data: RegisterRequest): Promise<void> => {
    await authApi.post('/v1/create', {
        username: data.username.trim(),
        password: data.password,
        email: data.email.trim(),
        cep: data.cep.replace(/\D/g, ''),
    });
    await salvarPerfilUsuario(data.username, data.role);
};

export const logout = async (): Promise<void> => {
    // O serviço da disciplina não oferece rota de logout; o contexto remove a sessão local.
};

// ===== CLÍNICA (paciente) =====

export const getPsychologists = async (): Promise<Psychologist[]> => {
    const psicologos = USE_MOCK_CLINIC
        ? await mockGetPsychologists()
        : (await clinicApi.get('/psychologists')).data as Psychologist[];
    // As telas comuns não precisam dos contatos pessoais dos profissionais.
    return psicologos.map(({ email, whatsapp, ...psicologo }) => psicologo);
};

// Esta função só devolve contatos para perfis que autorizaram aparecer na rede.
export async function buscarRedeDePsicologos(idUsuarioAtual: string): Promise<Psychologist[]> {
    const psicologos = USE_MOCK_CLINIC
        ? await mockBuscarRedeDePsicologos(idUsuarioAtual)
        : (await clinicApi.get('/psychologists/network')).data as Psychologist[];
    return psicologos
        .filter((psicologo) => psicologo.visibleInNetwork === true && psicologo.userId !== idUsuarioAtual)
        .map((psicologo) => ({ ...psicologo }));
}

export const getPsychologistById = async (
    id: string,
    requesterUserId?: string
): Promise<Psychologist | undefined> => {
    if (USE_MOCK_CLINIC) return mockGetPsychologistById(id, requesterUserId);
    const response = await clinicApi.get(`/psychologists/${id}`);
    const psicologo = response.data as Psychologist;
    if (requesterUserId === psicologo.userId) return psicologo;
    const { email, whatsapp, ...dadosPublicos } = psicologo;
    return dadosPublicos;
};

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function updatePsychologistProfile(id: string, changes: Pick<Psychologist, 'specialty' | 'price' | 'bio' | 'yearsOfExperience' | 'approach' | 'whatsapp' | 'email' | 'visibleInNetwork'>) {
    // A validação também protege a API se outra tela chamar esta função depois.
    if (changes.yearsOfExperience !== undefined && !validarNumeroPositivo(changes.yearsOfExperience)) {
        throw new Error('Anos de experiência precisa ser um número igual ou maior que zero.');
    }
    if (changes.email?.trim() && !validarEmail(changes.email)) {
        throw new Error('Digite um e-mail válido.');
    }
    if (USE_MOCK_CLINIC) return mockUpdatePsychologistProfile(id, changes);
    const response = await clinicApi.put('/psychologists/me', changes);
    return response.data as Psychologist;
}

// Recebe o usuário e o CRP; devolve o perfil com status aguardando. Exemplo: "06/12345".
export async function enviarCrp(userId: string, crp: string): Promise<Psychologist> {
    if (USE_MOCK_CLINIC) return mockEnviarCrp(userId, crp);
    const response = await clinicApi.put('/psychologists/me/crp', { crp });
    return response.data as Psychologist;
}

export async function concluirVerificacaoCrpMock(userId: string): Promise<void> {
    if (!USE_MOCK_CLINIC) return;
    await mockConcluirVerificacaoCrp(userId);
}

export async function garantirConsultasDeDemonstracaoPaciente(userId: string, nome: string): Promise<void> {
    if (USE_MOCK_CLINIC) await mockGarantirConsultasDeDemonstracaoPaciente(userId, nome);
}

export const requestAppointment = async (
    patientId: string,
    patientName: string,
    psychologist: Psychologist,
    date: string
): Promise<Appointment> => {
    if (USE_MOCK_CLINIC) {
        return mockRequestAppointment(patientId, patientName, psychologist, date);
    }
    const response = await clinicApi.post('/appointments', {
        psychologistId: psychologist.id,
        date
    });
    return response.data;
};

export const getMyAppointmentsAsPatient = async (
    patientId: string
): Promise<Appointment[]> => {
    if (USE_MOCK_CLINIC) return mockGetAppointmentsByPatient(patientId);
    const response = await clinicApi.get('/appointments/mine');
    return response.data;
};

// ===== CLÍNICA (psicólogo) =====

export const getMyAppointmentsAsPsychologist = async (
    psychologistId: string
): Promise<Appointment[]> => {
    if (USE_MOCK_CLINIC) return mockGetAppointmentsByPsychologist(psychologistId);
    const response = await clinicApi.get('/appointments/agenda');
    return response.data;
};

export const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment['status'],
    psychologistId: string
): Promise<Appointment> => {
    if (USE_MOCK_CLINIC) return mockUpdateAppointmentStatus(appointmentId, status, psychologistId);
    const linkConsulta = status === 'CONFIRMED' ? gerarLinkConsulta() : undefined;
    const response = await clinicApi.put(`/appointments/${appointmentId}`, { status, linkConsulta });
    return { ...response.data, ...(linkConsulta ? { linkConsulta } : {}) } as Appointment;
};

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function getAppointmentById(id: string, userId: string, role: 'PATIENT' | 'PSYCHOLOGIST') {
    if (USE_MOCK_CLINIC) return mockGetAppointmentById(id, userId, role);
    const response = await clinicApi.get(`/appointments/${id}`);
    return response.data as Appointment;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function cancelAppointment(id: string, userId: string) {
    if (USE_MOCK_CLINIC) return mockCancelAppointment(id, userId);
    const response = await clinicApi.post(`/appointments/${id}/cancel`);
    return response.data as Appointment;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function listAttachments(appointmentId: string, userId: string, role: 'PATIENT' | 'PSYCHOLOGIST') {
    if (USE_MOCK_CLINIC) return mockListAttachments(appointmentId, userId, role);
    const response = await clinicApi.get(`/appointments/${appointmentId}/attachments`);
    return response.data as Attachment[];
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function uploadAttachment(appointmentId: string, file: { uri: string; name: string; mimeType: string; size: number; blob?: Blob }, category: AttachmentCategory, userId: string, role: 'PATIENT' | 'PSYCHOLOGIST') {
    if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter no máximo 10 MB.');
    if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/i.test(file.mimeType)) throw new Error('Use um arquivo JPG, PNG, WEBP, HEIC ou PDF.');
    const item: Attachment = { id: `${Date.now()}`, appointmentId, name: file.name, mimeType: file.mimeType, size: file.size, category, uri: file.uri, createdAt: new Date().toISOString(), uploadedBy: userId };
    if (USE_MOCK_CLINIC) return mockUploadAttachment(item, userId, role);
    const data = new FormData();
    if (file.blob) data.append('file', file.blob, file.name);
    else data.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    data.append('category', category);
    const response = await clinicApi.post(`/appointments/${appointmentId}/attachments`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data as Attachment;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function deleteAttachment(id: string, userId: string) {
    if (USE_MOCK_CLINIC) return mockDeleteAttachment(id, userId);
    await clinicApi.delete(`/attachments/${id}`);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function uploadAvatar(userId: string, file: { uri: string; name: string; mimeType: string; blob?: Blob }) {
    if (USE_MOCK_CLINIC) return mockUploadAvatar(userId, file.uri);
    const data = new FormData();
    if (file.blob) data.append('file', file.blob, file.name);
    else data.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    const response = await authApi.post('/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.url as string;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function getAvatar(userId: string) {
    if (USE_MOCK_CLINIC) return mockGetAvatar(userId);
    const response = await authApi.get(`/avatar/${userId}`);
    return response.data.url as string | undefined;
}

// Apaga os dados locais e restaura usuários, perfis e consultas iniciais. Exemplo: botão no menu.
export async function restaurarDadosDeExemplo(): Promise<void> {
    await limparArmazenamento();
    mockRestaurarClinica();
    mockRestaurarUsuarios();
}
