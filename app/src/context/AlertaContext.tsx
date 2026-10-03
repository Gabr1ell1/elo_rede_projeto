// Para que serve este arquivo: Compartilha a abertura e o fechamento do alerta de erro.
// Onde é usado: O provider envolve o app e as telas chamam useAlerta().mostrarErro().

import React, { createContext, useContext, useState } from "react";
import { AlertaErro } from "../components/alerta-erro";
import axios from "axios";

type AlertaDados = { mostrarErro: (titulo: string, mensagem: string) => void };
const ContextoAlerta = createContext<AlertaDados>({ mostrarErro: () => undefined });

// Recebe as telas filhas e disponibiliza o modal global de erros. Exemplo: usar em _layout.tsx.
export function AlertaProvider({ children }: { children: React.ReactNode }) {
    const [titulo, setTitulo] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [visivel, setVisivel] = useState(false);

    // Recebe título e motivo e abre o modal. Exemplo: mostrarErro("Erro de login", "Senha inválida").
    function mostrarErro(novoTitulo: string, novoMotivo: string) {
        setTitulo(novoTitulo);
        setMensagem(novoMotivo);
        setVisivel(true);
    }

    // Fecha o alerta quando o usuário toca no fundo, no X ou usa voltar no Android.
    function fecharErro() { setVisivel(false); }

    return (
        <ContextoAlerta.Provider value={{ mostrarErro }}>
            {children}
            <AlertaErro visivel={visivel} titulo={titulo} mensagem={mensagem} fechar={fecharErro} />
        </ContextoAlerta.Provider>
    );
}

// Devolve as ações globais do alerta para qualquer tela abaixo do provider. Exemplo: const { mostrarErro } = useAlerta().
export function useAlerta() { return useContext(ContextoAlerta); }

// Recebe um erro e devolve o motivo que deve ser mostrado. Exemplo: falha de rede recebe uma instrução de conexão.
export function motivoDoErro(erro: unknown): string {
    if (axios.isAxiosError(erro) && !erro.response) {
        return "Não foi possível acessar a API. Verifique se o serviço está ativo e se a URL foi configurada corretamente.";
    }
    return erro instanceof Error ? erro.message : "Ocorreu um erro inesperado.";
}
