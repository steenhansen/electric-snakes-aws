import * as custom from 'aws-cdk-lib/custom-resources';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { createHash } from 'crypto';


import { idFunctionSecurityGroupLabel, idResInitStackNameLabel, arnLambdaRegionAccountResInitStackNameLabel, idAwsSdkCallVerHashLabel } from '../../../../construct_labels';

import stack_config from '../../../../config.json';

const SECRET_REGION = stack_config.SECRET_REGION;

export interface CDKResourceInitializerProps {
  config: { credentials_secret_name: string; };
  function_code: lambda.DockerImageCode;
  function_log_retention: RetentionDays;
  function_security_groups: ec2.ISecurityGroup[];
  function_timeout: Duration;
  function_memory_size?: number;
  subnets_selection: ec2.SubnetSelection;
  vpc: ec2.IVpc;
}

export class CDKResourceInitializer extends Construct {
  public readonly custom_resource: custom.AwsCustomResource;

  public readonly response: string;

  public readonly function: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    props: CDKResourceInitializerProps,
  ) {
    super(scope, id);


    const stack = Stack.of(this);
    ///console.log("888999 stack.region", stack.region, "==", SECRET_REGION);
    const idFunctionSecurityGroup_label = idFunctionSecurityGroupLabel(id);
    const idResInitStackName_label = idResInitStackNameLabel(id, stack.stackName);
    const arnLambdaRegionAccountResInitStackName_label = arnLambdaRegionAccountResInitStackNameLabel(stack);

    const function_security_group = new ec2.SecurityGroup(
      scope,
      'Function-SecurityGroup',
      {
        securityGroupName: idFunctionSecurityGroup_label,
        vpc: props.vpc,
        allowAllOutbound: true,
      },
    );

    this.function = new lambda.DockerImageFunction(scope, 'Function', {
      //   allowAllOutbound: true,
      code: props.function_code,
      functionName: idResInitStackName_label,
      logRetention: props.function_log_retention,
      memorySize: props.function_memory_size || 128,
      securityGroups: [
        function_security_group,
        ...props.function_security_groups,
      ],
      timeout: props.function_timeout,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets(props.subnets_selection),
    });

    const payload: string = JSON.stringify({
      params: {
        config: props.config,
      },
    });

    const payloadHashPrefix = createHash('md5')
      .update(payload)
      .digest('hex')
      .substring(0, 6);

    const idAwsSdkCallVerHash_label = idAwsSdkCallVerHashLabel(id, this.function.currentVersion.version, payloadHashPrefix);

    const sdkCall: custom.AwsSdkCall = {
      service: 'Lambda',
      action: 'invoke',
      parameters: {
        FunctionName: this.function.functionName,
        Payload: payload,
      },
      physicalResourceId: custom.PhysicalResourceId.of(idAwsSdkCallVerHash_label),
    };

    const customResourceFnRole = new Role(scope, 'AwsCustomResourceRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    customResourceFnRole.addToPolicy(
      new PolicyStatement({
        resources: [arnLambdaRegionAccountResInitStackName_label],
        actions: ['lambda:InvokeFunction'],
      }),
    );

    this.custom_resource = new custom.AwsCustomResource(
      scope,
      'AwsCustomResource',
      {
        policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
          resources: custom.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onUpdate: sdkCall,
        timeout: Duration.minutes(10),
        role: customResourceFnRole,
      },
    );

    this.response = this.custom_resource.getResponseField('Payload');
  }
}
