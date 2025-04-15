import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: "sa-east-1",
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),  // Só define o endpoint se DYNAMODB_ENDPOINT não for vazio
});

export const dynamoDB = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.TABLE_NAME || 'Transactions';