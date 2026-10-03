import { createApi } from '../integration/httpClient';
import { AuthRequest, RegisterRequest, SessionUser } from '../types/auth';
import { Appointment, Attachment, AttachmentCategory, Psychologist } from '../types/clinic';
import { mockLogin, mockRegister } from '../data/mockAuth';
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
    mockBuscarRedeDePsicologos
} from '../data/mockClinic';

// USE_MOCK: liga o mock de TUDO (login + clínica), sem backend.
// USE_MOCK_CLINIC: mantém login REAL (cookie JWT) e só a clínica em mock,
// porque o backend ainda não tem /clinic/v1.
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const USE_MOCK_CLINIC =
    USE_MOCK || process.env.EXPO_PUBLIC_USE_MOCK_CLINIC === 'true';

const authApi = createApi(`${process.env.EXPO_PUBLIC_API_URL}/auth/v1`);
const clinicApi = createApi(`${process.env.EXPO_PUBLIC_API_URL}/clinic/v1`);

// ===== AUTH =====

export const login = async (data: AuthRequest): Promise<SessionUser> => {
    if (USE_MOCK) return mockLogin(data);
    const response = await authApi.post('/auth', data);
    return response.data;
};

export const register = async (data: RegisterRequest): Promise<void> => {
    if (USE_MOCK) return mockRegister(data);
    await authApi.post('/user/save', data);
};

export const logout = async (): Promise<void> => {
    if (USE_MOCK) return;
    await authApi.post('/logout');
};

export const getMe = async (): Promise<SessionUser> => {
    if (USE_MOCK) throw new Error('getMe não tem suporte a mock ainda');
    const response = await authApi.get('/me');
    return response.data;
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

export async function updatePsychologistProfile(id: string, changes: Pick<Psychologist, 'specialty' | 'price' | 'bio' | 'yearsOfExperience' | 'approach' | 'whatsapp' | 'email' | 'visibleInNetwork'>) {
    // A validação também protege a API se outra tela chamar esta função depois.
    if (changes.yearsOfExperience !== undefined && (!Number.isFinite(changes.yearsOfExperience) || changes.yearsOfExperience < 0)) {
        throw new Error('Anos de experiência precisa ser um número igual ou maior que zero.');
    }
    if (changes.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email.trim())) {
        throw new Error('Digite um e-mail válido.');
    }
    if (USE_MOCK_CLINIC) return mockUpdatePsychologistProfile(id, changes);
    const response = await clinicApi.put('/psychologists/me', changes);
    return response.data as Psychologist;
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
    const response = await clinicApi.put(`/appointments/${appointmentId}`, { status });
    return response.data;
};

export async function getAppointmentById(id: string, userId: string, role: 'PATIENT' | 'PSYCHOLOGIST') {
    if (USE_MOCK_CLINIC) return mockGetAppointmentById(id, userId, role);
    const response = await clinicApi.get(`/appointments/${id}`);
    return response.data as Appointment;
}

export async function cancelAppointment(id: string, userId: string) {
    if (USE_MOCK_CLINIC) return mockCancelAppointment(id, userId);
    const response = await clinicApi.post(`/appointments/${id}/cancel`);
    return response.data as Appointment;
}

export async function listAttachments(appointmentId: string, userId: string, role: 'PATIENT' | 'PSYCHOLOGIST') {
    if (USE_MOCK_CLINIC) return mockListAttachments(appointmentId, userId, role);
    const response = await clinicApi.get(`/appointments/${appointmentId}/attachments`);
    return response.data as Attachment[];
}

export async function uploadAttachment(appointmentId: string, file: { uri: string; name: string; mimeType: string; size: number; blob?: Blob }, category: AttachmentCategory, userId: string) {
    if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter no máximo 10 MB.');
    if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/i.test(file.mimeType)) throw new Error('Use um arquivo JPG, PNG, WEBP, HEIC ou PDF.');
    const item: Attachment = { id: `${Date.now()}`, appointmentId, name: file.name, mimeType: file.mimeType, size: file.size, category, uri: file.uri, createdAt: new Date().toISOString(), uploadedBy: userId };
    if (USE_MOCK_CLINIC) return mockUploadAttachment(item, userId);
    const data = new FormData();
    if (file.blob) data.append('file', file.blob, file.name);
    else data.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    data.append('category', category);
    const response = await clinicApi.post(`/appointments/${appointmentId}/attachments`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data as Attachment;
}

export async function deleteAttachment(id: string, userId: string) {
    if (USE_MOCK_CLINIC) return mockDeleteAttachment(id, userId);
    await clinicApi.delete(`/attachments/${id}`);
}

export async function uploadAvatar(userId: string, file: { uri: string; name: string; mimeType: string; blob?: Blob }) {
    if (USE_MOCK_CLINIC) return mockUploadAvatar(userId, file.uri);
    const data = new FormData();
    if (file.blob) data.append('file', file.blob, file.name);
    else data.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    const response = await authApi.post('/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.url as string;
}

export async function getAvatar(userId: string) {
    if (USE_MOCK_CLINIC) return mockGetAvatar(userId);
    const response = await authApi.get(`/avatar/${userId}`);
    return response.data.url as string | undefined;
}
