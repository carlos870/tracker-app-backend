import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';
import { parseJourneyGetInput } from '../journey/models';
import { getJourney } from '../journey/methods';

export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
    try {
        const parsedInput = await parseJourneyGetInput({
            journeyId: event.pathParameters.id
        });

        console.log(`New [GET] request with [${JSON.stringify(parsedInput)}].`);

        const result = await getJourney(parsedInput);

        return {
            statusCode: HttpCodes.OK,
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