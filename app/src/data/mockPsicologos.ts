// Para que serve este arquivo: Guarda perfis de psicólogos usados como exemplos no modo mock.
// Onde é usado: mockClinic.ts carrega esta lista como estado inicial da clínica.

import { Psychologist } from "../types/clinic";

// Estes profissionais cobrem exemplos verificados e ainda sem documentação enviada.
export const MOCK_PSICOLOGOS: Psychologist[] = [
    { id: "kleber", userId: "kleber", name: "Kleber Martins", specialty: "Psicologia clínica e saúde emocional", price: 160, bio: "Atendimento acolhedor para adultos, com foco em ansiedade, rotina e qualidade de vida.", yearsOfExperience: 7, approach: "Terapia Cognitivo-Comportamental", whatsapp: "11990000000", email: "kleber@fatec.com", visibleInNetwork: true, statusCrp: "VERIFICADO", crp: "06/12345", availableSlots: [] },
    { id: "psi1", userId: "psi1", name: "Dra. Ana Souza", specialty: "Ansiedade e Estresse", price: 150, bio: "Psicóloga clínica com foco em TCC, atendimento adulto.", yearsOfExperience: 8, approach: "Terapia Cognitivo-Comportamental", whatsapp: "11987654321", email: "ana.souza@elo.exemplo", visibleInNetwork: true, statusCrp: "VERIFICADO", availableSlots: ["2026-10-07T09:00:00", "2026-10-08T11:00:00"] },
    { id: "psi2", userId: "psi2", name: "Dr. Marcos Lima", specialty: "Terapia de Casal", price: 180, bio: "Atendimento a casais e famílias há 10 anos.", yearsOfExperience: 10, approach: "Terapia Sistêmica", whatsapp: "11976543210", email: "marcos.lima@elo.exemplo", visibleInNetwork: true, statusCrp: "SEM_ENVIO", availableSlots: ["2026-10-05T10:00:00", "2026-10-06T16:00:00"] },
    { id: "psi3", userId: "psi3", name: "Dra. Camila Rocha", specialty: "Psicologia Infantil", price: 140, bio: "Especialista em desenvolvimento infantil e adolescência.", yearsOfExperience: 6, approach: "Psicologia Histórico-Cultural", visibleInNetwork: false, statusCrp: "VERIFICADO", availableSlots: ["2026-10-07T11:00:00"] }
];
