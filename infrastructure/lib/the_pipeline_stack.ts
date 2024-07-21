/* ---------- External libraries ---------- */
import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { IBaseService } from 'aws-cdk-lib/aws-ecs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import stack_config from '../../../electric-snakes-aws.config.json';
const STACK_NAME = stack_config.STACK_NAME;

/* ---------- Constructs ---------- */
import { PipelineStack } from './constructs/Pipeline/index';

import { namedPipelineLabel, namedPipelineEnvLabel } from '../construct_labels';


interface PipelineProps extends StackProps {
  bucket?: IBucket;
  repository?: IRepository;
  expressAppService?: IBaseService;
}

export class ThePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    /* ---------- Constructs ---------- */
    const namedPipelineProd_label = namedPipelineEnvLabel('Prod');
    new PipelineStack(this, namedPipelineProd_label, {
      environment: 'Production',
    });

    const namedPipelineDev_label = namedPipelineEnvLabel('Dev');
    new PipelineStack(this, namedPipelineDev_label, {
      environment: 'Development',
    });

    const namedPipeline_label = namedPipelineLabel();
    /* ---------- Tags ---------- */
    Tags.of(scope).add('Project', namedPipeline_label);
  }
};
