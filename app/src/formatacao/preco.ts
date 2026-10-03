// Para que serve este arquivo: Formata valores em reais para mostrar preços.
// Onde é usado: As telas de consulta e perfil importam esta função.

// Recebe um valor numérico e devolve o preço no padrão brasileiro. Exemplo: 150 vira "R$ 150,00".
export function formatarPreco(valor: number): string {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}
