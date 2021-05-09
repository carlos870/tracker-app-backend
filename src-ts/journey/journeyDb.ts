import {
    DynamoDBClient,
    TransactWriteItemsCommand,
    UpdateItemCommand,
    GetItemCommand
} from '@aws-sdk/client-dynamodb';

import {
    marshall,
    unmarshall
} from '@aws-sdk/util-dynamodb';

import { Journey } from './journeyModels';

const AWS_REGION = process.env.AWS_REGION;
const JOURNEY_TABLE = process.env.JOURNEY_TABLE;
const TOKEN_TABLE = process.env.TOKEN_TABLE;

enum DbErrors {
    ConditionalCheckFailedException = 'ConditionalCheckFailedException'
};

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

async function addNewJourney(journey: Journey) {
    const TTL = Math.round(journey.expireDate.getTime() / 1000);

    const params = {
        TransactItems: [
            {
                Put: {
                    TableName: JOURNEY_TABLE,
                    Item: marshall({
                        JourneyId: journey.id,
                        Description: journey.description,
                        StartDate: journey.startDate.toISOString(),
                        TTL: TTL
                    }),
                    ConditionExpression: 'attribute_not_exists(JourneyId)'
                }
            },
            {
                Put: {
                    TableName: TOKEN_TABLE,
                    Item: marshall({
                        ManagementToken: journey.managementToken,
                        JourneyId: journey.id,
                        TTL: TTL
                    }),
                    ConditionExpression: 'attribute_not_exists(ManagementToken)'
                }
            }
        ]
    };

    await dbClient.send(new TransactWriteItemsCommand(params));
}

async function terminateJourney(journeyId: string, endDate: Date) {
    const params = {
        TableName: JOURNEY_TABLE,
        Key: marshall({
            JourneyId: journeyId
        }),
        ConditionExpression: 'attribute_exists(JourneyId) AND attribute_not_exists(EndDate)',
        UpdateExpression: 'SET EndDate = :endDate',
        ExpressionAttributeValues: marshall({
            ":endDate": endDate.toISOString()
        })
    };

    await dbClient.send(new UpdateItemCommand(params));
}

export {
    DbErrors,
    addNewJourney,
    terminateJourney
};