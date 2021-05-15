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
    unmarshall,
    convertToNative
} from '@aws-sdk/util-dynamodb';

import { IJourney, IJourneyId, IJourneyLocation, IJourneyConnections } from './models';
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

/**
 * Fetches the journey data associated with the provided journey ID from the DynamoDB Journeys table. 
 * 
 * @param journeyId The journey ID.
 * @returns The journey data, or null if was not found.
 */
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

/**
 * Registers a new journey in the DynamoDB Journeys and Tokens tables. 
 * 
 * @param journeyObj The data to be registered.
 */
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

/**
 * Terminates the provided journey, setting it's end date in the DynamoDB Journeys table.
 * 
 * @param journeyId The journey ID.
 * @param endDate The date to be registered.
 * @returns Returns the active websocket connections associated with this journey. 
 */
export async function terminateJourney(journeyId: string, endDate: Date): Promise<IJourneyConnections> {
    const params: UpdateItemCommandInput = {
        TableName: JOURNEY_TABLE,
        Key: marshall({
            JourneyId: journeyId
        }),
        ConditionExpression: 'attribute_exists(JourneyId) AND attribute_not_exists(EndDate)',
        UpdateExpression: 'SET EndDate = :endDate',
        ExpressionAttributeValues: marshall({
            ":endDate": endDate.toISOString()
        }),
        ReturnValues: 'ALL_NEW'
    };

    const { Attributes } = await dbClient.send(new UpdateItemCommand(params));

    return {
        connectionIds: Attributes.ConnectionIDs && convertToNative(Attributes.ConnectionIDs) || new Set()
    };
};

/**
 * Updates the provided journey's location, setting it's geolocation attributes in the DynamoDB Journeys table.
 * 
 * @param locationData The journey location data.
 * @returns Returns the active websocket connections associated with this journey. 
 */
export async function setJourneyLocation(locationData: IJourneyId & IJourneyLocation): Promise<IJourneyConnections> {
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
        }),
        ReturnValues: 'ALL_NEW'
    };

    const { Attributes } = await dbClient.send(new UpdateItemCommand(params));

    return {
        connectionIds: Attributes.ConnectionIDs && convertToNative(Attributes.ConnectionIDs) || new Set()
    };
};