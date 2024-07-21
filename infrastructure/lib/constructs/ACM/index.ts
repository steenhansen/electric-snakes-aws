import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';


import stack_config from '../../../config.json';
const DOMAIN_NAME = stack_config.DOMAIN_NAME;


interface Props {
  hosted_zone: IHostedZone;
}

export class ACM extends Construct {
  public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.certificate = new Certificate(scope, 'Certificate', {
      domainName: DOMAIN_NAME,
      validation: CertificateValidation.fromDns(props.hosted_zone),
      subjectAlternativeNames: [`*.${DOMAIN_NAME}`],
    });
  }
}
