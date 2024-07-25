/* ---------- External Libraries ---------- */
import { SecretValue, Tags } from 'aws-cdk-lib';
import { Artifact, Pipeline, PipelineType } from 'aws-cdk-lib/aws-codepipeline';
import { Construct } from 'constructs';

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

import { namedBackEndBuildPipelineProjectEnvLabel, namedFrontEndTestPipelineProjectEnvLabel, namedBackEndTestPipelineProjectEnvLabel, namedBackEndTestEnvLabel, namedDevelopmentPipelineLabel, backEndTestPipelineEnvLabel } from '../../../../../construct_labels';

import stack_config from '../../../../../config.json';
const GITHUB_REPO = stack_config.GITHUB_REPO;
const GITHUB_OWNER = stack_config.GITHUB_OWNER;
const LINUX_IMAGE = stack_config.LINUX_IMAGE;

interface Props {
  environment: string;
}

export class DevelopmentPipeline extends Construct {
  readonly frontEndTestProject: PipelineProject;

  readonly backEndTestProject: PipelineProject;

  readonly deployProject: PipelineProject;

  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const namedBackEndBuildPipelineProject_label = namedBackEndBuildPipelineProjectEnvLabel(props.environment);
    const namedFrontEndTestPipeline_label = namedFrontEndTestPipelineProjectEnvLabel(props.environment);


    let namedBackEndTestPipelineProject_label = namedBackEndTestPipelineProjectEnvLabel(props.environment);

    const backEndTestPipeline_label = backEndTestPipelineEnvLabel(props.environment);
    const namedBackEndTest_label = namedBackEndTestEnvLabel(props.environment);
    const namedDevelopmentPipeline_label = namedDevelopmentPipelineLabel();
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
      namedBackEndTestPipelineProject_label,
      {
        projectName: namedBackEndTestPipelineProject_label,
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
      namedBackEndBuildPipelineProject_label,
      {
        projectName: namedBackEndBuildPipelineProject_label,
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
                'yarn build:dev',
                'cd ../infrastructure',
                'yarn cdk:dev deploy',
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
      namedFrontEndTestPipeline_label,
      {
        projectName: namedBackEndTestPipelineProject_label,
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
      scope,
      backEndTestPipeline_label,
      {
        pipelineName: namedBackEndTest_label,
        pipelineType: PipelineType.V1,
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
          branch: 'dev',
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
    Tags.of(this).add('Context', namedDevelopmentPipeline_label);
  }
}
