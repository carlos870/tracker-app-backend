import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';
import { parseJourneyIdInput } from '../journey/models';
import { parseConnectionInput } from '../websocket/models';
import { unregisterConnection } from '../websocket/methods';

/**
 * Handler responsible for processing the websocket disconnection event.
 * 
 * @param event The API Gateway event.
 * @param context The API Gateway request context.
 * @returns An object with the statusCode for the HTTP response.
 */
export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
    try {
        const connectionInput = await parseConnectionInput({
            connectionId: event.requestContext.connectionId
        });

        const journeyInput = await parseJourneyIdInput({
            journeyId: event.requestContext.authorizer.journeyId
        });

        console.log(`New [WS] close connection with [${JSON.stringify({ connectionInput, journeyInput })}].`);

        await unregisterConnection(connectionInput, journeyInput);

        return {
            statusCode: HttpCodes.OK
        };
    } catch (err) {
        if (err instanceof CustomError) {
            console.warn(err.message);

            return err.httpResponse;
        }

        console.error(err.message);

        return {
            statusCode: HttpCodes.INTERNAL_ERROR
        };
    }
};