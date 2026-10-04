## 📱 Recurso mobile

Recursos nativos do dispositivo utilizados:

* **Câmera** (`expo-image-picker`): fotografar documentos e exames para anexar às consultas e trocar a foto de perfil. Código em `app/src/services/fileStorage.native.ts` (`takePhoto`). A permissão está declarada em `app/app.json`.
* **Gravação em pasta escolhida pelo usuário** (Storage Access Framework do Android): ao baixar um laudo ou exame, o usuário escolhe a pasta e o app grava o arquivo ali. Código em `app/src/services/download.ts` (`baixarNoAndroid`).

O projeto **não** utiliza GPS.

---

## 💾 Persistência dos dados

Para fins acadêmicos, os dados da clínica (psicólogos, consultas, anexos e fotos) são **mockados e salvos no próprio aparelho** com **AsyncStorage** (`app/src/data/armazenamento.ts`).

* Login e cadastro usam o serviço de autenticação da disciplina (JWT em cookie).
* Os arquivos anexados são copiados para a pasta interna do app; os downloads vão para a pasta escolhida pelo usuário.
* Como os dados ficam em cada aparelho, dois celulares não compartilham consultas.

---

## 🏗️ Estrutura do projeto

```text
ELO/
├── app/                      (Expo / React Native: Android e web)
│   ├── src/app/              telas e rotas (Expo Router)
│   ├── src/components/       componentes reutilizáveis
│   ├── src/context/          sessão (AuthContext) e alertas
│   ├── src/services/         api, download e fileStorage (câmera/arquivos)
│   ├── src/integration/      httpClient (Axios, cookie)
│   ├── src/data/             AsyncStorage e dados de demonstração
│   ├── src/types/            tipos TypeScript
│   ├── src/formatacao/       datas, preço, telefone
│   ├── src/validacoes/       CEP, CRP, e-mail, números
│   └── src/links/            WhatsApp e link da consulta
├── backend/elo-api/          API Java/Spring Boot própria da equipe (protótipo)
└── README.md
```

---

## 🚀 Como executar

```bash
cd app
npm install
npm run android   # ou: npm run web
```

Copie `app/.env.example` para `app/.env` e reinicie o Expo após alterar.

---

## 🧪 Dados para teste

**Psicólogo:** usuário `kleber` · senha `senha@senha` (a conta é criada no primeiro acesso)

**Paciente:** crie uma conta na tela de cadastro escolhendo o perfil Paciente.
