import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import stack_config from '../../../config.json';
const DOMAIN_NAME = stack_config.DOMAIN_NAME;

export class Route53 extends Construct {
  public readonly hosted_zone: IHostedZone;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.hosted_zone = HostedZone.fromLookup(scope, 'HostedZone', {
      domainName: DOMAIN_NAME,
    });
  }
}
