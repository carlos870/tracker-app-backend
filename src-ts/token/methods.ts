import { IToken, ITokenAuth, TokenTypes, Errors } from './models';
import { IJourneyId } from '../journey/models';
import { getToken } from './db';
import Policy, { Effect } from '../utils/Policy';
import CustomError from '../utils/CustomError';

/**
 * Checks if the provided token is valid, returning an AWS policy document with the validation result.  
 * 
 * @param tokenObj The token to be validated.
 * @param journey The journey associated with the token. It's optional.
 * @returns The AWS policy to be used for requests having this token.
 */
export async function validateToken(tokenObj: IToken, journey?: IJourneyId) {
    const { token } = tokenObj;

    const tokenResult = await getToken(tokenObj);

    if (tokenResult === null) {
        console.warn(`Token [${token}] not found.`);

        return Policy(token, Effect.deny);
    }

    if (journey && journey.journeyId !== tokenResult.journeyId) {
        console.warn(`Token [${token}] belongs to another journey.`);

        return Policy(token, Effect.deny);
    }

    console.log(`Token [${token}] of type [${tokenResult.type}] is valid for journey [${tokenResult.journeyId}].`);

    let policy = Policy(token, Effect.allow);

    policy.context = {
        journeyId: tokenResult.journeyId,
        tokenVal: token,
        tokenType: tokenResult.type
    };

    return policy;
};

/**
 * Checks if the provided token contains the operation scope.
 * 
 * @param tokenObj The token data.
 * @param requiredScope The scope being checked on the token object.
 * @returns A boolean when the token is allowed or a CustomError when is not allowed.
 */
export async function validateScope(tokenObj: ITokenAuth, requiredScope: TokenTypes) {
    if (tokenObj.type === requiredScope) {
        return true;
    }

    console.warn(`The token [${tokenObj.token}] does not allow for the required [${requiredScope}] operation.`);

    throw new CustomError(Errors.FORBIDDEN);
};