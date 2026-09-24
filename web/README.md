# HelpDesk Web

Aplicação web para gerenciamento de chamados de suporte técnico. O sistema possui acesso baseado no perfil do usuário e se integra a uma API REST para autenticação, consulta e atualização dos dados.

## Funcionalidades

### Administrador

- Visualizar e consultar chamados.
- Acessar os detalhes de um chamado e atribuir um técnico.
- Cadastrar, editar e excluir técnicos.
- Editar e excluir clientes.
- Gerenciar serviços.

### Cliente

- Criar novos chamados.
- Visualizar seus chamados.
- Acompanhar os detalhes e o status dos chamados.

### Técnico

- Visualizar os chamados atribuídos.
- Acompanhar os detalhes e atualizar o andamento do atendimento.

Todos os perfis também podem acessar e editar as informações do próprio perfil, quando disponíveis.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Zod
- Lucide React

## Pré-requisitos

- Node.js 20 ou superior.
- npm, pnpm ou yarn.
- Uma instância da API do HelpDesk em execução.

## Instalação

Clone o repositório e acesse a pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd web
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto e informe a URL da API:

```env
VITE_API_URL=http://localhost:3333
```

Substitua o valor pela URL correspondente à sua API. A variável é utilizada como base para as requisições feitas pelo frontend.

## Executando o projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em `http://localhost:5173`.

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar localmente o build gerado:

```bash
npm run preview
```

## Scripts disponíveis

| Comando           | Descrição                                                    |
| ----------------- | ------------------------------------------------------------ |
| `npm run dev`     | Inicia o servidor de desenvolvimento.                        |
| `npm run build`   | Executa a verificação TypeScript e gera o build de produção. |
| `npm run preview` | Serve localmente o build de produção.                        |

## Autenticação

Após o login, o token e os dados do usuário são armazenados no `localStorage` com a chave `@helpdesk`. O token é enviado nas requisições à API usando o cabeçalho `Authorization: Bearer <token>`.

O conteúdo exibido e as rotas disponíveis são definidos de acordo com o perfil retornado pela API:

- `admin`
- `cliente`
- `tecnico`

## Estrutura do projeto

```text
src/
├── components/  # Componentes reutilizáveis da interface
├── config/      # Configurações da aplicação
├── contexts/    # Contextos globais, como autenticação
├── hooks/       # Hooks customizados
├── layout/      # Layouts de autenticação e dashboard
├── pages/       # Páginas separadas por perfil de acesso
├── routes/      # Rotas protegidas e rotas de autenticação
├── services/    # Comunicação com a API
├── types/       # Tipos compartilhados
└── utils/       # Funções utilitárias
```

## Integração com a API

O frontend espera que a API forneça os endpoints consumidos pelos serviços em `src/services`, incluindo autenticação, usuários, clientes, técnicos, serviços e chamados. A URL base deve ser configurada em `VITE_API_URL` antes de iniciar a aplicação.

## Deploy

O projeto pode ser publicado em serviços compatíveis com aplicações Vite, como a Vercel. Configure a variável de ambiente `VITE_API_URL` no ambiente de produção e use o comando `npm run build` como etapa de build.
