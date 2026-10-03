// Para que serve este arquivo: Mantém somente algarismos de um telefone.
// Onde é usado: A tela da rede e o montador de link do WhatsApp importam esta função.

// Recebe um texto de telefone e devolve apenas os dígitos. Exemplo: "+55 (11) 98765-4321" vira "5511987654321".
export function somenteDigitos(texto: string): string {
    return texto.replace(/\D/g, "");
}
