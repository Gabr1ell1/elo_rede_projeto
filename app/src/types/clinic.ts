// Para que serve este arquivo: Define os formatos de dados compartilhados pelo app.
// Onde ele é usado: src/types/clinic.ts é importado pelas telas ou componentes correspondentes.

export type Psychologist = {
    id: string;
    userId: string;
    name: string;
    specialty: string;
    price: number;
    bio: string;
    availableSlots: string[]; // ex: ["2026-09-10T14:00:00", ...]
    // Dados opcionais usados nos cartões e na rede profissional.
    yearsOfExperience?: number;
    approach?: string;
    whatsapp?: string;
    email?: string;
    visibleInNetwork?: boolean;
    // O status representa a etapa demonstrativa de conferência do CRP.
    crp?: string;
    statusCrp: 'SEM_ENVIO' | 'AGUARDANDO' | 'VERIFICADO';
};

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type AttachmentCategory = "EXAM" | "CERTIFICATE" | "REPORT" | "OTHER";

export type Attachment = {
    id: string;
    appointmentId: string;
    name: string;
    mimeType: string;
    size: number;
    category: AttachmentCategory;
    uri: string;
    createdAt: string;
    uploadedBy: string;
};

export type Appointment = {
    id: string;
    patientId: string;
    patientName: string;
    psychologistId: string;
    psychologistName: string;
    date: string;
    status: AppointmentStatus;
    // O endereço demonstrativo da chamada só existe após confirmar a consulta.
    linkConsulta?: string;
};
