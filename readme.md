
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

		
