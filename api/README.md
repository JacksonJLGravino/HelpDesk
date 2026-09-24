# HelpDesk API

API REST desenvolvida para gerenciar um sistema de help desk, com autenticação, cadastro de usuários, serviços, técnicos e tickets de suporte.

## Visão geral

Este projeto foi pensado para atender um fluxo real de atendimento técnico, com diferentes perfis de acesso:

- Cliente: cria tickets e acompanha seu status.
- Técnico: atende tickets atribuídos e adiciona serviços/atualiza status.
- Admin: gerencia técnicos e serviços, além de atribuir profissionais aos chamados.

A API utiliza Node.js + TypeScript + Express + Prisma + PostgreSQL, com autenticação via JWT e controle de permissões por perfil.

## Funcionalidades

### Autenticação e autorização

- Cadastro de usuários
- Login com email e senha
- Geração de token JWT
- Proteção de rotas autenticadas
- Controle de acesso por role:
  - admin
  - tecnico
  - cliente

### Gestão de usuários

- Criação de usuário comum
- Atualização de dados pessoais
- Troca de senha com validação da senha atual
- Exclusão da própria conta

### Gestão de clientes

- Listagem de clientes
- Atualização de dados do cliente
- Exclusão de cliente

### Gestão de técnicos

- Cadastro de técnicos com disponibilidade de horário
- Listagem de técnicos
- Atualização de dados e agenda
- Consulta detalhada de um técnico

### Gestão de serviços

- Cadastro de serviços
- Listagem de serviços
- Atualização de preço, nome e status
- Controle de serviços ativos/inativos

### Gestão de tickets

- Criação de ticket pelo cliente
- Atribuição de técnico por um administrador
- Listagem de tickets por perfil
- Visualização detalhada de um ticket
- Atualização de status do chamado
- Inclusão de serviços extras no atendimento
- Controle do valor final do atendimento

### Upload de avatar

- Upload de imagem para o usuário
- Armazenamento local em pasta pública
- Exposição da pasta de uploads para acesso direto

## Stack tecnológica

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

```bash
src/
├── controllers/
├── database/
├── middlewares/
├── provider/
├── routes/
├── utils/
├── app.ts
├── env.ts
├── server.ts
prisma/
├── schema.prisma
├── migrations/

docker-compose.yml
package.json
README.md
```

## Requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js 20+
- npm ou yarn
- Docker e Docker Compose
- PostgreSQL (opcional, pois o projeto pode ser executado via container)

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3333
```

> O projeto usa o Prisma com PostgreSQL. O container do Docker já prepara a base local com as credenciais acima.

## Executando com Docker

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe o banco PostgreSQL na porta `5432`.

## Instalação

```bash
npm install
```

## Banco de dados

Após configurar a variável `DATABASE_URL`, execute as migrações:

```bash
npx prisma migrate dev
```

Se quiser visualizar o banco no Prisma Studio:

```bash
npx prisma studio
```

## Rodando a aplicação

Modo desenvolvimento:

```bash
npm run dev
```

Build da aplicação:

```bash
npm run build
```

Executando em produção:

```bash
npm run start
```

## Testes

```bash
npm test
```

A aplicação possui testes de integração para fluxos principais da API.

## Principais rotas

### Autenticação

- `POST /sessions` - login do usuário

### Usuários

- `POST /users` - cadastro de usuário
- `PATCH /users` - atualização do próprio usuário
- `DELETE /users` - exclusão do usuário autenticado

### Serviços

- `POST /services` - criação de serviço
- `GET /services` - listagem de serviços
- `GET /services/available` - lista somente serviços ativos
- `PATCH /services/:id` - atualização do serviço

### Técnicos

- `POST /technicians` - cadastro de técnico
- `GET /technicians` - listagem de técnicos
- `GET /technicians/:id` - detalhe do técnico
- `PATCH /technicians/:id` - atualização do técnico

### Clientes

- `GET /clients` - listagem de clientes
- `PATCH /clients/:id` - atualização do cliente
- `DELETE /clients/:id` - remoção do cliente

### Tickets

- `POST /tickets` - criação de ticket
- `GET /tickets` - listagem por usuário
- `GET /tickets/:ticketId` - detalhe do ticket
- `PATCH /tickets/:ticketId` - atualização de status e serviços
- `PATCH /tickets/:ticketId/:technicianId` - atribuição de técnico por admin
- `DELETE /tickets/:ticketId/:ticketServiceId` - exclusão de serviço adicionado ao ticket

### Avatar

- `POST /avatar` - upload de imagem de perfil

## Fluxo de negócio principal

1. O cliente realiza cadastro e login.
2. O cliente cria um ticket informando o serviço desejado.
3. O admin atribui um técnico ao chamado.
4. O técnico acompanha e atualiza o status do atendimento.
5. O técnico pode adicionar serviços extras ao ticket.
6. O cliente visualiza o ticket e o histórico do atendimento.

## Observações

- Todas as rotas sensíveis exigem autenticação via JWT.
- As permissões são verificadas por middleware, com controle por role.
- O projeto foi estruturado para seguir um padrão de API REST com separação clara entre controllers, routes e middlewares.

## Autor

Jackson Gravino

---

Se quiser, posso também preparar uma versão mais elegante para GitHub com:

- badges
- screenshot do fluxo de trabalho
- seção de endpoints em formato OpenAPI/Swagger
- um README com foco em apresentação profissional para portfolio
- um arquivo `.env.example` para o projeto
