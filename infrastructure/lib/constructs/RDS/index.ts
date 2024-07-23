import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { CfnOutput, Duration, Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DockerImageCode } from 'aws-cdk-lib/aws-lambda';

import { CDKResourceInitializer } from './custom';

import stack_config from '../../../config.json';
const MY_SQL_DBNAME = stack_config.MY_SQL_DBNAME;


const THE_ENV = process.env.NODE_ENV || '';
import {
  namedMysqlRdsInstanceLabel, mysqlInstanceIdEnvLabel, mysqlCredentialsEnvLabel, mysqlRdsInstanceEnvLabel,
  myRdsInitEnvLabel, rdsInitFnResponseEnvLabel
} from '../../../construct_labels';

const mysqlRdsInstanceIdEnv_label = mysqlInstanceIdEnvLabel(THE_ENV);
const namedMysqlRdsInstance_label = namedMysqlRdsInstanceLabel(THE_ENV);
const mysqlCredentialsEnv_label = mysqlCredentialsEnvLabel(THE_ENV);
const mysqlRdsInstanceEnv_label = mysqlRdsInstanceEnvLabel(THE_ENV);

const myRdsInitEnv_label = myRdsInitEnvLabel(THE_ENV);
const rdsInitFnResponseEnv_label = rdsInitFnResponseEnvLabel(THE_ENV);


interface Props {
  vpc: ec2.Vpc;
}

export class RDS extends Construct {
  public readonly instance: rds.DatabaseInstance;

  public readonly credentials: rds.DatabaseSecret;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const credentials_secret_name = namedMysqlRdsInstance_label;

    this.credentials = new rds.DatabaseSecret(
      scope, mysqlCredentialsEnv_label,
      {
        secretName: credentials_secret_name,
        username: 'admin',
      },
    );

    this.instance = new rds.DatabaseInstance(
      scope, mysqlRdsInstanceEnv_label,
      {
        credentials: rds.Credentials.fromSecret(this.credentials),
        databaseName: MY_SQL_DBNAME,                                //'todolist',
        engine: rds.DatabaseInstanceEngine.mysql({
          version: rds.MysqlEngineVersion.VER_8_0_36,
        }),
        instanceIdentifier: mysqlRdsInstanceIdEnv_label,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.SMALL,
        ),
        port: 3306,
        publiclyAccessible: false,
        vpc: props.vpc,
        vpcSubnets: {
          onePerAz: false,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      },
    );

    const dir_name_init = `${__dirname}/init`;
    const initializer = new CDKResourceInitializer(
      scope, myRdsInitEnv_label,
      {
        config: {
          credentials_secret_name,
        },
        function_log_retention: RetentionDays.FIVE_MONTHS,
        function_code: DockerImageCode.fromImageAsset(dir_name_init, {}),
        function_timeout: Duration.minutes(2),
        function_security_groups: [],
        vpc: props.vpc,
        subnets_selection: props.vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        }),
      },
    );

    initializer.custom_resource.node.addDependency(this.instance);

    this.credentials.grantRead(initializer.function);

    this.instance.connections.allowFrom(
      initializer.function,
      ec2.Port.tcp(3306),
    );

    /* ----------
     * Returns the initializer function response,
     * to check if the SQL was successful or not
     * ---------- */
    new CfnOutput(scope, rdsInitFnResponseEnv_label, {
      value: Token.asString(initializer.response),
    });
  }
}
