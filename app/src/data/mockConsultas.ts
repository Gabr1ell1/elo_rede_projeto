// Para que serve este arquivo: Guarda as consultas de exemplo em diferentes estados.
// Onde é usado: mockClinic.ts usa esta lista quando o aparelho ainda não tem consultas salvas.

import { Appointment } from "../types/clinic";

// Os exemplos mostram uma solicitação, uma confirmação e um cancelamento.
export const MOCK_CONSULTAS: Appointment[] = [
    { id: "a1", patientId: "p1", patientName: "paciente1", psychologistId: "psi1", psychologistName: "Dra. Ana Souza", date: "2026-10-05T14:00:00", status: "PENDING" },
    { id: "a2", patientId: "p2", patientName: "paciente2", psychologistId: "psi1", psychologistName: "Dra. Ana Souza", date: "2026-10-06T15:00:00", status: "CONFIRMED", linkConsulta: "https://meet.elo.fake/exemplo1" },
    { id: "a3", patientId: "p1", patientName: "paciente1", psychologistId: "psi1", psychologistName: "Dra. Ana Souza", date: "2026-10-07T09:00:00", status: "CANCELLED" }
];
