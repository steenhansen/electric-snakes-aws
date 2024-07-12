//import * as dotenv from 'dotenv';
//import config from '../../config.json';


import {
  github_token, slack_prod_channel_id, slack_dev_channel_id, slack_workspace_id, prod_branch,
  dev_branch, prod_pipeline_tag, dev_pipeline_tag,
  domain_name, backend_subdomain, frontend_subdomain, backend_dev_subdomain, frontend_dev_subdomain
} from '../../../electric-snakes-aws.config.json';


const webConfigJSON = {
  domainName: domain_name,
  backendSubdomain: backend_subdomain,
  frontendSubdomain: frontend_subdomain,
  backendDevSubdomain: backend_dev_subdomain,
  frontendDevSubdomain: frontend_dev_subdomain,
};

// const webConfigJSON = {
//   domainName: config.domain_name,
//   backendSubdomain: config.backend_subdomain,
//   frontendSubdomain: config.frontend_subdomain,
//   backendDevSubdomain: config.backend_dev_subdomain,
//   frontendDevSubdomain: config.frontend_dev_subdomain,
// };

export const pipelineConfig = (env: string) => {
  if (env === 'Production') {
    //   const { parsed } = dotenv.config({ path: '.env.production' });

    return {
      buildCommand: 'yarn build:prod',
      deployCommand: 'yarn cdk:prod deploy', // yarn cdk deploy
      branch: prod_branch, // 'master',
      tag: prod_pipeline_tag, // 'chapter6-production-pipeline',
      githubToken: github_token, //parsed?.GITHUB_TOKEN,
      workspaceId: slack_workspace_id, //parsed?.WORKSPACE_ID,
      channelId: slack_prod_channel_id, //parsed?.CHANNEL_ID,
      ...webConfigJSON,
    };
  }

  //const { parsed } = dotenv.config({ path: '.env.development' });

  return {
    buildCommand: 'yarn build:dev',
    deployCommand: 'yarn cdk:dev deploy',
    branch: dev_branch,           //'dev',
    tag: dev_pipeline_tag, //'chapter6-development-pipeline',
    githubToken: github_token, //parsed?.GITHUB_TOKEN,
    workspaceId: slack_workspace_id, //parsed?.WORKSPACE_ID,
    channelId: slack_dev_channel_id, //parsed?.CHANNEL_ID,
    ...webConfigJSON,
  };
};
