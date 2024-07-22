

Users/16043/.aws/config
Users/16043/.aws/credentials

STEPS:

	cd infrastructure
		yarn

yarn configurate   // to copy master configs

    yarn cdk bootstrap --profile steen-admin-2 

		yarn cdk:pipeline synth --profile steen-admin-2 > ../../el_snakes_cloud_formation.yaml

    yarn cdk:pipeline deploy --profile steen-admin-2 



////////////////////////////////////


https://medium.com/@marius.ingjer/get-your-github-personal-access-tokens-out-of-aws-ac9314bf5379

https://us-west-2.console.aws.amazon.com/codesuite/settings/connections

https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html

const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
  synth: new pipelines.ShellStep('Synth', {
  // Use a connection created using the AWS console to authenticate to GitHub
  // Other sources are available.
  input: pipelines.CodePipelineSource.connection('steenhansen/electric-snakes-aws', 'main', {
    connectionArn: 'arn:aws:codeconnections:us-west-2:211125473900:connection/604e293b-fd47-4513-809d-7cc162b55b9e',
  }),
  commands: [
      'npm ci',
      'npm run build',
      'npx cdk synth',
    ],
  }),
});



/////////////////////////








# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template





https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html
"You can use Amazon EC2 to launch as many or as few virtual servers as you need"

 Amazon EC2 number of servers


https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html
https://aws.amazon.com/caching/session-m
https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html

