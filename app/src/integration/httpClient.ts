// Para que serve este arquivo: Configura a comunicação HTTP compartilhada pelos serviços.
// Onde ele é usado: src/integration/httpClient.ts é importado pelas telas ou componentes correspondentes.

import axios from 'axios';

type UnauthorizeHandler = () => void;

let unauthorize: UnauthorizeHandler | null = null;

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function setUnauthorizeHandler(handler: UnauthorizeHandler) {
    unauthorize = handler;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function createApi(baseURL: string) {
    const instance = axios.create({
        baseURL,
        withCredentials: true,
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                unauthorize?.();
            }
            if (error.response?.status === 403) {
                error.message = 'Acesso negado. Você não tem permissão para esta ação.';
            }
            return Promise.reject(error);
        }
    );

    return instance;
}
