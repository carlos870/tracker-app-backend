import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';
import { parseJourneyStartInput } from '../journey/models';
import { startJourney } from '../journey/methods';

export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
    try {
        const parsedInput = await parseJourneyStartInput(JSON.parse(event.body));

        console.log(`New [POST] request with [${JSON.stringify(parsedInput)}].`);

        const result = await startJourney(parsedInput);

        return {
            statusCode: HttpCodes.CREATED,
            body: JSON.stringify(result)
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