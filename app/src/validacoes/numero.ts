// Para que serve este arquivo: Verifica números finitos maiores ou iguais a zero.
// Onde é usado: Os serviços validam valores numéricos recebidos das telas.

// Recebe um número e devolve true se ele for finito e não negativo. Exemplo: 0 devolve true.
export function validarNumeroPositivo(valor: number): boolean {
    return Number.isFinite(valor) && valor >= 0;
}
