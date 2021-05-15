import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';
import { parseJourneyIdInput } from '../journey/models';
import { stopJourney } from '../journey/methods';

/**
 * Handler responsible for processing the DELETE journey request.
 * 
 * @param event The API Gateway event.
 * @param context The API Gateway request context.
 * @returns An object with the statusCode for the HTTP response.
 */
export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
    try {
        const parsedInput = await parseJourneyIdInput({
            journeyId: event.pathParameters.id
        });

        console.log(`New [DELETE] request with [${JSON.stringify(parsedInput)}].`);

        await stopJourney(parsedInput);

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