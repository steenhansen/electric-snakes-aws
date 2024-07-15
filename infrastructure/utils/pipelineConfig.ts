
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

export const pipelineConfig = (env: string) => {
  if (env === 'Production') {

    return {
      buildCommand: 'yarn build:prod',
      deployCommand: 'yarn cdk:prod deploy',
      branch: prod_branch,
      tag: prod_pipeline_tag,
      githubToken: github_token,
      workspaceId: slack_workspace_id,
      channelId: slack_prod_channel_id,
      ...webConfigJSON,
    };
  }

  return {
    buildCommand: 'yarn build:dev',
    deployCommand: 'yarn cdk:dev deploy',
    branch: dev_branch,
    tag: dev_pipeline_tag,
    githubToken: github_token,
    workspaceId: slack_workspace_id,
    channelId: slack_dev_channel_id,
    ...webConfigJSON,
  };
};
