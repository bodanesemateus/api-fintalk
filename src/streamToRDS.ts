import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';
import mysql from 'mysql2/promise';

const connectionConfig = {
  host: process.env.RDS_HOST!,
  user: process.env.RDS_USER!,
  password: process.env.RDS_PASSWORD!,
  database: process.env.RDS_DATABASE!,
};

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  const connection = await mysql.createConnection(connectionConfig);

  try {
    for (const record of event.Records) {
      if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
        const newImage = record.dynamodb.NewImage;
        const transaction = {
          id: newImage.id.S,
          userId: newImage.userId.S,
          amount: parseFloat(newImage.amount.N!),
          description: newImage.description.S,
          createdAt: newImage.createdAt.S,
        };

        await connection.execute(
          'INSERT INTO transactions (id, user_id, amount, description, created_at) VALUES (?, ?, ?, ?, ?)',
          [
            transaction.id,
            transaction.userId,
            transaction.amount,
            transaction.description,
            transaction.createdAt,
          ]
        );
        console.log('Inserted transaction into RDS:', transaction);
      }
    }
  } catch (error) {
    console.error('Error inserting into RDS:', error);
    throw error;
  } finally {
    await connection.end();
  }
};