import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput,
    UpdateItemCommand,
    UpdateItemCommandInput,
    TransactWriteItemsCommand,
    TransactWriteItemsCommandInput
} from '@aws-sdk/client-dynamodb';

import {
    marshall,
    unmarshall
} from '@aws-sdk/util-dynamodb';

import { IJourney, IJourneyId, IJourneyLocation } from './models';
import { ITokenList } from '../token/models';

const AWS_REGION    = process.env.AWS_REGION;
const JOURNEY_TABLE = process.env.JOURNEY_TABLE;
const TOKEN_TABLE   = process.env.TOKEN_TABLE;

export enum DbErrors {
    ConditionalCheckFailedException = 'ConditionalCheckFailedException'
};

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

export async function getJourneyData(journeyId: string) {
    const params: GetItemCommandInput = {
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

    const journeyObj: IJourney = {
        journeyId: parsedItem.JourneyId,
        description: parsedItem.Description,
        startDate: parsedItem.StartDate,
        endDate: parsedItem.EndDate || null,
        expireDate: parsedItem.ExpireDate
    };

    if (parsedItem.UpdateDate) {
        journeyObj.location = {
            latitude: parsedItem.Latitude,
            longitude: parsedItem.Longitude,
            date: parsedItem.UpdateDate
        };
    }

    return journeyObj;
};

export async function terminateJourney(journeyId: string, endDate: Date) {
    const params: UpdateItemCommandInput = {
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

    return true;
};

export async function addNewJourney(journeyObj: IJourney & ITokenList) {
    const TTL = Math.round(journeyObj.expireDate.getTime() / 1000);

    let params: TransactWriteItemsCommandInput = {
        TransactItems: [
            {
                Put: {
                    TableName: JOURNEY_TABLE,
                    Item: marshall({
                        JourneyId: journeyObj.journeyId,
                        Description: journeyObj.description,
                        StartDate: journeyObj.startDate.toISOString(),
                        ExpireDate: journeyObj.expireDate.toISOString(),
                        TTL: TTL
                    }),
                    ConditionExpression: 'attribute_not_exists(JourneyId)'
                }
            }
        ]
    };

    journeyObj.tokens.forEach(tokenData => {
        params.TransactItems.push({
            Put: {
                TableName: TOKEN_TABLE,
                Item: marshall({
                    AppToken: tokenData.token,
                    Type: tokenData.type,
                    TTL: TTL,
                    JourneyId: journeyObj.journeyId
                }),
                ConditionExpression: 'attribute_not_exists(AppToken)'
            }
        });
    });

    await dbClient.send(new TransactWriteItemsCommand(params));

    return true;
};

export async function setJourneyLocation(locationData: IJourneyId & IJourneyLocation) {
    const params: UpdateItemCommandInput = {
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

    return true;
};