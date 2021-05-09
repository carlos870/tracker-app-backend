import { startJourneyInput, Journey } from './journeyModels';
import { addNewJourney } from './journeyDb';
import { generateId, generateToken } from '../utils/IdGenerator';

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

export {
    startJourney
};