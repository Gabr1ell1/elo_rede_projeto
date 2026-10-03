// Para que serve este arquivo: Verifica o formato numérico estadual de um CRP.
// Onde é usado: A tela de verificação profissional importa esta função.

// Recebe um texto e devolve true para o padrão 00/00000. Exemplo: "06/12345" devolve true.
export function validarCrp(texto: string): boolean {
    return /^\d{2}\/\d{5}$/.test(texto.trim());
}
