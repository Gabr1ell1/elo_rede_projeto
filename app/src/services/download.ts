// Para que serve este arquivo: Autoriza e salva anexos na web ou em uma pasta escolhida no Android.
// Onde é usado: As telas de anexos chamam baixarAnexo e mostram o resultado no alerta compartilhado.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { getAppointmentById, listAttachments } from "./api";
import { Attachment } from "../types/clinic";

const CHAVE_PASTA = "@Elo:pasta-download";
const ASSETS: Record<string, number> = {
    "exame-sangue": require("../../assets/exemplos/exame-sangue.pdf"),
    "laudo-psicologico": require("../../assets/exemplos/laudo-psicologico.pdf"),
    atestado: require("../../assets/exemplos/atestado.pdf"),
};

export type ResultadoDownload = { pasta: string; caminho?: string };

// Baixa somente anexos que pertencem a uma consulta do usuário informado.
export async function baixarAnexo(anexo: Attachment, userId: string, role: "PATIENT" | "PSYCHOLOGIST"): Promise<ResultadoDownload> {
    const consulta = await getAppointmentById(anexo.appointmentId, userId, role);
    if (!consulta || (consulta.patientId !== userId && consulta.psychologistId !== userId)) {
        throw new Error("Você não tem acesso a este documento.");
    }
    const anexosAutorizados = await listAttachments(anexo.appointmentId, userId, role);
    if (!anexosAutorizados.some((item) => item.id === anexo.id)) {
        throw new Error("Este documento não pertence à consulta.");
    }
    if (Platform.OS === "web") return baixarNoNavegador(anexo);
    return baixarNoAndroid(anexo);
}

// Resolve arquivos de demonstração, endereços remotos e arquivos que já estão no aparelho.
async function prepararArquivo(anexo: Attachment): Promise<string> {
    if (!FileSystem.cacheDirectory) throw new Error("A pasta temporária do aparelho não está disponível.");
    const pastaCache = `${FileSystem.cacheDirectory}elo-downloads/`;
    if (!(await FileSystem.getInfoAsync(pastaCache)).exists) await FileSystem.makeDirectoryAsync(pastaCache, { intermediates: true });
    const destino = `${pastaCache}${nomeSeguro(anexo.name)}`;
    if ((await FileSystem.getInfoAsync(destino)).exists) await FileSystem.deleteAsync(destino, { idempotent: true });
    let origem = anexo.uri;
    if (origem.startsWith("elo-asset:")) {
        const nome = origem.slice("elo-asset:".length);
        const modulo = ASSETS[nome];
        if (!modulo) throw new Error("O documento de exemplo não foi encontrado.");
        const asset = Asset.fromModule(modulo);
        await asset.downloadAsync();
        origem = asset.localUri ?? asset.uri;
    }
    if (/^https?:\/\//i.test(origem)) {
        await FileSystem.downloadAsync(origem, destino);
        return destino;
    }
    if (origem.startsWith("data:")) {
        const base64 = origem.split(",", 2)[1];
        if (!base64) throw new Error("O arquivo recebido está vazio.");
        await FileSystem.writeAsStringAsync(destino, base64, { encoding: "base64" });
        return destino;
    }
    await FileSystem.copyAsync({ from: origem, to: destino });
    return destino;
}

// Pede a pasta ao usuário, lembra a escolha e grava o arquivo com permissão do Storage Access Framework.
async function baixarNoAndroid(anexo: Attachment): Promise<ResultadoDownload> {
    const arquivoCache = await prepararArquivo(anexo);
    const SAF = FileSystem.StorageAccessFramework;
    let pasta = await AsyncStorage.getItem(CHAVE_PASTA);
    if (pasta) {
        try { await SAF.readDirectoryAsync(pasta); }
        catch { pasta = null; await AsyncStorage.removeItem(CHAVE_PASTA); }
    }
    if (!pasta) {
        const permissao = await SAF.requestDirectoryPermissionsAsync();
        if (!permissao.granted) return compartilharComoAlternativa(arquivoCache, anexo);
        pasta = permissao.directoryUri;
    }
    try {
        const nome = nomeSeguro(anexo.name);
        const semExtensao = nome.replace(/\.[^.]+$/, "");
        const destino = await SAF.createFileAsync(pasta, semExtensao, anexo.mimeType || "application/octet-stream");
        const conteudo = await FileSystem.readAsStringAsync(arquivoCache, { encoding: "base64" });
        await SAF.writeAsStringAsync(destino, conteudo, { encoding: "base64" });
        await AsyncStorage.setItem(CHAVE_PASTA, pasta);
        return { pasta: nomeDaPasta(pasta), caminho: destino };
    } catch (erro) {
        await AsyncStorage.removeItem(CHAVE_PASTA);
        return compartilharComoAlternativa(arquivoCache, anexo, erro);
    }
}

// Abre a folha de compartilhamento se a pasta foi cancelada ou não permitiu gravar o documento.
async function compartilharComoAlternativa(uri: string, anexo: Attachment, causa?: unknown): Promise<ResultadoDownload> {
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: anexo.mimeType, dialogTitle: `Salvar ${nomeSeguro(anexo.name)}` });
        return { pasta: "compartilhamento" };
    }
    if (causa instanceof Error) throw causa;
    throw new Error("A pasta não foi autorizada e o compartilhamento não está disponível.");
}

// Cria um link temporário com o atributo download para o navegador salvar o arquivo.
async function baixarNoNavegador(anexo: Attachment): Promise<ResultadoDownload> {
    let href = anexo.uri;
    if (href.startsWith("elo-asset:")) {
        const modulo = ASSETS[href.slice("elo-asset:".length)];
        if (!modulo) throw new Error("O documento de exemplo não foi encontrado.");
        const asset = Asset.fromModule(modulo);
        await asset.downloadAsync();
        href = asset.localUri ?? asset.uri;
    }
    if (href.startsWith("file://")) {
        const arquivo = await fetch(href);
        href = URL.createObjectURL(await arquivo.blob());
        setTimeout(() => URL.revokeObjectURL(href), 60_000);
    }
    const link = document.createElement("a");
    link.href = href;
    link.download = nomeSeguro(anexo.name);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { pasta: "downloads do navegador" };
}

// Remove caracteres que poderiam criar caminhos fora da pasta escolhida.
function nomeSeguro(nome: string): string {
    return nome.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim() || "anexo";
}

// Apresenta o nome mais reconhecível do diretório escolhido pelo usuário.
function nomeDaPasta(uri: string): string {
    const decodificada = decodeURIComponent(uri);
    const trecho = decodificada.split(":").pop()?.split("/").filter(Boolean).pop();
    return trecho || "pasta selecionada";
}
