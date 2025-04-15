import request from 'supertest';
import express from 'express';
import transactionsRouter from '../routes/transactions';
import { setupDynamoDB, teardownDynamoDB } from '../scripts/createTable';
import { dynamoDB, TABLE_NAME } from '../config/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());
app.use('/api', transactionsRouter);

describe('Transactions API', () => {
  beforeAll(async () => {
    await setupDynamoDB();
  });

  beforeEach(async () => {
    // Limpar a tabela antes de cada teste
    try {
      await dynamoDB.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    } catch (error) {
      // Ignorar se a tabela não existir
    }
    await setupDynamoDB();
  });

  afterAll(async () => {
    // Comente ou remova a linha abaixo para não deletar a tabela após os testes
    // await teardownDynamoDB();
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction successfully', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          userId: '123',
          amount: 100,
          description: 'Pagamento',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe('123');
      expect(response.body.amount).toBe(100);
      expect(response.body.description).toBe('Pagamento');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should fail if amount is zero', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          userId: '123',
          amount: 0,
          description: 'Pagamento',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount cannot be zero');
    });

    it('should fail if description is missing', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          userId: '123',
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Description is required');
    });
  });

  describe('GET /api/transactions/:userId', () => {
    beforeEach(async () => {
      await dynamoDB.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: uuidv4(),
            userId: '123',
            amount: 100,
            description: 'Pagamento',
            createdAt: new Date().toISOString(),
          },
        })
      );
    });

    it('should list transactions for a user', async () => {
      const response = await request(app).get('/api/transactions/123');

      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toHaveProperty('userId', '123');
      expect(response.body.items[0]).toHaveProperty('amount', 100);
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/transactions/123?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body).toHaveProperty('lastEvaluatedKey');
    });
  });

  describe('GET /api/balance/:userId', () => {
    beforeEach(async () => {
      await dynamoDB.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: uuidv4(),
            userId: '123',
            amount: 100,
            description: 'Pagamento',
            createdAt: '2025-04-01T00:00:00Z',
          },
        })
      );
      await dynamoDB.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: uuidv4(),
            userId: '123',
            amount: -50,
            description: 'Saque',
            createdAt: '2025-04-02T00:00:00Z',
          },
        })
      );
    });

    it('should calculate balance for a month', async () => {
      const response = await request(app).get('/api/balance/123?month=2025-04');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance', 50); // 100 - 50
      expect(response.body.userId).toBe('123');
      expect(response.body.month).toBe('2025-04');
    });

    it('should fail if month format is invalid', async () => {
      const response = await request(app).get('/api/balance/123?month=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid month format (use YYYY-MM)');
    });
  });
});