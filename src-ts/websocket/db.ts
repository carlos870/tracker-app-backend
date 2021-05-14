import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
    DeleteItemCommand,
    DeleteItemCommandInput
} from '@aws-sdk/client-dynamodb';

import {
    marshall
} from '@aws-sdk/util-dynamodb';

import { IConnection } from './models';
import { IJourneyId } from '../journey/models';

const AWS_REGION        = process.env.AWS_REGION;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

export async function addNewConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    const params: PutItemCommandInput = {
        TableName: CONNECTIONS_TABLE,
        Item: marshall({
            ConnectionId: connectionObj.connectionId,
            JourneyId: journeyObj.journeyId,
            RegisterDate: connectionObj.registerDate.toISOString()
        })
    };

    await dbClient.send(new PutItemCommand(params));

    return true;
};

export async function removeConnection(connectionObj: IConnection) {
    const params: DeleteItemCommandInput = {
        TableName: CONNECTIONS_TABLE,
        Key: marshall({
            ConnectionId: connectionObj.connectionId
        })
    };

    await dbClient.send(new DeleteItemCommand(params));

    return true;
};