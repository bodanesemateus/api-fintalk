import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLE_NAME } from '../config/dynamodb';

// Definindo um tipo Either manualmente
type Either<L, R> = { _tag: 'Left'; left: L } | { _tag: 'Right'; right: R };

const router = Router();

// Função para validar transação (paradigma funcional)
const validateTransaction = (amount: number, description: string): Either<string, null> => {
  if (amount === 0) return { _tag: 'Left', left: 'Amount cannot be zero' };
  if (!description) return { _tag: 'Left', left: 'Description is required' };
  return { _tag: 'Right', right: null };
};

// Endpoint 1: Registrar uma transação
router.post('/transactions', async (req: Request, res: Response) => {
  const { userId, amount, description } = req.body;
  console.log('userId', userId);
  console.log('amount', amount);
  console.log('description', description);
  const validation = validateTransaction(amount, description);
  if (validation._tag === 'Left') {
    return res.status(400).json({ error: validation.left });
  }
  
  const transaction = {
    id: uuidv4(),
    userId,
    amount,
    description,
    createdAt: new Date().toISOString(),
  };
  console.log('transaction', transaction);
  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: transaction,
      })
    );
    console.log('transaction saved');
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

// Endpoint 2: Listar transações de um usuário
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { limit = 10, lastEvaluatedKey } = req.query;

  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        Limit: Number(limit),
        ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey as string) : undefined,
      })
    );

    res.json({
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Endpoint 3: Consultar saldo no mês de referência
router.get('/balance/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { month } = req.query; // Formato: YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
    return res.status(400).json({ error: 'Invalid month format (use YYYY-MM)' });
  }

  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'begins_with(createdAt, :month)',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':month': month,
        },
      })
    );

    const balance = (result.Items || []).reduce((sum, item) => sum + item.amount, 0);
    res.json({ userId, month, balance });
  } catch (error) {
    console.error('Error calculating balance:', error);
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

export default router;