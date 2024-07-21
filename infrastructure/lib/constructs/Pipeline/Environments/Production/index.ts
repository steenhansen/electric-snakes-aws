
import console = require('console');


/* ---------- External Libraries ---------- */
import { SecretValue, Tags } from 'aws-cdk-lib';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { Construct } from 'constructs';
import { config } from 'dotenv';



import {
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';

import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

config({ path: '.env.production' });

import stack_config from '../../../../../../../electric-snakes-aws.config.json';
const GITHUB_REPO = stack_config.GITHUB_REPO;
const GITHUB_OWNER = stack_config.GITHUB_OWNER;
const LINUX_IMAGE = stack_config.LINUX_IMAGE;
import { namedBackEndBuildPipelineProjectEnvLabel, namedFrontEndTestPipelineProjectEnvLabel, namedBackEndTestPipelineProjectEnvLabel, namedBackEndTestEnvLabel, namedProductionPipelineLabel, backendTestPipelineEnvLabel } from '../../../../../construct_labels';

interface Props {
  environment: string;
}

export class ProductionPipeline extends Construct {
  readonly frontEndTestProject: PipelineProject;

  readonly backEndTestProject: PipelineProject;

  readonly deployProject: PipelineProject;

  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const namedBackEndBuildPipelineProjectEnv_label = namedBackEndBuildPipelineProjectEnvLabel(props.environment);

    const namedFrontEndTestPipelineProjectEnv_label = namedFrontEndTestPipelineProjectEnvLabel(props.environment);


    let namedBackEndTestPipelineProjectEnv_label = namedBackEndTestPipelineProjectEnvLabel(props.environment);

    const namedBackEndTestEnv_label = namedBackEndTestEnvLabel(props.environment);

    const namedProductionPipeline_label = namedProductionPipelineLabel();

    const backendTestPipelineEnv_label = backendTestPipelineEnvLabel(props.environment);

    /* ---------- Pipeline Configs ---------- */
    const secretToken = new SecretValue(process.env.GITHUB_TOKEN);

    const codeBuildPolicy = new PolicyStatement({
      sid: 'AssumeRole',
      effect: Effect.ALLOW,
      actions: ['sts:AssumeRole', 'iam:PassRole'],
      resources: [
        'arn:aws:iam::*:role/cdk-readOnlyRole',
        'arn:aws:iam::*:role/cdk-hnb659fds-lookup-role-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-deploy-role-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-file-publishing-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-image-publishing-role-*',
      ],
    });

    /* ---------- Artifacts ---------- */
    const outputSource = new Artifact();

    /* ---------- Pipeline Build Projects ---------- */
    this.backEndTestProject = new PipelineProject(
      scope,
      namedBackEndTestPipelineProjectEnv_label,
      {
        projectName: namedBackEndTestPipelineProjectEnv_label,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            LINUX_IMAGE,
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: ['cd server/', 'yarn install'],
            },
            build: {
              'on-failure': 'ABORT',
              commands: ['echo Testing the Back-End...', 'yarn test'],
            },
          },
        }),
      },
    );

    this.deployProject = new PipelineProject(
      this,
      namedBackEndBuildPipelineProjectEnv_label,
      {
        projectName: namedBackEndBuildPipelineProjectEnv_label,
        environment: {
          privileged: true,
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            LINUX_IMAGE,
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: [
                'cd web',
                'yarn install',
                'cd ../server',
                'yarn install',
                'cd ../infrastructure',
                'yarn install',
              ],
            },
            build: {
              'on-failure': 'ABORT',
              commands: [
                'cd ../web',
                'yarn build:prod',
                'cd ../infrastructure',
                'yarn cdk deploy',
              ],
            },
            post_build: {
              'on-failure': 'ABORT',
              commands: [''],
            },
          },
        }),
      },
    );

    // adding the necessary permissions in order to synthesize and deploy the cdk code.
    this.deployProject.addToRolePolicy(codeBuildPolicy);

    this.frontEndTestProject = new PipelineProject(
      scope,
      namedFrontEndTestPipelineProjectEnv_label,
      {
        projectName: namedBackEndTestPipelineProjectEnv_label,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            LINUX_IMAGE,
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: ['cd web/', 'yarn install'],
            },
            build: {
              'on-failure': 'ABORT',
              commands: ['echo Testing the Front-End...', 'yarn test'],
            },
          },
        }),
      },
    );

    /* ---------- Pipeline ---------- */
    this.pipeline = new Pipeline(
      scope, backendTestPipelineEnv_label,
      {
        pipelineName: namedBackEndTestEnv_label,
      },
    );

    /* ---------- Stages ---------- */
    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'Source',
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: 'master',
          oauthToken: secretToken,
          output: outputSource,
          trigger: GitHubTrigger.WEBHOOK,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Back-End-Test',
      actions: [
        new CodeBuildAction({
          actionName: 'Back-End-Test',
          project: this.backEndTestProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Front-End-Test',
      actions: [
        new CodeBuildAction({
          actionName: 'Front-End-Test',
          project: this.frontEndTestProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Build-and-Deploy',
      actions: [
        new CodeBuildAction({
          actionName: 'Build-and-Deploy-Front-and-Back-End',
          project: this.deployProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    /* ---------- Tags ---------- */
    Tags.of(this).add('Context', namedProductionPipeline_label);
  }
}
