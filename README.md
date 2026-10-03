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

## 📱 Funcionalidades

A aplicação conta com diferentes funcionalidades para representar o fluxo da plataforma.

### 🔐 Autenticação

O sistema possui autenticação de usuários utilizando:

* Login e senha;
* Geração de **JWT (JSON Web Token)**;
* Armazenamento do token por meio de **cookies**;
* Validação da autenticação para acesso às áreas protegidas da aplicação.

O uso do JWT permite que o backend identifique o usuário autenticado durante as requisições.

### 📋 Atendimento psicológico

O paciente pode utilizar a plataforma para buscar atendimento e visualizar informações relacionadas ao processo de atendimento.

A proposta é que, na modalidade voltada aos psicólogos juniores, o paciente seja direcionado para um profissional pertencente ao grupo validado pela plataforma.

### 📱 Recurso mobile

Como parte dos requisitos da disciplina, a aplicação utiliza um **recurso nativo do dispositivo móvel**.

> **Recurso utilizado: [COLOCAR AQUI — GPS / CÂMERA / OUTRO]**

Esse recurso é integrado à aplicação para adicionar uma funcionalidade que depende do dispositivo móvel.

**Exemplo:** caso seja utilizado GPS, a aplicação poderá utilizar a localização do dispositivo para determinadas funcionalidades relacionadas ao atendimento.

---

## 💾 Persistência dos dados

Para fins acadêmicos, os dados da aplicação são **mockados**, não sendo utilizado um banco de dados real.

As informações são armazenadas em arquivos locais, como:

```text
.txt
.json
```

Quando um novo cadastro é realizado, os dados são adicionados ao arquivo utilizado pela aplicação.

Exemplo de fluxo:

```text
Usuário realiza cadastro
        ↓
Aplicação recebe os dados
        ↓
Dados são processados
        ↓
Dados são salvos no arquivo
        ↓
Aplicação pode consultar os dados posteriormente
```

Essa abordagem permite simular uma camada de persistência sem a necessidade de configurar um banco de dados para o projeto.

---

## 🔒 Fluxo de autenticação

O processo de autenticação funciona, de forma simplificada, da seguinte maneira:

```text
┌──────────────┐
│    Usuário   │
└──────┬───────┘
       │ Login
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │
       │ Valida usuário
       ▼
┌──────────────┐
│ Gera JWT     │
└──────┬───────┘
       │
       │ JWT
       ▼
┌──────────────┐
│    Cookie    │
└──────┬───────┘
       │
       │ Requisições autenticadas
       ▼
┌──────────────┐
│ Rotas/API    │
└──────────────┘
```

O token é enviado por **cookie**, permitindo que as requisições realizadas posteriormente sejam autenticadas pelo servidor.

---

## 🛠️ Tecnologias utilizadas

### Front-end

* React Native
* Expo
* JavaScript / TypeScript
* Expo Router

### Back-end

* Java
* Spring Boot
* JWT
* Cookies

### Persistência

* Arquivos `.txt` / `.json`
* Dados mockados

### Recursos mobile

* **[GPS / Câmera / outro recurso utilizado]**

---

## 🏗️ Estrutura do projeto

```text
ELO/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── constants/
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   └── ...
│
├── data/
│   ├── usuarios.txt
│   └── ...
│
└── README.md
```

*A estrutura pode ser ajustada de acordo com a organização final do projeto.*

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone [LINK DO REPOSITÓRIO]
```

### 2. Acessar o projeto

```bash
cd ELO
```

### 3. Executar o backend

```bash
[COMANDO UTILIZADO NO PROJETO]
```

### 4. Executar o aplicativo

```bash
npm install
npm start
```

ou, utilizando Expo:

```bash
npx expo start
```

---

## 📲 APK

O projeto também possui uma versão **APK** para instalação em dispositivos Android, conforme solicitado na disciplina.

> 📦 **APK:** [ADICIONAR LINK/ARQUIVO DO APK]

---

## 🧪 Dados para teste

Como os dados são mockados, o projeto disponibiliza usuários para testar os diferentes fluxos da aplicação.

### Paciente

```text
E-mail: [EMAIL]
Senha: [SENHA]
```

### Psicólogo

E-mail: [EMAIL]
Senha: [SENHA]

Os dados acima devem ser substituídos pelas credenciais utilizadas no projeto.

## 👩‍💻 Equipe

Projeto desenvolvido por:

[Gabrielly Nascimento Bento]

[Maria Eduarda Monteiro Viana]

📚 Disciplina

Técnicas Avançadas de Programação Web Mobile
4º semestre
