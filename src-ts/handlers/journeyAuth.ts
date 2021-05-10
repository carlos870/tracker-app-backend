import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

import { authenticateToken } from '../journey/journeyMethods';
import { parseAuthJourneyInput } from '../journey/journeyModels';
import HttpCodes from '../utils/HttpCodes';

exports.handler = async (event: APIGatewayRequestAuthorizerEvent) => {
    try {
        const parsedInput = await parseAuthJourneyInput({
            journeyId: event.pathParameters.id,
            managementToken: event.headers.Authorization
        });

        console.log(`New [AUTH] request with [${JSON.stringify(parsedInput)}].`);

        const policy = await authenticateToken(parsedInput);

        return policy;
    } catch (err) {
        console.error(err.message);

        return {
            statusCode: HttpCodes.INTERNAL_ERROR
        };
    }
};