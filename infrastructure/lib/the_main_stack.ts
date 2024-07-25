import { Stack, StackProps } from 'aws-cdk-lib';
import { Port, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ECS } from './constructs/ECS';
import { RDS } from './constructs/RDS';
import { S3 } from './constructs/S3';
import { Route53 } from './constructs/Route53';
import { ACM } from './constructs/ACM';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { DynamoDB } from './constructs/DynamoDB';

const THE_ENV = process.env.NODE_ENV || '';

import {
  ecsEnvLabel, route53EnvLabel, acmEnvLabel, myVpcEnvLabel,
  s3EnvLabel, rdsEnvLabel
} from '../construct_labels';

const ecsEnv_label = ecsEnvLabel(THE_ENV);
const route53Env_label = route53EnvLabel(THE_ENV);
const acmEnv_label = acmEnvLabel(THE_ENV);
const myVpcEnv_label = myVpcEnvLabel(THE_ENV);

const s3Env_label = s3EnvLabel(THE_ENV);
const rdsEnv_label = rdsEnvLabel(THE_ENV);

export class TheMainStack extends Stack {
  //public readonly dynamoDB: DynamoDB;

  public readonly acm: ACM;

  public readonly ecs: ECS;

  public readonly rds: RDS;

  public readonly route53: Route53;

  public readonly s3: S3;

  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //this.dynamoDB = new Dynamodb(this, 'Dynamodb');

    this.route53 = new Route53(this, route53Env_label);

    this.acm = new ACM(this, acmEnv_label, {
      hosted_zone: this.route53.hosted_zone,
    });

    const the_cidr =
      process.env.NODE_ENV === 'Production' ? '10.0.0.0/16' : '10.1.0.0/16';

    this.vpc = new Vpc(this, myVpcEnv_label, {

      ipAddresses: ec2.IpAddresses.cidr(the_cidr),
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'compute',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS, // q-bert-deprecated
        },
        {
          cidrMask: 28,
          name: 'rds',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
      maxAzs: 2,
    });

    this.s3 = new S3(this, s3Env_label, {
      acm: this.acm,
      route53: this.route53,
    });

    this.rds = new RDS(this, rdsEnv_label, {
      vpc: this.vpc,
    });

    this.ecs = new ECS(this, ecsEnv_label, {
      // dynamoDB: this.dynamoDB,
      rds: this.rds,
      vpc: this.vpc,
      acm: this.acm,
      route53: this.route53,
    });

    this.rds.instance.connections.allowFrom(this.ecs.cluster, Port.tcp(3306));

    this.ecs.task_definition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [this.rds.credentials.secretArn],
      }),
    );

    this.ecs.node.addDependency(this.rds);
  }
}
