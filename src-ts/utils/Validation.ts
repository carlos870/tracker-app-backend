import Joi from 'joi';
import CustomError, { ICustomError } from './CustomError';
import HttpCodes from './HttpCodes';

export default async function validate<T>(schema: Joi.ObjectSchema, value: T): Promise<T> {
    try {
        const result: T = await schema.validateAsync(value, {
            stripUnknown: true
        });

        return result;
    } catch (err) {

        const invalidParamsError: ICustomError = {
            code: 'InvalidParams',
            message: err.details.map((detail: { message: string }) => detail.message),
            httpStatus: HttpCodes.BAD_REQUEST
        };

        throw new CustomError(invalidParamsError);
    }
};