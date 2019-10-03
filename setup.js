const {resolve} = require('path');
const cwd = require('cwd');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DynamoDbLocal = require('dynamodb-local');

const DEFAULT_PORT = 8000;

module.exports = async function() {
  const config = require(resolve(cwd(), 'jest-dynamodb-config.js'));
  const {tables, port: port = DEFAULT_PORT} =
    typeof config === 'function' ? await config() : config;
  const dynamoDB = new DynamoDB({
    endpoint: 'localhost:' + port,
    sslEnabled: false,
    region: 'local-env',
    accessKeyId: 'access-key',
    secretAccessKey: 'secret-key'
  });
  global.__DYNAMODB__ = await DynamoDbLocal.launch(port, null, ['-sharedDb']);

  await createTables(dynamoDB, tables);
};

async function createTables(dynamoDB, tables) {
  return Promise.all(tables.map(table => dynamoDB.createTable(table).promise()));
}
