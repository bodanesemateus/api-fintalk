import { CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDB, TABLE_NAME } from '../config/dynamodb';

export const setupDynamoDB = async () => {
  try {
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
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
    );
    console.log('Test table created');
  } catch (error) {
    console.error('Error creating test table:', error);
  }
};

export const teardownDynamoDB = async () => {
  try {
    await dynamoDB.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    console.log('Test table deleted');
  } catch (error) {
    console.error('Error deleting test table:', error);
  }
};

if (require.main === module) {
  setupDynamoDB();
}