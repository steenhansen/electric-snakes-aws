#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { TheMainStack } from '../lib/the_main_stack';
import { ThePipelineStack } from '../lib/the_pipeline_stack';

config({ path: '.env.production' });
import stack_config from '../../../electric-snakes-aws.config.json';

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
  new ThePipelineStack(app, namedPipelineStack_label, {
    env: {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
}
