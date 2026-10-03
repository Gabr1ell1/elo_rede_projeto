// Para que serve este arquivo: Fornece dados de demonstração para os modos mock.
// Onde ele é usado: src/data/mockClinic.ts é importado pelas telas ou componentes correspondentes.

// Estes dados simulam profissionais, consultas e anexos da clínica.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment, Attachment, Psychologist } from "../types/clinic";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
function delay<T>(value: T, ms = 400): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const PSYCHOLOGISTS: Psychologist[] = [
    {
        id: "psi1",
        userId: "psi1",
        name: "Dra. Ana Souza",
        specialty: "Ansiedade e Estresse",
        price: 150,
        bio: "Psicóloga clínica com foco em TCC, atendimento adulto.",
        yearsOfExperience: 8,
        approach: "Terapia Cognitivo-Comportamental",
        whatsapp: "11987654321",
        email: "ana.souza@elo.exemplo",
        visibleInNetwork: true,
        availableSlots: [
            "2026-10-02T14:00:00",
            "2026-10-02T15:00:00",
            "2026-10-03T09:00:00"
        ]
    },
    {
        id: "psi2",
        userId: "psi2",
        name: "Dr. Marcos Lima",
        specialty: "Terapia de Casal",
        price: 180,
        bio: "Atendimento a casais e famílias há 10 anos.",
        yearsOfExperience: 10,
        approach: "Terapia Sistêmica",
        whatsapp: "11976543210",
        email: "marcos.lima@elo.exemplo",
        visibleInNetwork: true,
        availableSlots: ["2026-10-02T10:00:00", "2026-10-05T16:00:00"]
    },
    {
        id: "psi3",
        userId: "psi3",
        name: "Dra. Camila Rocha",
        specialty: "Psicologia Infantil",
        price: 140,
        bio: "Especialista em desenvolvimento infantil e adolescência.",
        yearsOfExperience: 6,
        approach: "Psicologia Histórico-Cultural",
        whatsapp: "11965432109",
        email: "camila.rocha@elo.exemplo",
        visibleInNetwork: false,
        availableSlots: ["2026-10-03T11:00:00"]
    }
];

// Estado em memória - reseta quando a página recarrega. É só pra
// simular o comportamento da API real enquanto o backend não existe.
let APPOINTMENTS: Appointment[] = [
    {
        id: "a1",
        patientId: "p1",
        patientName: "paciente1",
        psychologistId: "psi1",
        psychologistName: "Dra. Ana Souza",
        date: "2026-10-02T14:00:00",
        status: "PENDING"
    }
];
let ATTACHMENTS: Attachment[] = [];
const AVATARS: Record<string, string> = {};
let attachmentsLoaded: Promise<void> | null = null;

// AsyncStorage conserva os dados mockados entre aberturas do aplicativo.
async function loadAttachments() {
    if (!attachmentsLoaded) {
        attachmentsLoaded = AsyncStorage.getItem('@Clinic:attachments').then((raw) => {
            if (raw) ATTACHMENTS = JSON.parse(raw) as Attachment[];
        });
    }
    await attachmentsLoaded;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetPsychologists(): Promise<Psychologist[]> {
    // A lista geral não entrega telefones nem e-mails pessoais.
    return delay(PSYCHOLOGISTS.map(({ email, whatsapp, ...psicologo }) => psicologo));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetPsychologistById(
    id: string,
    requesterUserId?: string
): Promise<Psychologist | undefined> {
    const psicologo = PSYCHOLOGISTS.find((p) => p.id === id || p.userId === id);
    if (!psicologo) return delay(undefined);
    // O próprio profissional pode consultar os dados que preencheu no perfil.
    if (requesterUserId === psicologo.userId) return delay({ ...psicologo });
    const { email, whatsapp, ...dadosPublicos } = psicologo;
    return delay(dadosPublicos);
}

// A rede só mostra profissionais que escolheram aparecer e não inclui o usuário atual.
export async function mockBuscarRedeDePsicologos(idUsuarioAtual: string): Promise<Psychologist[]> {
    return delay(PSYCHOLOGISTS
        .filter((psicologo) => psicologo.visibleInNetwork === true && psicologo.userId !== idUsuarioAtual)
        .map((psicologo) => ({ ...psicologo })));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockUpdatePsychologistProfile(id: string, changes: Pick<Psychologist, 'specialty' | 'price' | 'bio' | 'yearsOfExperience' | 'approach' | 'whatsapp' | 'email' | 'visibleInNetwork'>) {
    const item = PSYCHOLOGISTS.find((entry) => entry.userId === id || entry.id === id);
    if (!item) throw new Error('Perfil profissional não encontrado.');
    Object.assign(item, changes);
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockRequestAppointment(
    patientId: string,
    patientName: string,
    psychologist: Psychologist,
    date: string
): Promise<Appointment> {
    const currentPsychologist = PSYCHOLOGISTS.find((item) => item.id === psychologist.id);
    if (!currentPsychologist?.availableSlots.includes(date)) throw new Error("Este horário não está mais disponível.");
    currentPsychologist.availableSlots = currentPsychologist.availableSlots.filter((slot) => slot !== date);
    const appointment: Appointment = {
        id: `a${APPOINTMENTS.length + 1}`,
        patientId,
        patientName,
        psychologistId: psychologist.id,
        psychologistName: psychologist.name,
        date,
        status: "PENDING"
    };

    APPOINTMENTS = [...APPOINTMENTS, appointment];
    return delay(appointment);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetAppointmentById(id: string, userId: string, role: "PATIENT" | "PSYCHOLOGIST") {
    const item = APPOINTMENTS.find((appointment) => appointment.id === id);
    if (!item) throw new Error("Consulta não encontrada.");
    if ((role === "PATIENT" && item.patientId !== userId) || (role === "PSYCHOLOGIST" && item.psychologistId !== userId)) throw new Error("403: Acesso negado.");
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockCancelAppointment(id: string, userId: string) {
    const item = APPOINTMENTS.find((appointment) => appointment.id === id);
    if (!item || item.patientId !== userId) throw new Error("403: Acesso negado.");
    if (item.status !== "PENDING" && item.status !== "CONFIRMED") throw new Error("Esta consulta não pode ser cancelada.");
    item.status = "CANCELLED";
    const psychologist = PSYCHOLOGISTS.find((entry) => entry.id === item.psychologistId);
    if (psychologist && !psychologist.availableSlots.includes(item.date)) psychologist.availableSlots.push(item.date);
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockListAttachments(appointmentId: string, userId: string, role: "PATIENT" | "PSYCHOLOGIST") {
    await loadAttachments();
    await mockGetAppointmentById(appointmentId, userId, role);
    return delay(ATTACHMENTS.filter((item) => item.appointmentId === appointmentId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockUploadAttachment(item: Attachment, userId: string) {
    await loadAttachments();
    await mockGetAppointmentById(item.appointmentId, userId, "PATIENT");
    ATTACHMENTS = [...ATTACHMENTS, item];
    await AsyncStorage.setItem("@Clinic:attachments", JSON.stringify(ATTACHMENTS));
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockDeleteAttachment(id: string, userId: string) {
    await loadAttachments();
    const item = ATTACHMENTS.find((entry) => entry.id === id);
    if (!item || item.uploadedBy !== userId) throw new Error("403: Acesso negado.");
    ATTACHMENTS = ATTACHMENTS.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem("@Clinic:attachments", JSON.stringify(ATTACHMENTS));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockUploadAvatar(userId: string, uri: string) { AVATARS[userId] = uri; return uri; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetAvatar(userId: string) { return AVATARS[userId]; }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetAppointmentsByPatient(
    patientId: string
): Promise<Appointment[]> {
    return delay(APPOINTMENTS.filter((a) => a.patientId === patientId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockGetAppointmentsByPsychologist(
    psychologistId: string
): Promise<Appointment[]> {
    return delay(APPOINTMENTS.filter((a) => a.psychologistId === psychologistId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export async function mockUpdateAppointmentStatus(
    appointmentId: string,
    status: Appointment["status"],
    psychologistId: string
): Promise<Appointment> {
    const existing = APPOINTMENTS.find((appointment) => appointment.id === appointmentId);
    if (!existing || existing.psychologistId !== psychologistId) throw new Error("403: Acesso negado.");
    APPOINTMENTS = APPOINTMENTS.map((a) =>
        a.id === appointmentId ? { ...a, status } : a
    );

    const updated = APPOINTMENTS.find((a) => a.id === appointmentId);
    if (!updated) {
        throw new Error("Consulta não encontrada");
    }

    return delay(updated);
}
