import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import { getJourney } from '../journey/journeyMethods';
import { parseGetJourneyInput } from '../journey/journeyModels';
import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';

exports.handler = async (event: APIGatewayEvent, context: APIGatewayEventRequestContext) => {
    try {
        const parsedInput = await parseGetJourneyInput({
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