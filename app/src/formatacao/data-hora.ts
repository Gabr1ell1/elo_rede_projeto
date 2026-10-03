// Para que serve este arquivo: Formata datas e horários para leitura em português.
// Onde é usado: As listas e os detalhes de consulta importam estas funções.

// Recebe uma data ISO e devolve dia da semana, dia do mês e mês. Exemplo: "2026-10-06T14:30:00".
export function formatarDia(iso: string): string {
    const texto = new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Recebe uma data ISO e devolve hora e minuto. Exemplo: "2026-10-06T14:30:00" vira "14:30".
export function formatarHora(iso: string): string {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Recebe uma data ISO e devolve dia e hora juntos. Exemplo: "2026-10-06T14:30:00".
export function formatarDataHora(iso: string): string {
    return `${formatarDia(iso)}, ${formatarHora(iso)}`;
}
