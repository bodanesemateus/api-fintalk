# Transactions API

A **Transactions API** é uma aplicação Node.js que fornece endpoints para gerenciar transações financeiras, armazenadas em uma tabela DynamoDB. A API permite registrar transações, listar transações por usuário e calcular o saldo mensal de um usuário. Ela foi desenvolvida com TypeScript, Express, e AWS SDK, e utiliza Docker para ambiente local com DynamoDB Local.

## Funcionalidades

- **POST /api/transactions**: Registra uma nova transação com `userId`, `amount`, e `description`.
- **GET /api/transactions/:userId**: Lista as transações de um usuário, com suporte a paginação.
- **GET /api/balance/:userId?month=YYYY-MM**: Calcula o saldo de um usuário para um mês específico.

## Usando a API

### Endpoints

#### Registrar uma Transação

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","amount":100,"description":"Pagamento"}'
```

**Resposta esperada:**

```json
{
  "id": "<uuid>",
  "userId": "123",
  "amount": 100,
  "description": "Pagamento",
  "createdAt": "<timestamp>"
}
```

#### Listar Transações

```bash
curl http://localhost:3000/api/transactions/123
```

**Resposta esperada:**

```json
{
  "items": [
    {
      "id": "<uuid>",
      "userId": "123",
      "amount": 100,
      "description": "Pagamento",
      "createdAt": "<timestamp>"
    }
    // ... mais transações
  ],
  "lastEvaluatedKey": null // ou a chave para paginação
}
```

#### Consultar Saldo Mensal

```bash
curl http://localhost:3000/api/balance/123?month=2025-04
```

**Resposta esperada:**

```json
{
  "userId": "123",
  "month": "2025-04",
  "balance": 100 // Saldo calculado para o mês
}
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [AWS CLI](https://aws.amazon.com/cli/) (opcional, para debug do DynamoDB Local)

### Executando com Docker Compose

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-diretorio>
    ```

2.  **Construa e suba os containers:**
    ```bash
    docker-compose up --build
    ```
    Este comando irá construir a imagem Docker para a API (se ainda não existir) e iniciar os containers da API e do DynamoDB local. A API estará acessível em `http://localhost:3000`.

### Executando em Desenvolvimento (sem Docker)

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Este comando usa `nodemon` para reiniciar o servidor automaticamente a cada alteração no código fonte.

### Executando Testes

```bash
npm test
```

## Estrutura de Pastas

```
.
├── dist/                  # Arquivos JavaScript transpilados (gerados pelo build)
├── node_modules/          # Dependências do Node.js
├── src/                   # Código fonte da aplicação
│   ├── __tests__/         # Testes unitários e de integração
│   ├── config/            # Arquivos de configuração (ex: conexão com DB)
│   │   └── dynamodb.ts    # Configuração do cliente DynamoDB
│   ├── routes/            # Definições das rotas da API
│   ├── scripts/           # Scripts auxiliares (ex: inicialização do DB)
│   └── index.ts           # Ponto de entrada da aplicação
├── .gitignore             # Arquivos e pastas ignorados pelo Git
├── Dockerfile             # Define a imagem Docker para a API
├── docker-compose.yml     # Define os serviços Docker (API e DynamoDB)
├── jest.config.js         # Configuração do Jest (framework de testes)
├── package-lock.json      # Lockfile das dependências npm
├── package.json           # Metadados e dependências do projeto
├── README.md              # Documentação do projeto
└── tsconfig.json          # Configuração do compilador TypeScript
```

-   **`dist/`**: Contém o código JavaScript gerado após a transpilação do TypeScript (`npm run build`). É o código que é efetivamente executado em produção.
-   **`node_modules/`**: Diretório padrão do npm onde as dependências do projeto são instaladas.
-   **`src/`**: O coração da aplicação, contendo todo o código fonte em TypeScript.
    -   **`__tests__/`**: Contém os arquivos de teste. A estrutura de pastas dentro de `__tests__` geralmente espelha a estrutura de `src` para facilitar a organização.
    -   **`config/`**: Armazena configurações da aplicação, como detalhes de conexão com banco de dados ou chaves de API.
    -   **`routes/`**: Define os endpoints da API e associa os handlers (controladores) a eles.
    -   **`scripts/`**: Pode conter scripts utilitários, como scripts para popular o banco de dados ou realizar tarefas de manutenção.
    -   **`index.ts`**: O ponto de entrada da aplicação, onde o servidor Express é configurado e iniciado.
-   **`Dockerfile`**: Instruções para construir a imagem Docker da aplicação Node.js.
-   **`docker-compose.yml`**: Orquestra a execução dos containers da aplicação e do banco de dados DynamoDB local.
-   **`package.json`**: Define os metadados do projeto, scripts (`npm start`, `npm run build`, `npm run dev`, `npm test`) e dependências.
-   **`tsconfig.json`**: Arquivo de configuração do compilador TypeScript.
