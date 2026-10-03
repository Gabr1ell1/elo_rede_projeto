// Para que serve este arquivo: Monta um endereço internacional para abrir uma conversa no WhatsApp.
// Onde é usado: A tela da rede profissional importa esta função.

import { somenteDigitos } from "../formatacao/telefone";

// Recebe um telefone e devolve um endereço wa.me com código do Brasil. Exemplo: "(11) 98765-4321".
export function montarLinkWhatsapp(numero: string): string {
    const digitos = somenteDigitos(numero);
    const semCodigoPais = digitos.startsWith("55") ? digitos.slice(2) : digitos;
    return `https://wa.me/55${semCodigoPais}`;
}
