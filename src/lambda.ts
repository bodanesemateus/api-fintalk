import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import express from 'express';
import serverless from 'serverless-http';
import transactionsRouter from './routes/transactions';

const app = express();
app.use(express.json());
app.use('/api', transactionsRouter);

export const handler = serverless(app);