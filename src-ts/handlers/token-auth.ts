import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import { parseJourneyIdInput } from '../journey/models';
import { parseTokenInput } from '../token/models';
import { validateToken } from '../token/methods';

/**
 * Handler responsible for processing the authentication middleware.
 * 
 * @param event The API Gateway authorizer event.
 * @returns The AWS policy to be associated with this request or an error statusCode.
 */
export async function handler(event: APIGatewayRequestAuthorizerEvent) {
    try {
        const tokenInput = await parseTokenInput({
            token: event.headers?.Authorization || event.queryStringParameters?.token
        });

        let journeyInput = null;

        if (event.pathParameters?.id) {
            journeyInput = await parseJourneyIdInput({
                journeyId: event.pathParameters.id,
            });
        }

        console.log(`New [AUTH] request with [${JSON.stringify({ tokenInput, journeyInput })}].`);

        const policy = await validateToken(tokenInput, journeyInput);

        return policy;
    } catch (err) {
        console.error(err.message);

        return {
            statusCode: HttpCodes.INTERNAL_ERROR
        };
    }
};