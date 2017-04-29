# Comments-Showcase

## Introduction
This is a serverless showcase webapp with AWS: API Gateway, Lambda, DynamoDB, IoT, IAM and Google Web Identity.

## Architecture

![Serverless Architecture Diagram](https://serverless-vienna.github.io/2016/Meetup20161115/ServerlessByExample/dist/a992d5fe6535c74bb12b4d8bc94b555a.png "Serverless Architecture Diagram")


## Steps to Serverlessness on AWS

### Configuration Templates
Copy the template configuration files:
```
$ cp ./src/config.template.json ./src/config.json
$ cp ./serverless/aws/serverless.template.yml ./serverless/aws/serverless.yml
```
Enter your desired region (e.g. us-west-1 for N.California or eu-central-1 for Frankfurt, see [Available Regions](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions)) in ```./src/config.json``` under the key **AWS->REGION**

### Google Identity
Configure and setup an oauth2 credential according to [Google Identity](https://developers.google.com/identity/protocols/OpenIDConnect
). Don't forget to configure http://localhost:3000 as an Authorized JavaScript origin (Cors!) for development.

Take the client id and enter it in ```./src/config.json``` under the key **OAUTH->GOOGLE->APP_KEY** and ```./serverless/serverless.yml``` under the key **OAUTH_GOOGLE_APP_KEY**.

### Aws cli setup

If you haven't done already, then [install](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and [configure](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) your AWS CLI (command line interface) before the next step. You probably have to create an user (AWS > IAM) and extract the required key and secret from the Users > Security Credentials page.   

### DynamoDB, Functions, Roles, and Policies
For the first basic setup the latest version of [Serverless Framework](https://github.com/serverless/serverless) is required:
```bash
$ npm install -g serverless
$ cd ./serverless/aws
$ serverless deploy
```

### Google Identity Aws
Now that the Google Identity Role has been deployed in the previous step, we can get the necessary configuration:
```bash
$ aws iam get-role --role-name googleIdentityRole
{
    "Role": {
[...]
        "Arn": "<GOOGLE-ROLE-ARN-ID>"
    }
}
```
Take the Arn value and enter it in ```./src/config.json``` under the key **AWS->GOOGLE->ROLE_ARN**

### IoT
#### IoT user
```bash
$ aws iam create-user --user-name iot
[...]
$ aws iam attach-user-policy --user-name iot --policy-arn arn:aws:iam::aws:policy/AWSIoTDataAccess
$ aws iam create-access-key --user-name iot
{
    "AccessKey": {
        "UserName": "iot",
        "Status": "Active",
        "CreateDate": "2016-11-24T21:57:09.164Z",
        "SecretAccessKey": "<SECRET-KEY>",
        "AccessKeyId": "<ACCESS-KEY>"
    }
}
```
Take the AccessKeyId and enter it in ```./src/config.json``` under the key **AWS->IOT->USER->ACCESS_KEY** and take the SecretAccessKey and enter it in ```./src/config.json``` under the key **AWS->IOT->USER->SECRET_KEY**.

#### IoT - endpoint

```bash
$ aws iot describe-endpoint
{
    "endpointAddress": "<ENDPOINT-ID>.iot.<AWS-REGION-ID>.amazonaws.com"
}
```
Take the endpointAddress and enter it in ```./src/config.json``` under the key **AWS->IOT->ENDPOINT**.

#### IoT - thing/topic
```bash
$ aws iot create-thing --thing-name webweb-thing
{
    "thingArn": "arn:aws:iot:<AWS-REGION-ID>:<THING-ID>:thing/webweb-thing",
    "thingName": "webweb-thing"
}
```
Take the thingArn and enter it in ```./src/config.json``` under the key **AWS->IOT->TOPIC**.

### Trigger
A Trigger is needed to put a new comment from dynamodb into the topic.

This configuration step needs an active dynamodb stream and the lambda function arns.
```bash
$ aws lambda get-function --function-name CommentsShowcase-dev-insertIntoTopicTrigger
{
    "Code": {
[...]
    },
    "Configuration": {
[...]
        "FunctionArn": "arn:aws:lambda:<AWS-REGION-ID>:<ACCOUNT-ID>:function:CommentsShowcase-dev-insertIntoTopicTrigger", <= <FUNCTION-ARN>
[...]
    }
}
$ aws dynamodbstreams list-streams
{
    "Streams": [
        {
            "TableName": "Comments",
            "StreamArn": "arn:aws:dynamodb:<AWS-REGION-ID>:<DYNAMODB-ID>:table/Comments/stream/<STREAM-LABEL-ID>", <= <STREAM-ARN>
            "StreamLabel": "<STREAM-LABEL-ID>"
        }
    ]
}
$ aws lambda create-event-source-mapping --starting-position LATEST --function-name <FUNCTION-ARN> --event-source-arn <STREAM-ARN>
```

### Configuration of AWS API Gateway

Obtain invoke url as described in http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html#how-to-call-api-console and put it into ```./src/config.json``` under the key **AWS->FUNCTIONS->INVOKE_URL**


## local development
Install the project dependencies (npm install) and start the application locally (npm start).
```bash
$ npm install
$ npm start
```
The webapp can now be loaded at http://localhost:3000.

## build and deploy webapp
Follow these steps for public deployment of the application into the Amazon Cloud. Please think of the Google Authorization settings and add your public URL to the Credentials Tab: Authorized JavaScript origins.
your buckets can be accessed here https://console.aws.amazon.com/s3/buckets
```bash
$ npm run build
$ aws s3 cp build s3://<BUCKET>/ --recursive
```
gzip and setting headers on s3 files only seems to be supported via cloudfront

## Future Tasks

- vanilla aws-cli
- restrict policies to the specific resources
- one-shot setup script for aws
- more providers
- more frameworks
- get user email out of the token in the cloud (not in the browser client)
- local testing
- [...]
