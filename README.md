# 🧠 ELO — Plataforma de Conexão em Psicologia Clínica

A **ELO** é uma plataforma desenvolvida como projeto da disciplina de **Técnicas Avançadas de Programação Web Mobile**, com o objetivo de conectar psicólogos experientes a psicólogos em início de carreira e, ao mesmo tempo, facilitar o acesso dos pacientes ao atendimento psicológico.

## 📌 Sobre o projeto

A ELO surgiu a partir de um desequilíbrio presente na psicologia clínica:

* 🧑‍⚕️ **Psicólogos experientes** podem possuir uma alta demanda, fila de espera e precisar recusar novos pacientes por falta de disponibilidade.
* 👩‍💻 **Psicólogos recém-formados** podem encontrar dificuldades para conseguir seus primeiros pacientes e iniciar sua atuação clínica.
* 🧑 **Pacientes** podem enfrentar longos períodos de espera e valores elevados para conseguir atendimento.

A plataforma busca conectar essas duas pontas.

Por meio da ELO, um psicólogo experiente pode direcionar parte de sua demanda para um grupo de **psicólogos juniores previamente validados e supervisionados**. Dessa forma, o paciente é atendido por um profissional qualificado pertencente a esse grupo, sem necessariamente escolher qual psicólogo irá realizar o atendimento.

Como consequência, o paciente pode ter **menor tempo de espera e acesso a uma modalidade com valor reduzido**, enquanto o psicólogo júnior consegue adquirir experiência clínica com acompanhamento adequado.

> **A proposta da ELO é criar uma conexão entre experiência, novos profissionais e pacientes.**

---

## 🎯 Objetivo

O principal objetivo da ELO é:

> **Reduzir o tempo de espera de pacientes por atendimento psicológico clínico, ao mesmo tempo em que cria um caminho ético e supervisionado para novos psicólogos ingressarem na prática clínica com casos reais.**

---


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
