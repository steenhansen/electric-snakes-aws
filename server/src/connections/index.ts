import mysql, { Pool } from 'mysql';
import dotenv from 'dotenv';
import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import stack_config from '../config.json';
const SECRET_REGION = stack_config.SECRET_REGION;

dotenv.config();

const STACK_NAME = stack_config.STACK_NAME;
const THE_ENV = process.env.NODE_ENV || '';

let pool: Pool;

const secrets = new SecretsManagerClient({
  region: SECRET_REGION,
});

const getSecretValue = async (secretId: string) => {
  const params: GetSecretValueCommandInput = {
    SecretId: secretId,
  };

  const command = new GetSecretValueCommand(params);

  const { SecretString } = await secrets.send(command);

  if (!SecretString) throw new Error('SecretString is empty');

  return JSON.parse(SecretString);
};

export function namedRdsMysqlPassUserHostEnvLabel(the_env: string) {
  const namedRdsMysqlPassUserHostEnv_label = `${STACK_NAME}/rds/my-sql-instance-${the_env}`;
  return namedRdsMysqlPassUserHostEnv_label;
}

const namedRdsMysqlPassUserHostEnv_label = namedRdsMysqlPassUserHostEnvLabel(THE_ENV);
export const init = () => {
  //  getSecretValue(`${STACK_NAME}/rds/my-sql-instance-${THE_ENV}`);  // q-bert
  getSecretValue(namedRdsMysqlPassUserHostEnv_label)  // q-bert
    .then(({ password, username, host }) => {
      pool = mysql.createPool({
        host: process.env.RDS_HOST || host,
        user: username,
        password,
        multipleStatements: true,
        port: 3306,
        database: 'todolist',
      });

      return pool;
    })
    .catch(error => {
      console.log(error);

      return 0;
    });
};

export const execute = <T>(
  query: string,
  params: string[] | Record<string, unknown>,
): Promise<T> => {
  try {
    if (!pool)
      throw new Error(
        'Pool was not created. Ensure pool is created when running the app.',
      );

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          console.log(error);
          reject(process.exit(1));
        } else resolve(results);
      });
    });
  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
};
