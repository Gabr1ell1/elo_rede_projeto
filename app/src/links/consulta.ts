// Para que serve este arquivo: Cria um link de demonstração para uma consulta online.
// Onde é usado: O serviço de consultas usa esta função ao confirmar um agendamento.

// Devolve um link FALSO para demonstração; ele não abre uma sala real. Exemplo: "https://meet.elo.fake/abc123".
export function gerarLinkConsulta(): string {
    const codigo = Math.random().toString(36).slice(2, 10);
    return `https://meet.elo.fake/${codigo}`;
}
