import { CreateTableCommand, DeleteTableCommand, DescribeTableCommand, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDB, TABLE_NAME } from '../config/dynamodb';

export const setupDynamoDB = async () => {
  const tableName = TABLE_NAME;

  try {
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    const table = await dynamoDB.send(describeCommand);
    console.log(`Table ${tableName} exists`);
  } catch (error) {
    if ((error as any).name === 'ResourceNotFoundException') {
      console.log(`Creating table ${tableName}`);
      await dynamoDB.send(
        new CreateTableCommand({
          TableName: tableName,
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
      console.log('Test table created');
    } else {
      console.error('Error managing test table:', error);
      throw error;
    }
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
  // Executar no ambiente local
  setupDynamoDB();
  
  // Executar no ambiente Docker
  if (process.env.DYNAMODB_ENDPOINT !== 'http://dynamodb:8000') {
    console.log('Criando tabela no ambiente Docker...');
    const originalEndpoint = process.env.DYNAMODB_ENDPOINT;
    
    // Temporariamente configurar para o endpoint do Docker
    process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
    
    // Criar um novo cliente específico para o Docker
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    
    const dockerClient = new DynamoDBClient({
      region: "us-east-1",
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local'
      }
    });
    
    const dockerDynamoDB = DynamoDBDocumentClient.from(dockerClient);
    
    // Função para criar tabela no Docker
    const setupDockerDynamoDB = async () => {
      try {
        const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
        try {
          await dockerDynamoDB.send(describeCommand);
          console.log(`Table ${TABLE_NAME} already exists in Docker environment`);
        } catch (err) {
          if ((err as any).name === 'ResourceNotFoundException') {
            console.log(`Creating table ${TABLE_NAME} in Docker environment`);
            await dockerDynamoDB.send(
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
            console.log('Table created in Docker environment');
          } else {
            console.error('Error checking Docker table:', err);
          }
        }
      } catch (error) {
        console.error('Error setting up Docker DynamoDB:', error);
      }
    };
    
    setupDockerDynamoDB().then(() => {
      // Restaurar configuração original
      process.env.DYNAMODB_ENDPOINT = originalEndpoint;
      console.log('Docker setup complete');
    });
  }
}