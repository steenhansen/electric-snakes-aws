import * as dotenv from 'dotenv';

import stack_config from '../../../electric-snakes-aws.config.json';
const GITHUB_TOKEN = stack_config.GITHUB_TOKEN;
const SLACK_PROD_CHANNEL_ID = stack_config.SLACK_PROD_CHANNEL_ID;
const SLACK_DEV_CHANNEL_ID = stack_config.SLACK_DEV_CHANNEL_ID;
const SLACK_WORKSPACE_ID = stack_config.SLACK_WORKSPACE_ID;

import { namedDevelopmentPipelineLabel, namedProductionPipelineLabel } from '../construct_labels';
const namedDevelopmentPipeline_label = namedDevelopmentPipelineLabel();
const namedProductionPipeline_label = namedProductionPipelineLabel();

export const pipelineConfig = (env: string) => {
  if (env === 'Production') {

    return {
      buildCommand: 'yarn build:prod',
      deployCommand: 'yarn cdk deploy',
      branch: 'main',
      tag: namedProductionPipeline_label,
      githubToken: GITHUB_TOKEN,
      workspaceId: SLACK_WORKSPACE_ID,
      channelId: SLACK_PROD_CHANNEL_ID,
    };
  }

  return {
    buildCommand: 'yarn build:dev',
    deployCommand: 'yarn cdk:dev deploy',
    branch: 'dev',
    tag: namedDevelopmentPipeline_label,
    githubToken: GITHUB_TOKEN,
    workspaceId: SLACK_WORKSPACE_ID,
    channelId: SLACK_DEV_CHANNEL_ID,
  };
};
