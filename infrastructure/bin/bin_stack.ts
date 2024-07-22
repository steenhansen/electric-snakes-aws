#!/usr/bin/env node

import stack_config from '../config.json';

const SECRET_NAME = stack_config.SECRET_NAME;
const SECRET_REGION = stack_config.SECRET_REGION;

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
const secret_name = SECRET_NAME;
const client = new SecretsManagerClient({
  region: SECRET_REGION,
});


import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { TheMainStack } from '../lib/the_main_stack';
import { ThePipelineStack } from '../lib/the_pipeline_stack';

config({ path: '.env.production' });

const THE_ENV = process.env.NODE_ENV || '';
const THE_MODE = process.env.CDK_MODE || '';

import { namedStackEnvLabel, namedPipelineStackLabel } from '../construct_labels';

const app = new cdk.App();
const stack_label = namedStackEnvLabel(THE_ENV);
const namedPipelineStack_label = namedPipelineStackLabel();

if (['ONLY_DEV'].includes(THE_MODE)) {
  new TheMainStack(app, stack_label, {
    env: {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
}

if (['ONLY_PROD'].includes(THE_MODE)) {
  new TheMainStack(app, stack_label, {
    env: {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
}

if (['ONLY_PIPELINE'].includes(THE_MODE)) {
  client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT",
    })
  ).then((aws_secret) => {
    const secret_string: any = aws_secret.SecretString;
    const split_secret: any = secret_string.split('"');
    const github_token = split_secret[3];
    process.env.stack_githubToken = github_token;
    new ThePipelineStack(app, namedPipelineStack_label, {
      env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
      },
    });
  });
}
