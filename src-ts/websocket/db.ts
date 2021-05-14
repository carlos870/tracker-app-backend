import {
    DynamoDBClient,
    TransactWriteItemsCommand,
    TransactWriteItemsCommandInput
} from '@aws-sdk/client-dynamodb';

import {
    marshall
} from '@aws-sdk/util-dynamodb';

import { IConnection } from './models';
import { IJourneyId } from '../journey/models';

const AWS_REGION        = process.env.AWS_REGION;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const JOURNEY_TABLE     = process.env.JOURNEY_TABLE;

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

export async function addNewConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    const params: TransactWriteItemsCommandInput = {
        TransactItems: [
            {
                Put: {
                    TableName: CONNECTIONS_TABLE,
                    Item: marshall({
                        ConnectionId: connectionObj.connectionId,
                        JourneyId: journeyObj.journeyId,
                        RegisterDate: connectionObj.registerDate.toISOString()
                    }),
                    ConditionExpression: 'attribute_not_exists(ConnectionId)',
                }
            },
            {
                Update: {
                    TableName: JOURNEY_TABLE,
                    Key: marshall({
                        JourneyId: journeyObj.journeyId
                    }),
                    ConditionExpression: 'attribute_exists(JourneyId)',
                    UpdateExpression: 'ADD ConnectionIDs :con',
                    ExpressionAttributeValues: {
                        ":con": {
                            "SS": [
                                connectionObj.connectionId
                            ]
                        }
                    }
                }
            }
        ]
    };

    await dbClient.send(new TransactWriteItemsCommand(params));

    return true;
};

export async function removeConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    const params: TransactWriteItemsCommandInput = {
        TransactItems: [
            {
                Delete: {
                    TableName: CONNECTIONS_TABLE,
                    Key: marshall({
                        ConnectionId: connectionObj.connectionId
                    })
                }
            },
            {
                Update: {
                    TableName: JOURNEY_TABLE,
                    Key: marshall({
                        JourneyId: journeyObj.journeyId
                    }),
                    ConditionExpression: 'attribute_exists(JourneyId)',
                    UpdateExpression: 'DELETE ConnectionIDs :con',
                    ExpressionAttributeValues: {
                        ":con": {
                            "SS": [
                                connectionObj.connectionId
                            ]
                        }
                    }
                }
            }
        ]
    };

    await dbClient.send(new TransactWriteItemsCommand(params));

    return true;
};