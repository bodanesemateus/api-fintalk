# API de Transações

## Visão Geral

A **API de Transações** é uma aplicação Node.js que fornece endpoints para gerenciar transações financeiras armazenadas no Amazon DynamoDB. A API permite aos usuários registrar transações, listar transações por usuário e calcular saldos mensais. Construída com TypeScript, Express e AWS SDK, oferece uma solução abrangente para gerenciamento de transações com integração em nuvem.

## Funcionalidades

- **Gerenciamento de Transações**: Criar, recuperar e analisar transações financeiras
- **Filtragem por Usuário**: Acessar transações de usuários específicos
- **Cálculo de Saldo Mensal**: Calcular saldo para um mês específico
- **Integração com AWS**: Implantado como funções Lambda com API Gateway
- **Streaming de Dados**: Replicação automática de dados de transações do DynamoDB para o RDS MySQL

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   API       │     │   DynamoDB  │     │    RDS      │
│  Gateway    │────►│ Transactions│────►│   MySQL     │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │
       │                   │
┌─────────────┐     ┌─────────────┐
│   Lambda    │     │   Lambda    │
│ Transaction │     │ StreamToRDS │
│     API     │     │             │
└─────────────┘     └─────────────┘
```

## Endpoints da API

### Registrar uma Transação

```
POST /api/transactions
```

**Corpo da Requisição:**
```json
{
  "userId": "123",
  "amount": 100,
  "description": "Pagamento"
}
```

**Exemplo de Uso:**
```bash
curl -X POST https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","amount":100,"description":"Pagamento"}'
```

**Resposta:**
```json
{
  "id": "valor-uuid",
  "userId": "123",
  "amount": 100,
  "description": "Pagamento",
  "createdAt": "valor-timestamp"
}
```

### Listar Transações do Usuário

```
GET /api/transactions/:userId
```

**Exemplo de Uso:**
```bash
curl https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/transactions/123
```

**Resposta:**
```json
{
  "items": [
    {
      "id": "valor-uuid",
      "userId": "123",
      "amount": 100,
      "description": "Pagamento",
      "createdAt": "valor-timestamp"
    }
    // Transações adicionais se disponíveis
  ],
  "lastEvaluatedKey": null
}
```

### Obter Saldo Mensal

```
GET /api/balance/:userId?month=YYYY-MM
```

**Exemplo de Uso:**
```bash
curl https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/balance/123?month=2025-04
```

**Resposta:**
```json
{
  "userId": "123",
  "month": "2025-04",
  "balance": 100
}
```

## Configuração de Desenvolvimento

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [AWS CLI](https://aws.amazon.com/cli/) (opcional, para depuração do DynamoDB Local)
- [Terraform](https://www.terraform.io/) (para implantação da infraestrutura)
- Credenciais AWS configuradas

### Configuração das Credenciais AWS

```bash
# Opção 1: Configuração interativa
aws configure
# Forneça seu Access Key ID, Secret Access Key e região (ex.: sa-east-1)

# Opção 2: Variáveis de ambiente
export AWS_ACCESS_KEY_ID="sua-access-key"
export AWS_SECRET_ACCESS_KEY="sua-secret-key"
export AWS_DEFAULT_REGION="sa-east-1"
```

### Executando Localmente

#### Usando Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd <diretorio-do-repositorio>

# Construa e inicie os containers
docker-compose up --build
```

Isso iniciará a API em http://localhost:3000 e uma instância local do DynamoDB.

#### Configuração Manual

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Testes

```bash
# Execute todos os testes
npm test
```

## Implantação em Produção

A API está implantada na AWS usando Lambda, API Gateway, DynamoDB e RDS.

### URL da API em Produção

A API de produção está disponível em:
```
https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api
```

### Testando a API em Produção

```bash
# Registrar uma transação
curl -X POST https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","amount":100,"description":"Pagamento"}'

# Listar transações de um usuário
curl -X GET https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/transactions/123

# Consultar saldo mensal
curl -X GET https://gazoclfxr8.execute-api.sa-east-1.amazonaws.com/prod/api/balance/123?month=2025-04
```

## Streaming de DynamoDB para RDS

O sistema replica automaticamente os dados de transações do DynamoDB para um banco de dados MySQL RDS usando DynamoDB Streams e uma função Lambda.

### Processo de Streaming

1. Novas transações são salvas no DynamoDB
2. DynamoDB Streams captura as alterações
3. A Lambda `StreamToRDS` processa os eventos do stream
4. A função Lambda insere os dados no banco de dados MySQL RDS

### Monitorando o Processo de Streaming

```bash
# Visualizar os logs da Lambda StreamToRDS
aws logs tail /aws/lambda/StreamToRDS --region sa-east-1
```

## Estrutura do Projeto

```
.
├── dist/                  # Arquivos JavaScript compilados
├── node_modules/          # Dependências
├── src/                   # Código-fonte
│   ├── __tests__/         # Arquivos de teste
│   ├── config/            # Arquivos de configuração
│   │   └── dynamodb.ts    # Configuração do cliente DynamoDB
│   ├── routes/            # Rotas da API
│   ├── scripts/           # Scripts utilitários
│   ├── index.ts           # Ponto de entrada do servidor Express
│   ├── lambda.ts          # Handler AWS Lambda
│   └── streamToRDS.ts     # Lambda de streaming DynamoDB para RDS
├── terraform/             # Infraestrutura como Código
├── .gitignore             # Arquivo Git ignore
├── Dockerfile             # Definição da imagem Docker
├── docker-compose.yml     # Configuração de serviços Docker
├── jest.config.js         # Configuração de testes
├── package.json           # Metadados e dependências do projeto
├── tsconfig.json          # Configuração TypeScript
└── README.md              # Documentação do projeto
```

## Gerenciamento de Infraestrutura

A infraestrutura AWS é provisionada usando Terraform. Para implantar ou atualizar:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```