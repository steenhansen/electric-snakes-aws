

Users/16043/.aws/config
Users/16043/.aws/credentials

STEPS:

	cd infrastructure
		yarn

    yarn cdk bootstrap --profile steen-admin-2 

		yarn cdk:pipeline synth --profile steen-admin-2 > ../../el_snakes_cloud_formation.yaml

    yarn cdk:pipeline deploy --profile steen-admin-2 



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

