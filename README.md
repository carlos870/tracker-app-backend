# tracker-app-backend

## Description
This repository is the first part of the TrackerApp ecosystem.
It contains a REST and WebSocket APIs, built with TypeScript and ready for AWS Lambda, responsible for managing user journeys.
This APIs will be invoked by mobile and browser users, enabling the creation, management and broadcasting of the users' current location.
A CloudFormation template is also provided to enable a fast deployment of the supporting infrastrucutre to AWS.

## Installation

Start by installing and configuring [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) and [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) in your system. 
After setting your AWS access key and secret, run the following commands:

```sh
npm install typescript -g
npm install

npm build
npm deploy
```

Confirm the operation when asked to review the changeset, so that the infrastructure is created on AWS and the backend code is deployed.

## Tests

To run the available unit tests, type:

```sh
npm install --only=dev
npm test
```