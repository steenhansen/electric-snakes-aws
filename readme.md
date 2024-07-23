



 resources:
ElSnStack-Development | 3:59:51 AM | CREATE_FAILED        | AWS::CloudFront::Distribution               | Frontend-Distribution-Development (FrontendDistributionDevelopment0B76D977) Resource handler returned message: "Invalid request provided: AWS::CloudFront::Distribution: The specified SSL certificate doesn't exist, isn't in us-east-1 region, isn't valid, or doesn't include a valid certificate chain. (Service: CloudFront, Status Code: 400, Request ID: ac616cf4-eb26-4c1c-afd8-47c01b812180)" (RequestToken: b87374ca-f706-03b6-20d7-cb5c28bb17ef, HandlerErrorCode: InvalidRequest)
ElSnStack-Development | 4:02:09 AM | DELETE_FAILED        | AWS::RDS::DBInstance                        | MySQL-RDS-Instance-Development (MySQLRDSInstanceDevelopment25158E46) Instance my-sql-instance-development is currently creating - a final snapshot cannot be taken. (Service: Rds, Status Code: 400, Request ID: b1fc6ddb-bb7d-4cad-9138-9fbfabb44665)




 "aws-cdk": "2.34.0",   ==>> 2.149.0













 databaseName: 'todolist',
 
         websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
		
		
  region: "us-west-2",
  const secret_name = "github-token";



Users/16043/.aws/config
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

		
