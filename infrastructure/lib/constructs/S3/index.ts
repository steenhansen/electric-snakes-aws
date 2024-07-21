import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
} from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

import { Route53 } from '../Route53';
import { ACM } from '../ACM';

const THE_ENV = process.env.NODE_ENV || '';
import {
  namedWebBucketEnvLabel, frontEndDomainName, frontEndAliasRecordEnvLabel, frontEndUrlEnvLabel,
  webBucketEnvLabel, webBucketDeploymentEnvLabel, frontendDistributionEnvLabel
} from '../../../construct_labels';

const namedWebBucketEnv_label = namedWebBucketEnvLabel(THE_ENV);
const frontEnd_domainName = frontEndDomainName(THE_ENV);

const frontEndAliasRecordEnv_label = frontEndAliasRecordEnvLabel(THE_ENV);
const frontEndUrlEnv_label = frontEndUrlEnvLabel(THE_ENV);

const webBucketEnv_label = webBucketEnvLabel(THE_ENV);
const webBucketDeploymentEnv_label = webBucketDeploymentEnvLabel(THE_ENV);
const frontendDistributionEnv_label = frontendDistributionEnvLabel(THE_ENV);

interface Props {
  acm: ACM;
  route53: Route53;
}

export class S3 extends Construct {
  public readonly web_bucket: Bucket;

  public readonly web_bucket_deployment: BucketDeployment;

  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.web_bucket = new Bucket(scope, webBucketEnv_label,
      {
        bucketName: namedWebBucketEnv_label,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
        publicReadAccess: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
        accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    );

    this.web_bucket_deployment = new BucketDeployment(
      scope, webBucketDeploymentEnv_label,
      {
        sources: [
          Source.asset(
            resolve(__dirname, '..', '..', '..', '..', 'web', 'build'),
          ),
        ],
        destinationBucket: this.web_bucket,
      },
    );

    this.distribution = new Distribution(
      scope,
      frontendDistributionEnv_label,
      {
        certificate: props.acm.certificate,
        domainNames: [frontEnd_domainName],
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new S3Origin(this.web_bucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    );

    new ARecord(scope, frontEndAliasRecordEnv_label, {
      zone: props.route53.hosted_zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      recordName: frontEnd_domainName,
    });

    new CfnOutput(scope, frontEndUrlEnv_label, {
      value: this.web_bucket.bucketDomainName,
    });
  }
}
