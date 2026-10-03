// Para que serve este arquivo: Cria consultas de demonstração em datas atuais.
// Onde é usado: mockClinic.ts usa estes exemplos quando os dados são restaurados.

import { Appointment } from "../types/clinic";
import { MOCK_PACIENTES } from "./mockPacientes";

// Monta uma data local para manter os horários fáceis de ler nos cartões.
function dataRelativa(dias: number, hora: number): string {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    data.setHours(hora, 0, 0, 0);
    const pad = (valor: number) => String(valor).padStart(2, "0");
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:00:00`;
}

// Mantém quatro pedidos futuros, uma confirmação e um cancelamento para a conta de demonstração.
export function criarConsultasExemplo(): Appointment[] {
    const pacientes = MOCK_PACIENTES;
    return [
        ...pacientes.map((paciente, indice) => ({
            id: `kleber-pending-${indice + 1}`,
            patientId: paciente.id,
            patientName: paciente.name,
            psychologistId: "kleber",
            psychologistName: "Kleber Martins",
            date: dataRelativa(indice + 1, 9 + indice),
            status: "PENDING" as const,
        })),
        { id: "kleber-confirmed", patientId: pacientes[0].id, patientName: pacientes[0].name, psychologistId: "kleber", psychologistName: "Kleber Martins", date: dataRelativa(6, 14), status: "CONFIRMED", linkConsulta: "https://meet.elo.fake/kleber-exemplo" },
        { id: "kleber-cancelled", patientId: pacientes[1].id, patientName: pacientes[1].name, psychologistId: "kleber", psychologistName: "Kleber Martins", date: dataRelativa(7, 16), status: "CANCELLED" },
    ];
}

export const MOCK_CONSULTAS: Appointment[] = criarConsultasExemplo();
