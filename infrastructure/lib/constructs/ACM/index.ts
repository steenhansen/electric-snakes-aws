import console = require('console');

import {
  Certificate, CertificateValidation,
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
    //console.log("4 4 4 44444444444444444444444444444444");
    //console.log("5 5 5 5", props.hosted_zone);

    this.certificate = new Certificate(scope, 'Certificate', {
      domainName: DOMAIN_NAME,
      validation: CertificateValidation.fromDns(props.hosted_zone),
      subjectAlternativeNames: [`*.${DOMAIN_NAME}`],
    });

    //console.log("6 6 6 6", this.certificate);
  }
}
