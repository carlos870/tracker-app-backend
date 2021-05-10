import { startJourneyInput, stopJourneyInput, authJourneyInput, Journey } from './journeyModels';
import { addNewJourney, terminateJourney, validateToken, DbErrors } from './journeyDb';
import { generateId, generateToken } from '../utils/IdGenerator';
import CustomError from '../utils/CustomError';
import Errors from '../utils/Errors';
import * as Policy from '../utils/Policy';

async function startJourney(data: startJourneyInput) {
    const journeyId = generateId();

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + data.ttl);

    const journey: Journey = {
        id: journeyId,
        description: data.description,
        startDate: new Date(),
        expireDate: expireDate,
        managementToken: generateToken(journeyId, data.accessCode)
    };

    await addNewJourney(journey);

    console.log(`Journey [${journeyId}] successfully started with config [${JSON.stringify(journey)}].`);

    return {
        journeyId: journeyId,
        startDate: journey.startDate.toISOString(),
        expireDate: journey.expireDate.toISOString(),
        managementToken: journey.managementToken
    }
}

async function stopJourney(data: stopJourneyInput) {
    const { journeyId, endDate } = data;

    try {
        await terminateJourney(journeyId, endDate);
    } catch (err) {
        if (err.name === DbErrors.ConditionalCheckFailedException) {
            throw new CustomError(Errors.NOT_FOUND);
        }

        throw err;
    }

    console.log(`Journey [${journeyId}] successfully terminated.`);
}

async function authenticateJourney(data: authJourneyInput) {
    const { journeyId, managementToken } = data;

    const tokenData = await validateToken(managementToken);

    if (tokenData === null || journeyId !== tokenData.journeyId) {
        console.warn(`Token [${managementToken}] was not found.`);

        return Policy.deny(managementToken);
    }

    console.log(`Token [${managementToken}] is valid for journey [${journeyId}].`);

    let policy = Policy.allow(managementToken);

    policy.context = {
        journeyId: journeyId
    };

    return policy;
}

export {
    startJourney,
    stopJourney,
    authenticateJourney
};