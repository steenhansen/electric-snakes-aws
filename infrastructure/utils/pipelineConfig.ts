import console = require('console');


import stack_config from '../config.json';
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
      githubToken: process.env.stack_githubToken,      /// q-bert
      workspaceId: SLACK_WORKSPACE_ID,
      channelId: SLACK_PROD_CHANNEL_ID,
    };
  }

  return {
    buildCommand: 'yarn build:dev',
    deployCommand: 'yarn cdk:dev deploy',
    branch: 'dev',
    tag: namedDevelopmentPipeline_label,
    githubToken: process.env.stack_githubToken,        /// q-bert
    workspaceId: SLACK_WORKSPACE_ID,
    channelId: SLACK_DEV_CHANNEL_ID,
  };
};
