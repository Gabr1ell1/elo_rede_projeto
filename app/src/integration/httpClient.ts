// Para que serve este arquivo: Configura a comunicação HTTP compartilhada pelos serviços.
// Onde ele é usado: src/integration/httpClient.ts é importado pelas telas ou componentes correspondentes.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type UnauthorizeHandler = () => void;

let unauthorize: UnauthorizeHandler | null = null;

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
export function setUnauthorizeHandler(handler: UnauthorizeHandler) {
    unauthorize = handler;
}

// Esta funcao executa uma acao deste arquivo e mantem a logica desta parte da aplicacao em um so lugar.
const CHAVE_COOKIE_AUTH = '@Auth:cookie';

// O Android pode não manter o cookie entre requisições; por isso o app guarda o Set-Cookie e reenvia Cookie.
type ApiOptions = { usarCookieManual?: boolean; tratarNaoAutorizado?: boolean };

// Cria um cliente com cookie de sessão e tratamento opcional de sessão expirada.
export function createApi(baseURL: string, options: ApiOptions = {}) {
    const instance = axios.create({
        baseURL,
        withCredentials: true,
        timeout: 60_000,
    });

    if (options.usarCookieManual && Platform.OS !== 'web') {
        instance.interceptors.request.use(async (config) => {
            const cookie = await AsyncStorage.getItem(CHAVE_COOKIE_AUTH);
            // No navegador, o próprio cliente respeita withCredentials e o cookie do domínio.
            if (cookie) config.headers.set('Cookie', cookie);
            return config;
        });
    }

    instance.interceptors.response.use(
        async (response) => {
            if (options.usarCookieManual && Platform.OS !== 'web') {
                // Guarda somente pares nome=valor, sem atributos como Path, Secure e HttpOnly.
                const cabecalhoCookie = response.headers['set-cookie'];
                if (cabecalhoCookie) {
                    const cookies = (Array.isArray(cabecalhoCookie) ? cabecalhoCookie : [cabecalhoCookie])
                        .map((cookie: string) => cookie.split(';', 1)[0])
                        .filter(Boolean);
                    if (cookies.length) await AsyncStorage.setItem(CHAVE_COOKIE_AUTH, cookies.join('; '));
                }
            }
            return response;
        },
        (error) => {
            if (options.tratarNaoAutorizado !== false && error.response?.status === 401) {
                unauthorize?.();
            }
            if (error.response?.status === 403) {
                error.message = 'Acesso negado. Você não tem permissão para esta ação.';
            }
            if (error.code === 'ECONNABORTED') error.message = 'Conectando ao servidor, pode levar até 1 minuto. Tente novamente.';
            else if (error.response) {
                const motivo = error.response.data?.message ?? error.response.data?.error ?? error.response.statusText;
                error.message = motivo
                    ? `Erro ${error.response.status}: ${motivo}`
                    : `Erro ${error.response.status} ao acessar o servidor.`;
            }
            return Promise.reject(error);
        }
    );

    return instance;
}
