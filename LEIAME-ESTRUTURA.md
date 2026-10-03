# Elo - arquitetura e demonstracao

Este guia apresenta as camadas do aplicativo, o login do serviço da disciplina, os recursos nativos e o roteiro da atividade.

## Arquitetura por camadas

- `app/src/app/`: telas e layouts do Expo Router. `(auth)` agrupa login, cadastro e escolha do perfil; `(app)` protege as áreas de paciente e psicólogo. As pastas entre parênteses organizam os arquivos sem fazer parte do caminho público da rota.
- `app/src/components/`: elementos visuais reutilizados, como campos, cartões de anexos, alertas, avatares e menu.
- `app/src/context/`: estado compartilhado. `AuthContext.tsx` mantém a sessão e o CRP; `AlertaContext.tsx` apresenta erros e confirmações de sucesso.
- `app/src/services/`: operações da aplicação. `api.ts` conversa com o serviço de autenticação ou com os dados clínicos de demonstração; `download.ts` autoriza e salva anexos; `fileStorage.*.ts` escolhe e guarda arquivos conforme a plataforma.
- `app/src/integration/`: `httpClient.ts` configura Axios, cookies, timeout e mensagens de resposta HTTP.
- `app/src/data/`: armazenamento local e exemplos da clínica, incluindo psicólogo, pacientes, consultas e anexos.
- `app/src/types/`: formatos TypeScript para usuários, consultas, psicólogos e documentos.
- `app/src/formatacao/`: apresentação de datas, horários, preços e telefones.
- `app/src/validacoes/`: regras reutilizadas em formulários, como e-mail, números, CRP e CEP.
- `app/src/links/`: criação de links demonstrativos e links para contato.
- `app/src/hooks/` e `app/src/constants/`: hooks de aparência e cores compartilhadas.
- `app/assets/exemplos/`: PDFs fictícios empacotados com o aplicativo.

Não usamos GPS nem `expo-location`. A câmera é acessada pelo `expo-image-picker`, e a gravação em uma pasta escolhida usa o Storage Access Framework do Android.

## Configuração e execução

Na pasta `app/`, instale as dependências e inicie a plataforma desejada:

```sh
npm install
npm run android
npm run web
```

`app/.env.example` mostra as variáveis de ambiente. Copie-o para `app/.env` e reinicie o Expo após alterar esse arquivo. A configuração padrão usa `https://login-p26w.onrender.com/fatec/login` como base do serviço de autenticação.

- `EXPO_PUBLIC_API_URL`: URL base do serviço. O aplicativo acrescenta `/v1/auth` no login e `/v1/create` no cadastro.
- `EXPO_PUBLIC_USE_MOCK_CLINIC=true`: mantém consultas, perfis clínicos e anexos no armazenamento local. Login e cadastro sempre usam o serviço real.

O servidor gratuito pode levar um tempo para acordar. O cliente HTTP espera até 60 segundos e mostra a mensagem de conexão quando o limite é atingido.

## Login com JWT em cookie

1. A tela de cadastro coleta usuário, e-mail, senha, CEP e papel. O CEP é exibido com a máscara `00000-000` e enviado com oito dígitos no corpo de `POST /v1/create`.
2. O serviço da disciplina recebe usuário, senha, e-mail e CEP. Como ele não guarda o papel do Elo, `armazenamento.ts` associa Paciente ou Psicólogo ao nome de usuário no AsyncStorage.
3. No login, `POST /v1/auth` envia usuário e senha. Axios usa `withCredentials: true` para o cookie da sessão.
4. No navegador, o cliente deixa o navegador administrar o cookie. No Android, o app guarda o par nome/valor recebido em `Set-Cookie` no AsyncStorage e o envia como `Cookie` nas requisições seguintes. Isso evita depender da persistência do cookie nativo entre telas e reinicializações.
5. `AuthContext.tsx` guarda o usuário localmente para restaurar a sessão ao reabrir o app. O serviço não oferece rota de `/me` ou `/logout`; por isso o app não tenta validá-la ou chamar logout remoto. Sair remove a sessão e o cookie locais.
6. Se uma conta não tiver papel salvo, o app mostra a escolha de Paciente ou Psicólogo. A conta `kleber` é sempre tratada como Psicólogo, com perfil clínico verificado. Se o login falhar por 401 ou 403, o app tenta criar a conta de demonstração uma única vez e repete o login.

Erros HTTP mostram o status e o motivo recebido do servidor. Um timeout mostra que a conexão pode levar até um minuto.

## Dados de demonstração e decisões

- Somente a clínica é mockada. O login continua demonstrando autenticação real por cookie; consultas e anexos permanecem disponíveis sem um backend clínico.
- O papel fica em AsyncStorage porque não existe no contrato do serviço de autenticação. A sessão local também permite restaurar a tela sem uma rota `/me`.
- O perfil Kleber tem CRP verificado e dados preparados. As quatro solicitações usam datas futuras calculadas na inicialização e são atualizadas se ficarem vencidas.
- Um paciente recebe duas consultas passadas e uma futura na primeira entrada. A marca local impede duplicar esses exemplos em logins posteriores.
- Os três PDFs em `assets/exemplos/` são fictícios e trazem a marca “DOCUMENTO FICTÍCIO”. `expo-asset` localiza os arquivos empacotados antes do download.
- O link de consulta é falso e serve somente para demonstrar a interface. Não inicia uma consulta real.
- O Android pede a pasta de destino uma vez e guarda a URI no AsyncStorage. O Storage Access Framework dá permissão para criar o documento na pasta escolhida sem pedir acesso amplo ao armazenamento. Se a permissão vencer ou a gravação falhar, o app pede a pasta novamente ou oferece compartilhamento.
- Na web, o aplicativo cria um link com o atributo `download` para o navegador salvar o arquivo.

## Roteiro de teste

1. Inicie o app no Android e entre com `kleber` e `senha@senha`. Se a conta não existir, aguarde a tentativa de criação e o segundo login.
2. Abra **Solicitações**. Confira os quatro pedidos futuros, seus anexos e os cartões com categoria, tipo, tamanho e botão **Baixar**.
3. Baixe um exame. Na primeira vez, escolha uma pasta no seletor Android; baixe novamente e confirme que a pasta é reutilizada. Use **Baixar todos** em uma solicitação com mais de um documento.
4. Abra uma solicitação, confirme a consulta e entre no detalhe dela. Anexe um laudo usando câmera, galeria ou seletor de arquivos.
5. Cadastre um usuário com perfil **Paciente**, e-mail, senha e CEP. Entre com essa conta e abra **Consultas realizadas** no menu.
6. Abra uma consulta passada, confira os documentos marcados como enviados pelo psicólogo e baixe o laudo. Verifique o arquivo na pasta escolhida.
7. Teste um erro, por exemplo, usando uma senha incorreta ou desligando a rede antes de entrar. Confirme que o alerta padrão mostra o status e o motivo.

## Validação

Na pasta `app/`, execute `npx tsc --noEmit` para verificar os tipos sem gerar arquivos.
