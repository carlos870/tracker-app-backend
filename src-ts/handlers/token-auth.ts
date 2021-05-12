import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import { parseTokenAuthInput } from '../token/models';
import { validateToken } from '../token/methods';

export async function handler(event: APIGatewayRequestAuthorizerEvent) {
    try {
        const parsedInput = await parseTokenAuthInput({
            journeyId: event.pathParameters.id,
            managementToken: event.headers.Authorization
        });

        console.log(`New [AUTH] request with [${JSON.stringify(parsedInput)}].`);

        const policy = await validateToken(parsedInput);

        return policy;
    } catch (err) {
        console.error(err.message);

        return {
            statusCode: HttpCodes.INTERNAL_ERROR
        };
    }
};