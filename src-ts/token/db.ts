import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput
} from '@aws-sdk/client-dynamodb';

import {
    marshall,
    unmarshall
} from '@aws-sdk/util-dynamodb';

import { ITokenAuth } from './models';
import { IJourneyId } from '../journey/models';

const AWS_REGION    = process.env.AWS_REGION;
const TOKEN_TABLE   = process.env.TOKEN_TABLE;

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

export async function getToken(tokenObj: ITokenAuth): Promise<ITokenAuth & IJourneyId> {
    const params: GetItemCommandInput = {
        TableName: TOKEN_TABLE,
        Key: marshall({
            AppToken: tokenObj.token,
            Type: tokenObj.type
        })
    };

    const { Item } = await dbClient.send(new GetItemCommand(params));

    if (!Item) {
        return null;
    }

    const parsedItem = unmarshall(Item);

    return {
        journeyId: parsedItem.JourneyId,
        token: parsedItem.AppToken,
        type: parsedItem.Type
    };
};