import Joi from 'joi';
import Validate from '../utils/Validation';

export enum TokenTypes {
    access = 'access',
    management = 'management'
};

export interface ITokenAuth {
    token: string;
    type: TokenTypes
};

export interface ITokenList {
    tokens: ITokenAuth[]
};

export async function parseTokenAuthInput(value: ITokenAuth) {
    return await Validate<ITokenAuth>(tokenAuthSchema, value);
};

const tokenAuthSchema = Joi.object({
    token: Joi.string().required(),
    type: Joi.string().required()
});