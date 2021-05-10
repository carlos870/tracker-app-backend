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

import { Journey, setLocationInput, tokenValidationOutput, getJourneyOutput } from './journeyModels';

const AWS_REGION = process.env.AWS_REGION;
const JOURNEY_TABLE = process.env.JOURNEY_TABLE;
const TOKEN_TABLE = process.env.TOKEN_TABLE;

enum DbErrors {
    ConditionalCheckFailedException = 'ConditionalCheckFailedException'
};

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

async function fetchJourneyData(journeyId: string) {
    const params = {
        TableName: JOURNEY_TABLE,
        Key: marshall({
            JourneyId: journeyId
        })
    };

    const { Item } = await dbClient.send(new GetItemCommand(params));

    if (!Item) {
        return null;
    }

    const parsedItem = unmarshall(Item);

    return {
        journeyId: parsedItem.JourneyId,
        startDate: parsedItem.StartDate,
        endDate: parsedItem.EndDate,
        description: parsedItem.Description,
        latitude: parsedItem.Latitude,
        longitude: parsedItem.Longitude,
        updateDate: parsedItem.UpdateDate
    } as getJourneyOutput;
}

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

async function setLocation(locationData: setLocationInput) {
    const params = {
        TableName: JOURNEY_TABLE,
        Key: marshall({
            JourneyId: locationData.journeyId
        }),
        ConditionExpression: 'attribute_exists(JourneyId) AND attribute_not_exists(EndDate)',
        UpdateExpression: 'SET Latitude = :lat, Longitude = :lon, UpdateDate = :upDate',
        ExpressionAttributeValues: marshall({
            ":lat": locationData.latitude,
            ":lon": locationData.longitude,
            ":upDate": locationData.date.toISOString()
        })
    };

    await dbClient.send(new UpdateItemCommand(params));
}

async function validateToken(managementToken: string) {
    const params = {
        TableName: TOKEN_TABLE,
        Key: marshall({
            ManagementToken: managementToken
        })
    };

    const { Item } = await dbClient.send(new GetItemCommand(params));

    if (!Item) {
        return null;
    }

    const parsedItem = unmarshall(Item);

    return {
        managementToken: parsedItem.ManagementToken,
        journeyId: parsedItem.JourneyId
    } as tokenValidationOutput;
}

export {
    DbErrors,
    fetchJourneyData,
    addNewJourney,
    terminateJourney,
    setLocation,
    validateToken
};