import { IConnection } from './models';
import { IJourneyId } from '../journey/models';
import { addNewConnection, removeConnection } from './db';

export async function registerConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    const newConnectionObj: IConnection = {
        ...connectionObj,
        registerDate: new Date()
    };

    await addNewConnection(newConnectionObj, journeyObj);

    console.log(`Connection [${connectionObj.connectionId}] registered for journey [${journeyObj.journeyId}].`);

    return true;
};

export async function unregisterConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    await removeConnection(connectionObj);

    console.log(`Connection [${connectionObj.connectionId}] unregistered from journey [${journeyObj.journeyId}].`);

    return true;
};