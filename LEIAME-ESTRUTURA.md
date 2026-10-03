# Estrutura do Elo

Este guia explica onde fica cada parte do aplicativo, como iniciar a versão web ou Android e como apontar o app para a API.

## Pastas e arquivos importantes

- `app/`: aplicativo Expo com React Native, TypeScript e Expo Router.
- `app/src/app/`: telas e layouts. As pastas `(auth)` e `(app)` organizam as rotas de autenticação e as áreas protegidas. As pastas `paciente` e `psicologo` agrupam telas de cada perfil.
- `app/src/components/`: componentes visuais reutilizados, como avatar, campos e botões de autenticação, diálogo e tela de abertura.
- `app/src/context/AuthContext.tsx`: restaura e mantém a sessão de quem entrou no app.
- `app/src/services/`: chamadas à API e seleção, cópia e remoção de arquivos. Os arquivos `.native.ts` e `.web.ts` permitem comportamentos próprios de cada plataforma.
- `app/src/integration/httpClient.ts`: cria o cliente HTTP e trata respostas comuns da API.
- `app/src/data/`: dados de demonstração usados quando uma opção `EXPO_PUBLIC_USE_MOCK` está ligada.
- `app/src/types/`: formatos TypeScript usados pelos dados de autenticação e clínica.
- `app/src/constants/cores.ts`: paleta de cores compartilhada pelas telas.
- `app/src/hooks/`: hooks de tema e aparência.
- `app/assets/images/`: logos, ícones e imagens do aplicativo.
- `app/app.json`: nome do app, rotas Expo, ícones, permissões e splash. JSON não permite comentários; esta seção explica seus campos principais.
- `app/package.json`: dependências e comandos npm. JSON não permite comentários; veja os comandos abaixo.
- `app/metro.config.js`: configuração do empacotador Metro usado pelo Expo para preparar os módulos do app.
- `app/tsconfig.json`: regras de TypeScript e alias `@/` para importar a partir da pasta `app/`.
- `backend/elo-api/`: serviço de API usado pelo aplicativo.

## Como iniciar

Abra um terminal na pasta `app/`, instale as dependências quando necessário e inicie o Expo:

```sh
npm install
npm run web
```

Para abrir no emulador Android com o Expo Go instalado:

```sh
npm run android
```

Também é possível iniciar com `npx expo start` e ler o QR code com o Expo Go. A splash nativa configurada em `app.json` aparece em builds nativos; dentro do Expo Go, a tela `src/components/tela-abertura/` mostra a marca durante a restauração de sessão.

## URL da API

O aplicativo lê `EXPO_PUBLIC_API_URL`. O arquivo `app/.env.example` tem um exemplo para emulador Android. Copie-o para `app/.env` e escolha o endereço adequado:

- Emulador Android: `http://10.0.2.2:8082` (o backend deste projeto usa a porta 8082).
- Celular físico: `http://<IP-DO-COMPUTADOR-NA-REDE>:8082`, por exemplo `http://192.168.1.20:8082`.
- Web no mesmo computador: `http://localhost:8082`.

O `localhost` de um celular aponta para o próprio celular, por isso não serve para acessar o backend que roda no computador. Depois de editar `.env`, reinicie o Expo para carregar a variável. `.env` é local e ignorado pelo Git; não coloque credenciais privadas nele.

As opções `EXPO_PUBLIC_USE_MOCK` e `EXPO_PUBLIC_USE_MOCK_CLINIC` habilitam respostas de demonstração conforme indicado pelos nomes no próprio código de `src/services/api.ts`.

## Configuração do app

Em `app.json`, `name` e `slug` identificam o Elo; `icon` e `android.adaptiveIcon` definem o ícone; e o plugin `expo-splash-screen` usa a logo branca sobre o verde da paleta. As permissões e mensagens de câmera e fotos ficam no plugin `expo-image-picker`.

Em `package.json`, `npm run web` inicia a versão web e `npm run android` inicia a versão Android. `npx tsc --noEmit` verifica os tipos sem gerar arquivos.
