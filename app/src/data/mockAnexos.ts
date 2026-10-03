// Para que serve este arquivo: Liga documentos fictícios às consultas da demonstração.
// Onde é usado: mockClinic.ts carrega estes anexos como estado inicial.

import { Attachment } from "../types/clinic";

// O prefixo elo-asset aponta para PDFs empacotados e resolvidos pelo serviço de download.
export const MOCK_ANEXOS: Attachment[] = [
    { id: "kleber-anexo-exame-1", appointmentId: "kleber-pending-1", name: "exame-sangue.pdf", mimeType: "application/pdf", size: 687, category: "EXAM", uri: "elo-asset:exame-sangue", createdAt: new Date().toISOString(), uploadedBy: "demo-paciente-ana" },
    { id: "kleber-anexo-exame-2", appointmentId: "kleber-pending-2", name: "exame-sangue.pdf", mimeType: "application/pdf", size: 687, category: "EXAM", uri: "elo-asset:exame-sangue", createdAt: new Date().toISOString(), uploadedBy: "demo-paciente-bruno" },
    { id: "kleber-anexo-atestado-3", appointmentId: "kleber-pending-3", name: "atestado.pdf", mimeType: "application/pdf", size: 679, category: "CERTIFICATE", uri: "elo-asset:atestado", createdAt: new Date().toISOString(), uploadedBy: "demo-paciente-clara" },
    { id: "kleber-anexo-laudo-3", appointmentId: "kleber-pending-3", name: "laudo-psicologico.pdf", mimeType: "application/pdf", size: 691, category: "REPORT", uri: "elo-asset:laudo-psicologico", createdAt: new Date().toISOString(), uploadedBy: "demo-paciente-clara" },
];
