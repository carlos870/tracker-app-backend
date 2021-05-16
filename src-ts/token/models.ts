import Joi from 'joi';
import Validate from '../utils/Validation';
import { ICustomError } from '../utils/CustomError';
import HttpCodes from '../utils/HttpCodes';

export enum TokenTypes {
    access = 'access',
    management = 'management'
};

export interface IToken {
    token: string;
};

export interface ITokenAuth extends IToken {
    type: TokenTypes;
};

export interface ITokenList {
    tokens: ITokenAuth[]
};

export async function parseTokenInput(value: IToken) {
    return await Validate<IToken>(tokenSchema, value);
};

const tokenSchema = Joi.object({
    token: Joi.string().required()
});

export function filterTokenAuthContext(event: any): ITokenAuth {
    return {
        token: event.requestContext.authorizer.tokenVal,
        type: event.requestContext.authorizer.tokenType
    };
};

const FORBIDDEN: ICustomError = {
    code: 'Forbidden',
    message: 'Operation not allowed.',
    httpStatus: HttpCodes.FORBIDDEN
};

export const Errors = {
    FORBIDDEN
};