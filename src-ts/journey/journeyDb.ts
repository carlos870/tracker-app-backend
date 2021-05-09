import {
    DynamoDBClient,
    TransactWriteItemsCommand,
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

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

async function addNewJourney(journey: Journey) {
    const params = {
        TransactItems: [
            {
                Put: {
                    TableName: JOURNEY_TABLE,
                    Item: marshall({
                        JourneyId: journey.id,
                        Description: journey.description,
                        StartDate: journey.startDate.toISOString(),
                        TTL: (Math.round(journey.expireDate.getTime() / 1000)).toString()
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
                        TTL: (Math.round(journey.expireDate.getTime() / 1000)).toString()
                    }),
                    ConditionExpression: 'attribute_not_exists(ManagementToken)'
                }
            }
        ]
    };

    await dbClient.send(new TransactWriteItemsCommand(params));
}

export {
    addNewJourney
};