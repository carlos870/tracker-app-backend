import { ITokenAuth } from './models';
import { IJourneyId } from '../journey/models';
import { getToken } from './db';
import Policy, { Effect } from '../utils/Policy';

export async function validateToken(tokenObj: ITokenAuth, journey?: IJourneyId) {
    const { token, type } = tokenObj;

    const tokenResult = await getToken(tokenObj);

    if (tokenResult === null) {
        console.warn(`Token [${token}] of type [${type}] was not found.`);

        return Policy(token, Effect.deny);
    }

    if (journey && journey.journeyId !== tokenResult.journeyId) {
        console.warn(`Token [${token}] of type [${type}] belongs to another journey.`);

        return Policy(token, Effect.deny);
    }

    console.log(`Token [${token}] of type [${type}] is valid for journey [${tokenResult.journeyId}].`);

    let policy = Policy(token, Effect.allow);

    policy.context = {
        journeyId: tokenResult.journeyId,
        tokenType: type
    };

    return policy;
};