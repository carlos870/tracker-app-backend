import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import { updateLocation } from '../journey/journeyMethods';
import { parseSetLocationInput } from '../journey/journeyModels';
import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';

exports.handler = async (event: APIGatewayEvent, context: APIGatewayEventRequestContext) => {
    try {
        const parsedInput = await parseSetLocationInput({
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