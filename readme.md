


yarn test on web

Jest has detected the following 2 open handles potentially keeping Jest from exiting:

  ●  TCPSERVERWRAP

      89 | const app = createApp();
      90 |
    > 91 | const server = app.listen(port, () => {
         |                    ^
      92 |   console.log(`Server is listening on port ${port}`);
      93 | });
      94 |

      at Function.listen (node_modules/express/lib/application.js:635:24)
      at Object.<anonymous> (src/index.ts:91:20)
      at Object.<anonymous> (src/__tests__/api.test.ts:2:1)


  ●  HTTPINCOMINGMESSAGE

      10 | describe('health check route', () => {
      11 |   it('Should return status 200 and message: {status: "available"}', async () => {
    > 12 |     const { body, statusCode } = await supertest(app).get('/health');
         |                                                       ^
      13 |
      14 |     expect(statusCode).toBe(200);
      15 |     expect(body).toEqual(healthPathResult);

      at Test.serverAddress (node_modules/supertest/lib/test.js:48:35)
      at new Test (node_modules/supertest/lib/test.js:34:14)
      at Object.obj.<computed> [as get] (node_modules/supertest/index.js:28:14)
      at Object.<anonymous> (src/__tests__/api.test.ts:12:55)

Done in 253.01s.












Outputs:

ElSnStack-Production.BackendURL = ElSn-lb-Production-2104578768.us-east-1.elb.amazonaws.com

ElSnStack-Production.FrontendURLProduction = elsn-web-bucket-elsn-zxcmxdjhjk-production.s3.amazonaws.com

ElSnStack-Production.RdsInitFnResponseProduction = {"errorType":"Runtime.UserCodeSyntaxError","errorMessage":"SyntaxError: Cannot use import statement outside a module","trace":["Runtime.UserCodeSyntaxError: SyntaxError: Cannot use import statement outside a module","    at _loadUserApp (file:///var/runtime/index.mjs:1084:17)","    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1119:21)","    at async start (file:///var/runtime/index.mjs:1282:23)","    at async file:///var/runtime/index.mjs:1288:1"]}


Stack ARN:
arn:aws:cloudformation:us-east-1:211125473900:stack/ElSnStack-Production/b4341380-49fd-11ef-a7ef-0efbcb586ca7

////////////////////////////////////////

0 KILL OLD CLOUD FORMATION STACKS
  https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1

1 INITIALIZE PROGRAM
  cd infrastructure
  yarn cdk bootstrap --profile steen-admin-2 
  delete anything still existing

2 CHECK PIPELINE
  yarn cdk:pipeline synth --profile steen-admin-2 > ../../el_snakes_cloud_formation.yaml

 


3 PLAIN DEPLOY
  turn on Docker Desktop to stop error -- Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping"
  yarn cdk deploy --profile steen-admin-2

4 CI/CD DEPLOY
 yarn cdk:pipeline deploy --profile steen-admin-2


  Delete a stack with an invalid role
    https://repost.aws/knowledge-center/cloudformation-stack-delete-failed

    1 IAM role of bad stack
      arn:aws:iam::211125473900:role/cdk-hnb659fds-cfn-exec-role-211125473900-us-west-2

    2 Create an AWS Identity and Access Management (IAM) ROLE using the same above name as the IAM role 
      https://us-east-1.console.aws.amazon.com/iam/home?region=us-west-2#/roles

      Service or use case : CloudFormation
      +
      [x] AdministratorAccess
      +
      Role name cloudformation = cdk-hnb659fds-cfn-exec-role-211125473900-us-west-2
      THEN DELETE NORMALLY




  5 DESTROY
  yarn cdk destroy --profile steen-admin-2









.aws/config         yes
.aws/credentials    


Users/16043/.aws/config            no
Users/16043/.aws/credentials

STEPS:

	cd web
		yarn
    yarn start
    yarn build:dev

	cd infrastructure
		yarn

    yarn cdk bootstrap --profile steen-admin-2 

		yarn cdk:pipeline synth --profile steen-admin-2 > ../../el_snakes_cloud_formation.yaml

    yarn cdk:pipeline deploy --profile steen-admin-2 

		
