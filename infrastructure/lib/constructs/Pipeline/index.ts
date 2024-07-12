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



import { github_owner, github_repo } from '../../../../../electric-snakes-aws.config.json';


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
    const {
      buildCommand,
      deployCommand,
      branch,
      tag,
      githubToken,
      workspaceId,
      channelId,
    } = pipelineConfig(props.environment);

    /* ---------- Pipeline Configs ---------- */
    const secretToken = new SecretValue(githubToken);

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
      `Chapter6-BackEndTest-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter6-BackEndTest-PipelineProject-${props.environment}`,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
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
      `Chapter6-BackEndBuild-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter6-BackEndBuild-PipelineProject-${props.environment}`,
        environment: {
          privileged: true,
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
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
      `Chapter6-FrontEndTest-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter6-FrontEndTest-PipelineProject-${props.environment}`,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
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
      `BackendTest-Pipeline-${props.environment}`,
      {
        pipelineName: `Chapter6-Pipeline-${props.environment}`,
      },
    );



    /* ---------- Stages ---------- */
    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'Source',
          owner: github_owner, // 'steenhansen',
          repo: github_repo, //'electric-snakes-aws',
          branch: `${branch}`,
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

    const snsTopic = new Topic(
      this,
      `${props.environment}-Pipeline-SlackNotificationsTopic`,
    );

    const the_slack = {
      slackChannelConfigurationName: `${props.environment}-Pipeline-Slack-Channel-Config`,
      slackWorkspaceId: workspaceId || '',
      slackChannelId: channelId || '',
    };
    console.log("******* workspaceId,  channelId", workspaceId, channelId);
    console.log("******* the_slack", the_slack);
    const slackConfig = new SlackChannelConfiguration(this, 'SlackChannel', the_slack);

    // const slackConfig = new SlackChannelConfiguration(this, 'SlackChannel', {
    //   slackChannelConfigurationName: `${props.environment}-Pipeline-Slack-Channel-Config`,
    //   slackWorkspaceId: workspaceId || '',
    //   slackChannelId: channelId || '',
    // });

    const the_notification = {
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
    };
    console.log("******* the_notification", the_notification);
    const rule = new NotificationRule(this, 'NotificationRule', the_notification);
    console.log("******* the_notification", the_notification);

    // const rule = new NotificationRule(this, 'NotificationRule', {
    //   source: this.pipeline,
    //   events: [
    //     'codepipeline-pipeline-pipeline-execution-failed',
    //     'codepipeline-pipeline-pipeline-execution-canceled',
    //     'codepipeline-pipeline-pipeline-execution-started',
    //     'codepipeline-pipeline-pipeline-execution-resumed',
    //     'codepipeline-pipeline-pipeline-execution-succeeded',
    //     'codepipeline-pipeline-manual-approval-needed',
    //   ],
    //   targets: [snsTopic],
    // });

    rule.addTarget(slackConfig);

    /* ---------- Tags ---------- */
    Tags.of(this).add('Context', `${tag}`);
  }
}
