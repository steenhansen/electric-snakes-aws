import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TheMainStack } from '../../../../the_main_stack';

import { namedStackEnvLabel } from '../../../../../construct_labels';


interface Props extends StageProps {
  environment: 'Production' | 'Test' | 'Development';
}

export class BackendStage extends Stage {
  readonly stack: TheMainStack;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const stack_label = namedStackEnvLabel(props.environment);
    this.stack = new TheMainStack(this, stack_label);
  }
}
