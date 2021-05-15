import Joi from 'joi';
import Validate from '../utils/Validation';

export interface IConnection {
    connectionId: string;
    registerDate?: Date;
};

export interface IMessage {
    connectionId: string;
    data: object;
};

export async function parseConnectionInput(value: IConnection) {
    return await Validate<IConnection>(connectionInputSchema, value);
};

const connectionInputSchema = Joi.object({
    connectionId: Joi.string().required()
});