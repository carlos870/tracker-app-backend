import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput
} from '@aws-sdk/client-dynamodb';

import {
    marshall,
    unmarshall
} from '@aws-sdk/util-dynamodb';

import { IToken, ITokenAuth } from './models';
import { IJourneyId } from '../journey/models';

const AWS_REGION    = process.env.AWS_REGION;
const TOKEN_TABLE   = process.env.TOKEN_TABLE;

const dbClient = new DynamoDBClient({
    region: AWS_REGION
});

/**
 * Fetches the provided token from the DynamoDB Tokens table. 
 * 
 * @param tokenObj The token data.
 * @returns Returns an object with the token attributes or null if not found.
 */
export async function getToken(tokenObj: IToken): Promise<ITokenAuth & IJourneyId> {
    const params: GetItemCommandInput = {
        TableName: TOKEN_TABLE,
        Key: marshall({
            AppToken: tokenObj.token
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