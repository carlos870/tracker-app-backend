import Joi from 'joi';
import CustomError from '../utils/CustomError';
import Errors from '../utils/Errors';

export interface Journey {
    id: string;
    startDate: Date;
    endDate?: Date;
    expireDate: Date;
    description: string;
    managementToken: string;
};

export interface startJourneyInput {
    accessCode: string;
    description: string;
    ttl: number;
}

export interface stopJourneyInput {
    journeyId: string;
    endDate: Date;
}

export interface authJourneyInput {
    journeyId: string;
    managementToken: string;
}

export interface tokenValidationOutput extends authJourneyInput { };

export async function parseStartJourneyInput(obj: any): Promise<startJourneyInput> {
    return await validate(startJourneyInputSchema, obj) as startJourneyInput;
}

export async function parseStopJourneyInput(obj: any): Promise<stopJourneyInput> {
    return await validate(stopJourneyInputSchema, obj) as stopJourneyInput;
}

export async function parseAuthJourneyInput(obj: any): Promise<authJourneyInput> {
    return await validate(authJourneyInputSchema, obj) as authJourneyInput;
}

const startJourneyInputSchema = Joi.object({
    description: Joi.string(),
    ttl: Joi.number().min(300).max(260000).required(),
    accessCode: Joi.string().min(5).required()
});

const stopJourneyInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    endDate: Joi.date().required()
});

const authJourneyInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    managementToken: Joi.string().min(5).required()
});

async function validate(schema: Joi.ObjectSchema, value: any) {
    try {
        return await schema.validateAsync(value, {
            stripUnknown: true
        });
    } catch (err) {
        throw new CustomError({
            ...Errors.INVALID_PARAMS,
            message: err.details.map((detail: any) => detail.message)
        });
    }
}