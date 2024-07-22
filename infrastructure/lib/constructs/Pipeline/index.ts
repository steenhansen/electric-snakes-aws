import console = require('console');

/* ---------- External Libraries ---------- */
import { SecretValue, Tags } from 'aws-cdk-lib';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
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
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SlackChannelConfiguration } from 'aws-cdk-lib/aws-chatbot';
import { NotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';
import { pipelineConfig } from '../../../utils/pipelineConfig';
import stack_config from '../../../config.json';
const LINUX_IMAGE = stack_config.LINUX_IMAGE;

import { namedBackEndTestPipelineProjectEnvLabel, namedFrontEndTestPipelineProjectEnvLabel, backEndTestPipelineEnvLabel, namedPipelineEnvLabel, envPipelineSlackNotTopicLabel, envPipelineSlackChannelConfLabel, namedBackEndBuildPipelineProjectEnvLabel } from '../../../construct_labels';



const GITHUB_REPO = stack_config.GITHUB_REPO;
const GITHUB_OWNER = stack_config.GITHUB_OWNER;

interface Props {
  environment: string;
}


export class PipelineStack extends Construct {
  readonly frontEndTestProject: PipelineProject;

  readonly backEndTestProject: PipelineProject;

  readonly deployProject: PipelineProject;

  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    let {
      buildCommand,
      deployCommand,
      branch,
      tag,
      githubToken,   /// /// q-bert
      workspaceId,
      channelId,
    } = pipelineConfig(props.environment);

    const namedBackEndBuildPipelineProjectEnv_label = namedBackEndBuildPipelineProjectEnvLabel(props.environment);

    let namedBackEndTestPipelineProjectEnv_label = namedBackEndTestPipelineProjectEnvLabel(props.environment);


    const namedFrontEndTestPipelineProjectEnv_label = namedFrontEndTestPipelineProjectEnvLabel(props.environment);
    const backEndTestPipeline_label = backEndTestPipelineEnvLabel(props.environment);

    const namedPipelineEnv_label = namedPipelineEnvLabel(props.environment);
    /* ---------- Pipeline Configs ---------- */
    const secretToken = new SecretValue(githubToken);  /// q-bert

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
                `${buildCommand}`,
                'cd ../infrastructure',
                `${deployCommand}`,
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
        projectName: namedFrontEndTestPipelineProjectEnv_label,
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
        pipelineName: namedPipelineEnv_label,
      },
    );


    /* ---------- Stages ---------- */
    //     https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_codepipeline_actions/GitHubSourceAction.html   q-bert
    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'Source',
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: `${branch}`,
          oauthToken: secretToken,      /// q-bert   SecretValue.secrets_manager("my-github-token"),
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

    const envPipelineSlackNotTopic_label = envPipelineSlackNotTopicLabel(props.environment);
    const snsTopic = new Topic(
      this, envPipelineSlackNotTopic_label
    );

    const envPipelineSlackChannelConf_label = envPipelineSlackChannelConfLabel(props.environment);
    const slackConfig = new SlackChannelConfiguration(this, 'SlackChannel', {
      slackChannelConfigurationName: envPipelineSlackChannelConf_label,
      slackWorkspaceId: workspaceId || '',
      slackChannelId: channelId || '',
    });

    const rule = new NotificationRule(this, 'NotificationRule', {
      source: this.pipeline,
      events: [
        'codepipeline-pipeline-pipeline-execution-failed',
        'codepipeline-pipeline-pipeline-execution-canceled',
        'codepipeline-pipeline-pipeline-execution-started',
        'codepipeline-pipeline-pipeline-execution-resumed',
        'codepipeline-pipeline-pipeline-execution-succeeded',
        'codepipeline-pipeline-manual-approval-needed',
      ],
      targets: [snsTopic],
    });

    rule.addTarget(slackConfig);

    /* ---------- Tags ---------- */
    Tags.of(this).add('Context', `${tag}`);
  }
}
