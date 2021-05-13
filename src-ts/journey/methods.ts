import CustomError from '../utils/CustomError';

import {
    generateId,
    generateToken
} from '../utils/Generator';

import { ITokenList, TokenTypes } from '../token/models';

import {
    IJourney,
    IJourneyId,
    IJourneyInput,
    IJourneyLocation,
    Errors
} from './models';

import {
    getJourneyData,
    terminateJourney,
    addNewJourney,
    setJourneyLocation,
    DbErrors
} from './db';

export async function getJourney(data: IJourneyId) {
    const { journeyId } = data;

    const result = await getJourneyData(journeyId);

    if (result === null) {
        throw new CustomError(Errors.NOT_FOUND);
    }

    console.log(`Returning journey [${JSON.stringify(result)}].`);

    return result;
};

export async function stopJourney(data: IJourneyId) {
    const { journeyId } = data;
    const stopDate = new Date();

    try {
        await terminateJourney(journeyId, stopDate);
    } catch (err) {
        if (err.name === DbErrors.ConditionalCheckFailedException) {
            throw new CustomError(Errors.NOT_FOUND);
        }

        throw err;
    }

    console.log(`Journey [${journeyId}] successfully stopped.`);

    return true;
};

export async function startJourney(data: IJourneyInput) {
    const journeyId = generateId();

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + data.ttl);

    const journeyObj: IJourney & ITokenList = {
        journeyId: journeyId,
        description: data.description,
        startDate: new Date(),
        expireDate: expireDate,
        tokens: [
            {
                token: generateToken(journeyId, data.accessCode, Math.random().toString()),
                type: TokenTypes.management
            },
            {
                token: generateToken(journeyId, data.accessCode),
                type: TokenTypes.access
            }
        ]
    };

    await addNewJourney(journeyObj);

    console.log(`Journey [${journeyId}] successfully started with config [${JSON.stringify(journeyObj)}].`);

    return journeyObj;
};

export async function updateLocation(data: IJourneyId & IJourneyLocation) {
    const { journeyId, latitude, longitude } = data;

    try {
        await setJourneyLocation(data);
    } catch (err) {
        if (err.name === DbErrors.ConditionalCheckFailedException) {
            throw new CustomError(Errors.NOT_FOUND);
        }

        throw err;
    }

    console.log(`Journey [${journeyId}] successfully updated with position [${latitude} / ${longitude}].`);

    return true;
};