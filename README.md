# HelpDesk

<div align="center">

![HelpDesk](./project.png)

Sistema completo para gerenciamento de chamados de suporte técnico, com diferentes níveis de acesso para administradores, técnicos e clientes.

</div>

## Link

- **Aplicação web:** [https://web-psi-nine-llyexkb8r6.vercel.app/](https://web-psi-nine-llyexkb8r6.vercel.app/)

## Sobre o projeto

O HelpDesk permite que clientes abram chamados e acompanhem o atendimento, enquanto técnicos gerenciam os chamados atribuídos a eles. Administradores controlam técnicos, clientes, serviços e a distribuição dos chamados.

### Funcionalidades

- Autenticação com controle de acesso por perfil.
- Cadastro e gerenciamento de técnicos, clientes e serviços.
- Criação, atribuição e acompanhamento de tickets.
- Atualização do status dos chamados.
- Inclusão de serviços extras no atendimento.
- Upload e atualização de avatar.
- API REST protegida com JWT.
- Testes de integração para os principais fluxos da API.

## Perfis de acesso para teste

As credenciais abaixo são disponibilizadas exclusivamente para testar o projeto:

| Perfil        | E-mail              | Senha    |
| ------------- | ------------------- | -------- |
| Administrador | `jackson@email.com` | `123123` |
| Técnico       | `joao@email.com`    | `123123` |
| Técnico       | `marcos@email.com`  | `123123` |
| Técnico       | `arthur@email.com`  | `123123` |
| Cliente       | `ana@email.com`     | `123123` |

> Essas credenciais são contas de demonstração. Não utilize senhas reais ou dados sensíveis neste ambiente.

## Tecnologias

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Zod
- Lucide React

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Multer
- Vitest
- Docker Compose

## Estrutura do projeto

```text
.
├── api/      # API REST, autenticação e banco de dados
├── web/      # Aplicação frontend
└── project.png
```

## Requisitos

- Node.js 20 ou superior
- npm, pnpm ou yarn
- Docker e Docker Compose

## Executando localmente

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd HelpDesk
```

### 2. Configure e execute a API

```bash
cd api
npm install
```

Crie o arquivo `api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public"
JWT_SECRET="sua_chave_secreta"
PORT=3333
```

Inicie o banco PostgreSQL com Docker e execute as migrações:

```bash
docker compose up -d
npx prisma migrate dev
```

Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3333`.

### 3. Configure e execute o frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd web
npm install
```

Crie o arquivo `web/.env`:

```env
VITE_API_URL=http://localhost:3333
```

Inicie o frontend:

```bash
npm run dev
```

O Vite ficará disponível, por padrão, em `http://localhost:5173`.

## Scripts disponíveis

### API

Execute os comandos dentro da pasta `api/`:

| Comando         | Descrição                                |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Inicia a API em modo de desenvolvimento. |
| `npm run build` | Gera o build de produção da API.         |
| `npm run start` | Executa a API compilada.                 |
| `npm test`      | Executa os testes.                       |

### Frontend

Execute os comandos dentro da pasta `web/`:

| Comando           | Descrição                                     |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento.         |
| `npm run build`   | Verifica os tipos e gera o build de produção. |
| `npm run preview` | Visualiza localmente o build gerado.          |

## Deploy

### Frontend na Vercel

Configure o projeto apontando para a pasta `web/` e defina a variável de ambiente:

```env
VITE_API_URL=<URL_DA_API_NO_RENDER>
```

Comando de build:

```bash
npm run build
```

### Backend no Render

Configure o serviço apontando para a pasta `api/` e defina as variáveis de ambiente:

```env
DATABASE_URL=<URL_DO_POSTGRES>
JWT_SECRET=<SUA_CHAVE_SECRETA>
PORT=10000
```

Comando de build:

```bash
npm install && npx prisma migrate deploy && npm run build
```

Comando de inicialização:

```bash
npm run start
```

## Licença

Este projeto foi desenvolvido para fins de estudo e demonstração.
