import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

import HttpCodes from '../utils/HttpCodes';
import { parseJourneyIdInput } from '../journey/models';
import { parseTokenAuthInput, TokenTypes } from '../token/models';
import { validateToken } from '../token/methods';

/**
 * Handler responsible for processing the authentication middleware.
 * 
 * @param event The API Gateway authorizer event.
 * @returns The AWS policy to be associated with this request or an error statusCode.
 */
export async function handler(event: APIGatewayRequestAuthorizerEvent) {
    try {
        let tokenInput = null;
        let journeyInput = null;

        if (event.queryStringParameters?.token) {
            tokenInput = await parseTokenAuthInput({
                token: event.queryStringParameters.token,
                type: TokenTypes.access
            });
        } else {
            tokenInput = await parseTokenAuthInput({
                token: event.headers.Authorization,
                type: TokenTypes.management
            });
        }

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