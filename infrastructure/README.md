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

// to deploy on aws
$  cd infrastructure
$  yarn run cdk:pipeline deploy --profile steen-admin-2

//  to remove from aws
$  cdk destroy --profile steen-admin-2




NO $ yarn cdk bootstrap --profile steen-admin-2

NO $ yarn cdk synth

$ yarn cdk deploy --profile steen-admin-2
