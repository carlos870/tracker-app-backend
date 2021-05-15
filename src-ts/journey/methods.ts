import CustomError from '../utils/CustomError';

import {
    generateId,
    generateToken
} from '../utils/Generator';

import { publishNotification } from '../websocket/methods';
import { IMessage } from '../websocket/models';

import {
    ITokenList,
    TokenTypes
} from '../token/models';

import {
    IJourney,
    IJourneyId,
    IJourneyInput,
    IJourneyLocation,
    IJourneyConnections,
    Errors
} from './models';

import {
    getJourneyData,
    terminateJourney,
    addNewJourney,
    setJourneyLocation,
    DbErrors
} from './db';

/**
 * Fetches the journey data associated with the provided journey ID.
 * When the journey is not found, a CustomError is thrown. 
 * 
 * @param data The journey ID.
 * @returns The journey data.
 */
export async function getJourney(data: IJourneyId) {
    const { journeyId } = data;

    const result = await getJourneyData(journeyId);

    if (result === null) {
        throw new CustomError(Errors.NOT_FOUND);
    }

    console.log(`Returning journey [${JSON.stringify(result)}].`);

    return result;
};

/**
 * Starts a new journey with the provided data.
 * The journey ID and access/management tokens are generated and saved.
 * 
 * @param data The basic journey data provided by the user.
 * @returns The full journey data.
 */
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

/**
 * Stops the provided journey ID.
 * The journey it's setted as ended, and a notification is sent 
 *  to all active websockets listening to this journey's events.
 * 
 * @param data The journey ID.
 */
export async function stopJourney(data: IJourneyId) {
    const { journeyId } = data;
    const stopDate = new Date();

    let connections: IJourneyConnections = null;

    try {
        connections = await terminateJourney(journeyId, stopDate);
    } catch (err) {
        if (err.name === DbErrors.ConditionalCheckFailedException) {
            throw new CustomError(Errors.NOT_FOUND);
        }

        throw err;
    }

    console.log(`Journey [${journeyId}] successfully stopped.`);

    for (const connId of connections.connectionIds) {
        await publishNotification({
            connectionId: connId,
            data: {
                journeyId: journeyId,
                endDate: stopDate
            }
        } as IMessage);
    }

    return true;
};

/**
 * Updates current geolocation of the provided journey.
 * A notification is sent to all active websockets listening to this journey's events.
 * 
 * @param data The journey geolocation data.
 */
export async function updateLocation(data: IJourneyId & IJourneyLocation) {
    const { journeyId, latitude, longitude } = data;

    let connections: IJourneyConnections = null;

    try {
        connections = await setJourneyLocation(data);
    } catch (err) {
        if (err.name === DbErrors.ConditionalCheckFailedException) {
            throw new CustomError(Errors.NOT_FOUND);
        }

        throw err;
    }

    console.log(`Journey [${journeyId}] successfully updated with position [${latitude} / ${longitude}].`);

    for (const connId of connections.connectionIds) {
        await publishNotification({
            connectionId: connId,
            data: data
        } as IMessage);
    }

    return true;
};