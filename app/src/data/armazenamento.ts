// Para que serve este arquivo: Lê, grava e limpa os dados de demonstração guardados no aparelho.
// Onde é usado: Os módulos mock de autenticação e clínica usam estas funções para persistir alterações.

import AsyncStorage from "@react-native-async-storage/async-storage";

// Recebe uma chave e um exemplo inicial; devolve o valor salvo ou grava e devolve o exemplo. Exemplo: carregarDados("@Elo:consultas", []).
export async function carregarDados<T>(chave: string, exemplo: T): Promise<T> {
    const guardado = await AsyncStorage.getItem(chave);
    if (guardado) return JSON.parse(guardado) as T;
    const copia = JSON.parse(JSON.stringify(exemplo)) as T;
    await AsyncStorage.setItem(chave, JSON.stringify(copia));
    return copia;
}

// Recebe uma chave e os dados atuais; grava a versão atualizada. Exemplo: salvarDados("@Elo:consultas", consultas).
export async function salvarDados<T>(chave: string, dados: T): Promise<void> {
    await AsyncStorage.setItem(chave, JSON.stringify(dados));
}

// Apaga somente os dados locais usados pelo app, inclusive a sessão, para restaurar os exemplos.
export async function limparArmazenamento(): Promise<void> {
    const chaves = await AsyncStorage.getAllKeys();
    const chavesDoApp = chaves.filter((chave) => chave.startsWith("@Elo:") || chave.startsWith("@Clinic:") || chave === "@Auth:user");
    if (chavesDoApp.length) await AsyncStorage.multiRemove(chavesDoApp);
}
