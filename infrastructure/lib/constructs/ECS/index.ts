import * as ecs from 'aws-cdk-lib/aws-ecs';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  Protocol,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { resolve } from 'path';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { ACM } from '../ACM';
import { Route53 } from '../Route53';
import { RDS } from '../RDS';

const THE_ENV = process.env.NODE_ENV || '';
import stack_config from '../../../../../electric-snakes-aws.config.json';
const INSTANCE_TYPE = stack_config.INSTANCE_TYPE;

import {
  backEndSubDomainName, namedLoadBalancerEnvLabel, loadBalancerEnvLabel, expressEnvLabel, serviceEnvLabel,
  ecsEnvLabel, publicListenerEnvLabel, ecsClusterEnvLabel, taskDefinitionEnvLabel, ecsLogGroupEnvLabel, defaultAutoScalingGroupEnvLabel, namedEcsLogsEnvLabel, namedStreamPrefixEnvLabel
} from '../../../construct_labels';

const backEnd_domainName = backEndSubDomainName(THE_ENV);
const namedLoadBalancerEnv_label = namedLoadBalancerEnvLabel(THE_ENV);
const LoadBalancerEnv_label = loadBalancerEnvLabel(THE_ENV);
const publicListenerEnv_label = publicListenerEnvLabel(THE_ENV);
const ecsEnv_label = ecsEnvLabel(THE_ENV);
const expressEnv_label = expressEnvLabel(THE_ENV);
const serviceEnv_label = serviceEnvLabel(THE_ENV);

const ecsClusterEnv_label = ecsClusterEnvLabel(THE_ENV);
const taskDefinitionEnv_label = taskDefinitionEnvLabel(THE_ENV);

const defaultAutoScalingGroupEnv_label = defaultAutoScalingGroupEnvLabel(THE_ENV);
const ecsLogGroupEnv_label = ecsLogGroupEnvLabel(THE_ENV);
const namedEcsLogsEnv_label = namedEcsLogsEnvLabel(THE_ENV);

const namedStreamPrefixEnv_label = namedStreamPrefixEnvLabel(THE_ENV);


interface Props {
  rds: RDS;
  vpc: Vpc;
  acm: ACM;
  route53: Route53;
}

export class ECS extends Construct {
  public readonly cluster: ecs.Cluster;

  public readonly task_definition: ecs.Ec2TaskDefinition;

  public readonly container: ecs.ContainerDefinition;

  public readonly service: ecs.Ec2Service;

  public readonly load_balancer: ApplicationLoadBalancer;

  public readonly listener: ApplicationListener;

  public readonly log_group: LogGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.log_group = new LogGroup(
      scope,
      ecsLogGroupEnv_label,
      {
        logGroupName: namedEcsLogsEnv_label,
        retention: RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );

    this.cluster = new ecs.Cluster(
      scope,
      ecsClusterEnv_label,
      { vpc: props.vpc },
    );

    this.cluster.addCapacity(
      defaultAutoScalingGroupEnv_label,
      {
        instanceType: new InstanceType(INSTANCE_TYPE),
      },
    );

    this.task_definition = new ecs.Ec2TaskDefinition(
      scope,
      taskDefinitionEnv_label,
    );

    this.container = this.task_definition.addContainer(expressEnv_label,
      {
        image: ecs.ContainerImage.fromAsset(
          resolve(__dirname, '..', '..', '..', '..', 'server'),
        ),
        environment: {
          NODE_ENV: process.env.NODE_ENV as string,
          RDS_HOST: props.rds.instance.instanceEndpoint.hostname,
        },
        memoryLimitMiB: 256,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: namedStreamPrefixEnv_label,
          logGroup: this.log_group,
        }),
      },
    );

    this.container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.Ec2Service(
      scope,
      serviceEnv_label,
      {
        cluster: this.cluster,
        taskDefinition: this.task_definition,
      },
    );

    this.load_balancer = new ApplicationLoadBalancer(
      scope,
      LoadBalancerEnv_label,
      {
        vpc: props.vpc,
        internetFacing: true,
        loadBalancerName: namedLoadBalancerEnv_label,
      },
    );

    this.listener = this.load_balancer.addListener(
      publicListenerEnv_label,
      {
        port: 443,
        open: true,
        certificates: [props.acm.certificate],
      },
    );

    this.listener.addTargets(ecsEnv_label, {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.service.loadBalancerTarget({
          containerName: expressEnv_label,
          containerPort: 80,
        }),
      ],
      healthCheck: {
        protocol: Protocol.HTTP,
        path: '/health',
        timeout: Duration.seconds(10),
        unhealthyThresholdCount: 5,
        healthyThresholdCount: 5,
        interval: Duration.seconds(60),
      },
    });

    new ARecord(this, 'BackendAliasRecord', {
      zone: props.route53.hosted_zone,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(this.load_balancer),
      ),
      recordName: backEnd_domainName,
    });

    new CfnOutput(scope, 'BackendURL', {
      value: this.load_balancer.loadBalancerDnsName,
    });
  }
}
