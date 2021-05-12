import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';
import { parseLocationSetInput } from '../journey/models';
import { updateLocation } from '../journey/methods';

export async function handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext) {
    try {
        const parsedInput = await parseLocationSetInput({
            ...JSON.parse(event.body),
            journeyId: event.pathParameters.id
        });

        console.log(`New [PUT] request with [${JSON.stringify(parsedInput)}].`);

        await updateLocation(parsedInput);

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