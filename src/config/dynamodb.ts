import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.NODE_ENV === 'test' || !process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isLocal ? 'http://localhost:8000' : process.env.DYNAMODB_ENDPOINT || 'http://dynamodb:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
});

export const dynamoDB = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.TABLE_NAME || 'Transactions';