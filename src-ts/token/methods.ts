import { ITokenAuth } from './models';
import { IJourneyId } from '../journey/models';
import { getToken } from './db';
import Policy, { Effect } from '../utils/Policy';

export async function validateToken(data: ITokenAuth & IJourneyId) {
    const { journeyId, managementToken } = data;

    const tokenData = await getToken(managementToken);

    if (tokenData === null || journeyId !== tokenData.journeyId) {
        console.warn(`Token [${managementToken}] was not found.`);

        return Policy(managementToken, Effect.deny);
    }

    console.log(`Token [${managementToken}] is valid for journey [${journeyId}].`);

    let policy = Policy(managementToken, Effect.allow);

    policy.context = {
        journeyId: journeyId
    };

    return policy;
};