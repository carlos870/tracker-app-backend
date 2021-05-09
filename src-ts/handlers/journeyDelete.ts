import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

import { stopJourney } from '../journey/journeyMethods';
import { parseStopJourneyInput } from '../journey/journeyModels';
import HttpCodes from '../utils/HttpCodes';
import CustomError from '../utils/CustomError';

exports.handler = async (event: APIGatewayEvent, context: APIGatewayEventRequestContext) => {
    try {
        const parsedInput = await parseStopJourneyInput({
            journeyId: event.pathParameters.id,
            endDate: new Date()
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