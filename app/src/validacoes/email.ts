// Para que serve este arquivo: Verifica se um texto tem formato básico de e-mail.
// Onde é usado: Os serviços validam o e-mail antes de salvar o perfil.

// Recebe um texto e devolve true quando ele parece um e-mail. Exemplo: "ana@elo.com" devolve true.
export function validarEmail(texto: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto.trim());
}
