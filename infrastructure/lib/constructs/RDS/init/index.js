const mysql = require('mysql');


//  https://aws.amazon.com/blogs/compute/node-js-18-x-runtime-now-available-in-aws-lambda/

//  ERROR The runtime parameter of nodejs14.x is no longer supported for creating or updating AWS Lambda functions
// XXX const AWS = require('aws-sdk');


// q-bert

import {
  SecretsManager
} from "@aws-sdk/client-secrets-manager";

const fs = require('fs');
const path = require('path');

// XXX const secrets = new AWS.SecretsManager({});
const secrets = new SecretsManager({});

function query(connection, sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, res) => {
      if (error) return reject(error);

      return resolve(res);
    });
  });
}

function getSecretValue(secretId) {
  return new Promise((resolve, reject) => {
    secrets.getSecretValue({ SecretId: secretId }, (err, data) => {
      if (err) return reject(err);

      return resolve(JSON.parse(data.SecretString));
    });
  });
}

exports.handler = async e => {
  try {
    const { config } = e.params;
    const { password, username, host } = await getSecretValue(
      config.credentials_secret_name,
    );
    const connection = mysql.createConnection({
      host,
      user: username,
      password,
      multipleStatements: true,
    });

    connection.connect();

    const sqlScript = fs
      .readFileSync(path.join(__dirname, 'script.sql'))
      .toString();
    const res = await query(connection, sqlScript);

    return {
      status: 'OK',
      results: res,
    };
  } catch (err) {
    return {
      status: 'ERROR',
      err,
      message: err.message,
    };
  }
};
