import { startJourneyInput, stopJourneyInput, Journey } from './journeyModels';
import { addNewJourney, terminateJourney, DbErrors } from './journeyDb';
import { generateId, generateToken } from '../utils/IdGenerator';
import CustomError from '../utils/CustomError';
import Errors from '../utils/Errors';

async function startJourney(data: startJourneyInput) {
    const journeyId = generateId();

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + data.ttl);

    const journey: Journey = {
        id: journeyId,
        description: data.description,
        startDate: new Date(),
        expireDate: expireDate,
        managementToken: generateToken(journeyId, data.userAccessCode)
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

export {
    startJourney,
    stopJourney
};