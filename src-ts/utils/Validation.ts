import Joi from 'joi';
import CustomError, { ICustomError } from './CustomError';
import HttpCodes from './HttpCodes';

/**
 * Validates the provided 'value' parameter using the rules provided in the Joi schema.
 * Throws a CustomError if the validation fails.
 * 
 * @param schema The Joi schema to be used.
 * @param value The value matched agains the schema.
 * @returns The valid data, stripped of any attributes not present in the schema.
 */
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