
import { Stack } from 'aws-cdk-lib';

import stack_config from './config.json';
const STACK_NAME = stack_config.STACK_NAME;
const UNIQUE_S3_ID = stack_config.UNIQUE_S3_ID;

const DOMAIN_NAME = stack_config.DOMAIN_NAME;

const FRONTEND_SUBDOMAIN = stack_config.FRONTEND_SUBDOMAIN;
const FRONTEND_DEV_SUBDOMAIN = stack_config.FRONTEND_DEV_SUBDOMAIN;

const BACKEND_SUBDOMAIN = stack_config.BACKEND_SUBDOMAIN;
const BACKEND_DEV_SUBDOMAIN = stack_config.BACKEND_DEV_SUBDOMAIN;


const DYNAMO_TABLE = stack_config.DYNAMO_TABLE;


export function namedBackEndTestPipelineProjectEnvLabel(the_env: string) {
  const namedBackEndTestPipelineProjectEnv_label = `${STACK_NAME}-BackEndTest-PipelineProject-${the_env}`;
  return namedBackEndTestPipelineProjectEnv_label;
}

export function namedBackEndBuildPipelineProjectEnvLabel(the_env: string) {
  const namedBackEndBuildPipelineProjectEnv_label = `${STACK_NAME}-BackEndBuild-PipelineProject-${the_env}`;
  return namedBackEndBuildPipelineProjectEnv_label;
}

export function namedStackEnvLabel(the_env: string) {
  const namedStackEnv_label = `${STACK_NAME}Stack-${the_env}`;
  return namedStackEnv_label;
}

export function namedPipelineStackLabel() {
  const namedPipelineStack_label = `${STACK_NAME}PipelineStack`;
  return namedPipelineStack_label;
}


export function namedFrontEndTestPipelineProjectEnvLabel(the_env: string) {
  const namedFrontEndTestPipelineEnv_label = `${STACK_NAME}-FrontEndTest-PipelineProject-${the_env}`;
  return namedFrontEndTestPipelineEnv_label;
}




export function namedBackEndTestEnvLabel(the_env: string) {
  const namedBackEndTestEnv_label = `${STACK_NAME}-BackendTest-${the_env}`;
  return namedBackEndTestEnv_label;
}


export function namedDevelopmentPipelineLabel() {
  const namedDevelopmentPipeline_label = `${STACK_NAME}-development-pipeline`;
  return namedDevelopmentPipeline_label;
}


export function namedProductionPipelineLabel() {
  const namedProductionPipeline_label = `${STACK_NAME}-production-pipeline`;
  return namedProductionPipeline_label;
}


export function namedPipelineEnvLabel(the_env: string) {
  const namedPipelineEnv_label = `${STACK_NAME}-Pipeline-${the_env}`;
  return namedPipelineEnv_label;
}






export function namedPipelineLabel() {
  const namedPipeline_label = `${STACK_NAME}-Pipeline`;
  return namedPipeline_label;
}



export function dynamoNameEnvLabel(the_env: string) {
  const dynamoNameEnv_label = `Dynamo-Table-${the_env}`;
  return dynamoNameEnv_label;
}

export function dynamoTableEnvLabel(the_env: string) {
  const lower_env = the_env.toLowerCase();
  const dynamoTableEnv_label = `${DYNAMO_TABLE}-${lower_env}}`;
  return dynamoTableEnv_label;
}


export function dynamoInlineSeederEnvLabel(the_env: string) {
  const dynamoInlineSeederEnv_label = `Dynamo-InlineSeeder-${the_env}`;
  return dynamoInlineSeederEnv_label;
}





export function frontendDistributionEnvLabel(the_env: string) {
  const frontendDistributionEnv_label = `Frontend-Distribution-${the_env}`;
  return frontendDistributionEnv_label;
}


export function frontEndAliasRecordEnvLabel(the_env: string) {
  const frontEndAliasRecordEnv_label = `FrontendAliasRecord-${the_env}`;
  return frontEndAliasRecordEnv_label;
}

export function frontEndUrlEnvLabel(the_env: string) {
  const frontEndUrlEnv_label = `FrontendURL-${the_env}`;
  return frontEndUrlEnv_label;
}

export function mysqlInstanceIdEnvLabel(the_env: string) {
  const mysqlRdsInstanceIdEnv_label = `my-sql-instance-${the_env}`;
  return mysqlRdsInstanceIdEnv_label;
}

export function namedMysqlRdsInstanceLabel(the_env: string) {
  const instance_id = mysqlInstanceIdEnvLabel(the_env);
  const namedMysqlRdsInstance_label = `${STACK_NAME}/rds/${instance_id}`;
  return namedMysqlRdsInstance_label;
}

export function namedStreamPrefixEnvLabel(the_env: string) {
  const namedStreamPrefixEnv_label = `${STACK_NAME}-${the_env}`;
  return namedStreamPrefixEnv_label;
}

export function namedEcsLogsEnvLabel(the_env: string) {
  //  const ecsLogGroupEnv_label = `ecs-logs-${STACK_NAME}-${the_env}`;
  const namedEcsLogsEnv_label = `${STACK_NAME}-ecs-logs-${the_env}`;
  return namedEcsLogsEnv_label;
}



export function namedLoadBalancerEnvLabel(the_env: string) {
  const namedLoadBalancerEnv_label = `${STACK_NAME}-lb-${the_env}`;
  return namedLoadBalancerEnv_label;
}




export function namedWebBucketEnvLabel(the_env: string) {
  const lower_stack_name = STACK_NAME.toLocaleLowerCase();
  const lower_env = the_env.toLocaleLowerCase();
  const namedWebBucketEnv_label = `${lower_stack_name}-web-bucket-${UNIQUE_S3_ID}-${lower_env}`;
  return namedWebBucketEnv_label;
}

///////////////

export function envPipelineSlackNotTopicLabel(props_env: string) {
  const envPipelineSlackNotTopic_label = `${props_env}-Pipeline-SlackNotificationsTopic`;
  return envPipelineSlackNotTopic_label;
}


export function envPipelineSlackChannelConfLabel(props_env: string) {
  const envPipelineSlackChannelConf_label = `${props_env}-Pipeline-Slack-Channel-Config`;
  return envPipelineSlackChannelConf_label;
}



///////////////

export function idFunctionSecurityGroupLabel(id: string) {
  const idFunctionSecurityGroup_label = `${id}FunctionSecurityGroup`;
  return idFunctionSecurityGroup_label;
}

export function idResInitStackNameLabel(id: string, stackName: string) {
  const idResInitStackName_label = `${id}-ResInit${stackName}`;
  return idResInitStackName_label;
}



export function idAwsSdkCallVerHashLabel(id: string, the_version: string, payload_hash_prefix: string) {
  const idAwsSdkCallVerHash_label = `${id}-AwsSdkCall-${the_version}${payload_hash_prefix}`;
  return idAwsSdkCallVerHash_label;
}



////////////


export function rdsInitFnResponseEnvLabel(the_env: string) {
  const rdsInitFnResponseEnv_label = `RdsInitFnResponse-${the_env}`;
  return rdsInitFnResponseEnv_label;
}


export function backEndTestPipelineEnvLabel(the_env: string) {
  const backEndTestPipelineEnv_label = `BackendTest-Pipeline-${the_env}`;
  return backEndTestPipelineEnv_label;
}


export function webBucketEnvLabel(the_env: string) {
  const webBucketEnv_label = `WebBucket-${the_env}`;
  return webBucketEnv_label;
}

export function webBucketDeploymentEnvLabel(the_env: string) {
  const webBucketDeploymentEnv_label = `WebBucketDeployment-${the_env}`;
  return webBucketDeploymentEnv_label;
}



export function ecsEnvLabel(the_env: string) {
  const ecsEnv_label = `ECS-${the_env}`;
  return ecsEnv_label;
}

export function route53EnvLabel(the_env: string) {
  const route53Env_label = `Route53-${the_env}`;
  return route53Env_label;
}

export function acmEnvLabel(the_env: string) {
  const acmEnv_label = `ACM-${the_env}`;
  return acmEnv_label;
}

export function myVpcEnvLabel(the_env: string) {
  const myVpcEnv_label = `MyVPC-${the_env}`;
  return myVpcEnv_label;
}


export function s3EnvLabel(the_env: string) {
  const s3Env_label = `S3-${the_env}`;
  return s3Env_label;
}


export function rdsEnvLabel(the_env: string) {
  const rdsEnv_label = `RDS-${the_env}`;
  return rdsEnv_label;
}



export function backendTestPipelineEnvLabel(the_env: string) {
  const backendTestPipelineEnv_label = `BackendTest-Pipeline-${the_env}`;
  return backendTestPipelineEnv_label;
}



export function loadBalancerEnvLabel(the_env: string) {
  const LoadBalancerEnv_label = `LB-${the_env}`;
  return LoadBalancerEnv_label;
}


export function mysqlCredentialsEnvLabel(the_env: string) {
  const mysqlCredentialsEnv_label = `MySQLCredentials-${the_env}`;
  return mysqlCredentialsEnv_label;
}


export function mysqlRdsInstanceEnvLabel(the_env: string) {
  const mysqlRdsInstanceEnv_label = `MySQL-RDS-Instance-${the_env}`;
  return mysqlRdsInstanceEnv_label;
}




export function myRdsInitEnvLabel(the_env: string) {
  const myRdsInitEnv_label = `MyRdsInit-${the_env}`;
  return myRdsInitEnv_label;
}




export function ecsLogGroupEnvLabel(the_env: string) {
  const ecsLogGroupEnv_label = `ECSLogGroup-${the_env}`;
  return ecsLogGroupEnv_label;
}



export function defaultAutoScalingGroupEnvLabel(the_env: string) {
  const defaultAutoScalingGroupEnv_label = `DefaultAutoScalingGroup-${the_env}`;
  return defaultAutoScalingGroupEnv_label;
}




export function taskDefinitionEnvLabel(the_env: string) {
  const taskDefinitionEnv_label = `TaskDefinition-${the_env}`;
  return taskDefinitionEnv_label;
}


export function ecsClusterEnvLabel(the_env: string) {
  const ecsClusterEnv_label = `EcsCluster-${the_env}`;
  return ecsClusterEnv_label;
}

export function serviceEnvLabel(the_env: string) {
  const serviceEnv_label = `Service-${the_env}`;
  return serviceEnv_label;
}


export function expressEnvLabel(the_env: string) {
  const expressEnv_label = `Express-${the_env}`;
  return expressEnv_label;
}




export function publicListenerEnvLabel(the_env: string) {
  const publicListenerEnv_label = `PublicListener-${the_env}`;
  return publicListenerEnv_label;
}

////////////////////

export function arnLambdaRegionAccountResInitStackNameLabel(stack: Stack) {
  const arnLambdaRegionAccountResInitStackName_label = `arn:aws:lambda:${stack.region}:${stack.account}:function:*-ResInit${stack.stackName}`;
  return arnLambdaRegionAccountResInitStackName_label;
}


export function frontEndDomainName(the_env: string) {
  if (the_env === 'Production') {
    var frontEnd_domainName = `${FRONTEND_SUBDOMAIN}.${DOMAIN_NAME}`;
  } else {
    var frontEnd_domainName = `${FRONTEND_DEV_SUBDOMAIN}.${DOMAIN_NAME}`;
  }
  return frontEnd_domainName;
}

export function backEndSubDomainName(the_env: string) {
  if (the_env === 'Production') {
    var backEnd_domainName = `${BACKEND_SUBDOMAIN}.${DOMAIN_NAME}`;
  } else {
    var backEnd_domainName = `${BACKEND_DEV_SUBDOMAIN}.${DOMAIN_NAME}`;
  }
  return backEnd_domainName;
}

