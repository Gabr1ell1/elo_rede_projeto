// Para que serve este arquivo: Fornece dados de demonstração para os modos mock.
// Onde ele é usado: src/data/mockClinic.ts é importado pelas telas ou componentes correspondentes.

// Estes dados simulam profissionais, consultas e anexos da clínica.
import { Appointment, Attachment, Psychologist } from "../types/clinic";
import { carregarDados, salvarDados } from "./armazenamento";
import { MOCK_PSICOLOGOS } from "./mockPsicologos";
import { criarConsultasExemplo, MOCK_CONSULTAS } from "./mockConsultas";
import { MOCK_ANEXOS } from "./mockAnexos";
import { MOCK_FOTOS } from "./mockFotos";
import { gerarLinkConsulta } from "../links/consulta";

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
function delay<T>(value: T, ms = 400): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let PSYCHOLOGISTS: Psychologist[] = JSON.parse(JSON.stringify(MOCK_PSICOLOGOS)) as Psychologist[];
let APPOINTMENTS: Appointment[] = JSON.parse(JSON.stringify(MOCK_CONSULTAS)) as Appointment[];
let ATTACHMENTS: Attachment[] = JSON.parse(JSON.stringify(MOCK_ANEXOS)) as Attachment[];
let AVATARS: Record<string, string> = JSON.parse(JSON.stringify(MOCK_FOTOS)) as Record<string, string>;
let dadosCarregados: Promise<void> | null = null;

// Carrega exemplos ou dados salvos uma vez nesta execucao do aplicativo.
async function garantirDadosCarregados(): Promise<void> {
    if (!dadosCarregados) {
        dadosCarregados = (async () => {
            const juntarPorId = <T extends { id: string }>(salvos: T[], exemplos: T[]) => {
                const ids = new Set(salvos.map((item) => item.id));
                return [...salvos, ...exemplos.filter((item) => !ids.has(item.id))];
            };
            const psicologosSalvos = await carregarDados("@Elo:psicologos", MOCK_PSICOLOGOS);
            PSYCHOLOGISTS = juntarPorId(psicologosSalvos, MOCK_PSICOLOGOS).map((psicologo) => ({ ...psicologo, statusCrp: psicologo.statusCrp ?? "SEM_ENVIO" }));
            const consultasSalvas = await carregarDados("@Elo:consultas", MOCK_CONSULTAS);
            const exemplosAtuais = criarConsultasExemplo();
            const datasAtuais = new Map(exemplosAtuais.map((consulta) => [consulta.id, consulta.date]));
            APPOINTMENTS = juntarPorId(consultasSalvas, exemplosAtuais).map((consulta) =>
                consulta.id.startsWith("kleber-pending-") && new Date(consulta.date).getTime() <= Date.now()
                    ? { ...consulta, date: datasAtuais.get(consulta.id) ?? consulta.date }
                    : consulta
            );
            const anexosSalvos = await carregarDados("@Elo:anexos", MOCK_ANEXOS);
            ATTACHMENTS = juntarPorId(anexosSalvos, MOCK_ANEXOS);
            AVATARS = await carregarDados("@Elo:fotos", MOCK_FOTOS);
            // Migra dados antigos: garante estado CRP e link em consultas já confirmadas.
            APPOINTMENTS = APPOINTMENTS.map((consulta) => consulta.status === "CONFIRMED" && !consulta.linkConsulta
                ? { ...consulta, linkConsulta: gerarLinkConsulta() }
                : consulta);
            await salvarDadosClinicos();
        })();
    }
    await dadosCarregados;
}

// Grava os quatro conjuntos da clinica sempre que uma acao altera dados locais.
async function salvarDadosClinicos(): Promise<void> {
    await Promise.all([
        salvarDados("@Elo:psicologos", PSYCHOLOGISTS),
        salvarDados("@Elo:consultas", APPOINTMENTS),
        salvarDados("@Elo:anexos", ATTACHMENTS),
        salvarDados("@Elo:fotos", AVATARS)
    ]);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe nenhum argumento e devolve perfis sem contatos privados. Exemplo: mockGetPsychologists().
export async function mockGetPsychologists(): Promise<Psychologist[]> {
    await garantirDadosCarregados();
    // A lista geral não entrega telefones nem e-mails pessoais.
    return delay(PSYCHOLOGISTS.map(({ email, whatsapp, ...psicologo }) => psicologo));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe id e, opcionalmente, o dono da sessao; devolve o perfil permitido. Exemplo: mockGetPsychologistById("psi1", "psi1").
export async function mockGetPsychologistById(
    id: string,
    requesterUserId?: string
): Promise<Psychologist | undefined> {
    await garantirDadosCarregados();
    // Uma consulta feita pelo próprio psicólogo prepara seu perfil vazio se necessário.
    const psicologo = requesterUserId === id
        ? await mockGarantirPerfilPsicologo(id)
        : PSYCHOLOGISTS.find((p) => p.id === id || p.userId === id);
    if (!psicologo) return delay(undefined);
    // O próprio profissional pode consultar os dados que preencheu no perfil.
    if (requesterUserId === psicologo.userId) return delay({ ...psicologo });
    const { email, whatsapp, ...dadosPublicos } = psicologo;
    return delay(dadosPublicos);
}

// A rede só mostra profissionais que escolheram aparecer e não inclui o usuário atual.
// Recebe o usuario atual e devolve colegas visiveis na rede. Exemplo: mockBuscarRedeDePsicologos("psi1").
export async function mockBuscarRedeDePsicologos(idUsuarioAtual: string): Promise<Psychologist[]> {
    await garantirDadosCarregados();
    return delay(PSYCHOLOGISTS
        .filter((psicologo) => psicologo.visibleInNetwork === true && psicologo.userId !== idUsuarioAtual)
        .map((psicologo) => ({ ...psicologo })));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe o id e campos alterados; devolve o perfil salvo. Exemplo: atualizar especialidade e preco.
export async function mockUpdatePsychologistProfile(id: string, changes: Pick<Psychologist, 'specialty' | 'price' | 'bio' | 'yearsOfExperience' | 'approach' | 'whatsapp' | 'email' | 'visibleInNetwork'>) {
    // A atualização usa o perfil existente ou cria a base com o mesmo userId.
    const item = await mockGarantirPerfilPsicologo(id);
    Object.assign(item, changes);
    await salvarDadosClinicos();
    return delay(item);
}

// Recebe o identificador do usuário e devolve um perfil existente ou vazio. Exemplo: "psi-novo".
export async function mockGarantirPerfilPsicologo(userId: string): Promise<Psychologist> {
    await garantirDadosCarregados();
    let item = PSYCHOLOGISTS.find((entrada) => entrada.userId === userId || entrada.id === userId);
    if (!item) {
        item = { id: userId, userId, name: userId, specialty: "", price: 0, bio: "", availableSlots: [], statusCrp: "SEM_ENVIO" };
        PSYCHOLOGISTS.push(item);
        await salvarDadosClinicos();
    }
    return delay(item);
}

// Recebe o userId e um CRP; devolve o perfil em espera e simula verificação após cinco segundos. Exemplo: "06/12345".
export async function mockEnviarCrp(userId: string, crp: string): Promise<Psychologist> {
    const perfil = await mockGarantirPerfilPsicologo(userId);
    perfil.crp = crp;
    perfil.statusCrp = "AGUARDANDO";
    await salvarDadosClinicos();
    return delay(perfil);
}

export async function mockConcluirVerificacaoCrp(userId: string): Promise<void> {
    await garantirDadosCarregados();
    const perfil = PSYCHOLOGISTS.find((entrada) => entrada.userId === userId);
    if (perfil?.statusCrp === "AGUARDANDO") {
        perfil.statusCrp = "VERIFICADO";
        await salvarDadosClinicos();
    }
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe paciente, profissional e horario; devolve o novo pedido pendente. Exemplo: solicitar um horario livre.
export async function mockRequestAppointment(
    patientId: string,
    patientName: string,
    psychologist: Psychologist,
    date: string
): Promise<Appointment> {
    await garantirDadosCarregados();
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
    await salvarDadosClinicos();
    return delay(appointment);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe id, usuario e papel; devolve a consulta se o usuario tiver acesso. Exemplo: abrir uma consulta propria.
export async function mockGetAppointmentById(id: string, userId: string, role: "PATIENT" | "PSYCHOLOGIST") {
    await garantirDadosCarregados();
    const item = APPOINTMENTS.find((appointment) => appointment.id === id);
    if (!item) throw new Error("Consulta não encontrada.");
    if ((role === "PATIENT" && item.patientId !== userId) || (role === "PSYCHOLOGIST" && item.psychologistId !== userId)) throw new Error("403: Acesso negado.");
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe a consulta e o paciente; devolve a consulta cancelada e libera o horario. Exemplo: cancelar uma solicitacao propria.
export async function mockCancelAppointment(id: string, userId: string) {
    await garantirDadosCarregados();
    const item = APPOINTMENTS.find((appointment) => appointment.id === id);
    if (!item || item.patientId !== userId) throw new Error("403: Acesso negado.");
    if (item.status !== "PENDING" && item.status !== "CONFIRMED") throw new Error("Esta consulta não pode ser cancelada.");
    item.status = "CANCELLED";
    const psychologist = PSYCHOLOGISTS.find((entry) => entry.id === item.psychologistId);
    if (psychologist && !psychologist.availableSlots.includes(item.date)) psychologist.availableSlots.push(item.date);
    await salvarDadosClinicos();
    return delay(item);
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe consulta, usuario e papel; devolve os anexos acessiveis. Exemplo: abrir anexos de uma consulta.
export async function mockListAttachments(appointmentId: string, userId: string, role: "PATIENT" | "PSYCHOLOGIST") {
    await garantirDadosCarregados();
    await mockGetAppointmentById(appointmentId, userId, role);
    return delay(ATTACHMENTS.filter((item) => item.appointmentId === appointmentId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe arquivo validado e paciente; devolve o anexo guardado. Exemplo: anexar um PDF.
export async function mockUploadAttachment(item: Attachment, userId: string, role: "PATIENT" | "PSYCHOLOGIST") {
    await garantirDadosCarregados();
    const consulta = await mockGetAppointmentById(item.appointmentId, userId, role);
    if (role === "PSYCHOLOGIST" && consulta.status !== "CONFIRMED") throw new Error("O psicólogo só pode enviar documentos em consultas confirmadas.");
    ATTACHMENTS = [...ATTACHMENTS, item];
    await salvarDadosClinicos();
    return delay(item);
}

// Cria exemplos de consultas e documentos somente na primeira entrada de cada paciente.
export async function mockGarantirConsultasDeDemonstracaoPaciente(patientId: string, patientName: string): Promise<void> {
    await garantirDadosCarregados();
    const chave = `@Elo:demo-paciente:${patientId}`;
    if (await carregarDados(chave, false)) return;
    const psicologo = PSYCHOLOGISTS.find((item) => item.userId === "kleber");
    const nomePsicologo = psicologo?.name ?? "Kleber Martins";
    const dataRelativa = (dias: number, hora: number) => {
        const data = new Date();
        data.setDate(data.getDate() + dias);
        data.setHours(hora, 0, 0, 0);
        const pad = (valor: number) => String(valor).padStart(2, "0");
        return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:00:00`;
    };
    const ids = [`demo-${patientId}-realizada-1`, `demo-${patientId}-realizada-2`, `demo-${patientId}-futura`];
    const novasConsultas: Appointment[] = [
        { id: ids[0], patientId, patientName, psychologistId: "kleber", psychologistName: nomePsicologo, date: dataRelativa(-21, 10), status: "CONFIRMED", linkConsulta: "https://meet.elo.fake/paciente-anterior-1" },
        { id: ids[1], patientId, patientName, psychologistId: "kleber", psychologistName: nomePsicologo, date: dataRelativa(-7, 15), status: "CONFIRMED", linkConsulta: "https://meet.elo.fake/paciente-anterior-2" },
        { id: ids[2], patientId, patientName, psychologistId: "kleber", psychologistName: nomePsicologo, date: dataRelativa(14, 11), status: "CONFIRMED", linkConsulta: "https://meet.elo.fake/paciente-futura" },
    ];
    const novosAnexos: Attachment[] = [
        { id: `${ids[0]}-laudo`, appointmentId: ids[0], name: "laudo-psicologico.pdf", mimeType: "application/pdf", size: 1450, category: "REPORT", uri: "elo-asset:laudo-psicologico", createdAt: new Date().toISOString(), uploadedBy: "kleber" },
        { id: `${ids[1]}-exame`, appointmentId: ids[1], name: "exame-sangue.pdf", mimeType: "application/pdf", size: 1450, category: "EXAM", uri: "elo-asset:exame-sangue", createdAt: new Date().toISOString(), uploadedBy: "kleber" },
        { id: `${ids[1]}-atestado`, appointmentId: ids[1], name: "atestado.pdf", mimeType: "application/pdf", size: 1450, category: "CERTIFICATE", uri: "elo-asset:atestado", createdAt: new Date().toISOString(), uploadedBy: "kleber" },
    ];
    APPOINTMENTS = juntarConsultas(APPOINTMENTS, novasConsultas);
    ATTACHMENTS = juntarAnexos(ATTACHMENTS, novosAnexos);
    await salvarDadosClinicos();
    await salvarDados(chave, true);
}

function juntarConsultas(atuais: Appointment[], novas: Appointment[]): Appointment[] {
    const ids = new Set(atuais.map((item) => item.id));
    return [...atuais, ...novas.filter((item) => !ids.has(item.id))];
}

function juntarAnexos(atuais: Attachment[], novos: Attachment[]): Attachment[] {
    const ids = new Set(atuais.map((item) => item.id));
    return [...atuais, ...novos.filter((item) => !ids.has(item.id))];
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe o id do anexo e o autor; apaga o item se ele pertencer ao autor. Exemplo: remover um arquivo enviado.
export async function mockDeleteAttachment(id: string, userId: string) {
    await garantirDadosCarregados();
    const item = ATTACHMENTS.find((entry) => entry.id === id);
    if (!item || item.uploadedBy !== userId) throw new Error("403: Acesso negado.");
    ATTACHMENTS = ATTACHMENTS.filter((entry) => entry.id !== id);
    await salvarDadosClinicos();
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe usuario e endereco local da foto; devolve o mesmo endereco depois de salvar. Exemplo: trocar avatar.
export async function mockUploadAvatar(userId: string, uri: string) { await garantirDadosCarregados(); AVATARS[userId] = uri; await salvarDadosClinicos(); return uri; }
// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe usuario e devolve o endereco de foto guardado, se existir. Exemplo: mostrar avatar do paciente.
export async function mockGetAvatar(userId: string) { await garantirDadosCarregados(); return AVATARS[userId]; }

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe paciente e devolve todas as consultas dele. Exemplo: montar a lista Minhas consultas.
export async function mockGetAppointmentsByPatient(
    patientId: string
): Promise<Appointment[]> {
    await garantirDadosCarregados();
    return delay(APPOINTMENTS.filter((a) => a.patientId === patientId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe psicologo e devolve consultas da agenda dele. Exemplo: contar pedidos pendentes.
export async function mockGetAppointmentsByPsychologist(
    psychologistId: string
): Promise<Appointment[]> {
    await garantirDadosCarregados();
    return delay(APPOINTMENTS.filter((a) => a.psychologistId === psychologistId));
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
// Recebe consulta, novo estado e psicologo; devolve o item salvo e cria link ao confirmar. Exemplo: confirmar um pedido.
export async function mockUpdateAppointmentStatus(
    appointmentId: string,
    status: Appointment["status"],
    psychologistId: string
): Promise<Appointment> {
    await garantirDadosCarregados();
    const existing = APPOINTMENTS.find((appointment) => appointment.id === appointmentId);
    if (!existing || existing.psychologistId !== psychologistId) throw new Error("403: Acesso negado.");
    APPOINTMENTS = APPOINTMENTS.map((a) => a.id === appointmentId
        ? { ...a, status, ...(status === "CONFIRMED" ? { linkConsulta: gerarLinkConsulta() } : {}) }
        : a);

    const updated = APPOINTMENTS.find((a) => a.id === appointmentId);
    if (!updated) {
        throw new Error("Consulta não encontrada");
    }

    await salvarDadosClinicos();
    return delay(updated);
}

// Restaura os exemplos na memória após armazenamento.ts apagar as chaves salvas.
export function mockRestaurarClinica(): void {
    PSYCHOLOGISTS = JSON.parse(JSON.stringify(MOCK_PSICOLOGOS)) as Psychologist[];
    APPOINTMENTS = JSON.parse(JSON.stringify(criarConsultasExemplo())) as Appointment[];
    ATTACHMENTS = JSON.parse(JSON.stringify(MOCK_ANEXOS)) as Attachment[];
    AVATARS = JSON.parse(JSON.stringify(MOCK_FOTOS)) as Record<string, string>;
    dadosCarregados = Promise.resolve();
}
