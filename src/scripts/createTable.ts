import { CreateTableCommand, DeleteTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDB, TABLE_NAME } from '../config/dynamodb';

export const setupDynamoDB = async () => {
  try {
    const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
    await dynamoDB.send(describeCommand);
    console.log(`Table ${TABLE_NAME} already exists`);
  } catch (error) {
    if ((error as any).name === 'ResourceNotFoundException') {
      console.log(`Creating table ${TABLE_NAME}`);
      await dynamoDB.send(
        new CreateTableCommand({
          TableName: TABLE_NAME,
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
          ],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'UserIdIndex',
              KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        })
      );
      console.log('Table created successfully');
    } else {
      console.error('Error managing table:', error);
      throw error;
    }
  }
};

export const teardownDynamoDB = async () => {
  try {
    await dynamoDB.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    console.log('Table deleted successfully');
  } catch (error) {
    console.error('Error deleting table:', error);
  }
};

if (require.main === module) {
  setupDynamoDB()
    .then(() => console.log('DynamoDB setup complete'))
    .catch(err => console.error('Setup failed:', err));
}