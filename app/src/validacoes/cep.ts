// Para que serve este arquivo: Formata e valida CEPs brasileiros no cadastro.
// Onde é usado: A tela de cadastro aplica a máscara antes de enviar os oito dígitos.

// Mantém somente números e apresenta o CEP no formato 00000-000.
export function mascararCep(valor: string): string {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);
    return numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
}

// Exige os oito dígitos usados pelo serviço do professor.
export function validarCep(valor: string): boolean {
    return /^\d{8}$/.test(valor.replace(/\D/g, ""));
}
