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
    userAccessCode: string;
    description: string;
    ttl: number;
}

export interface stopJourneyInput {
    journeyId: string;
    endDate: Date;
}

export async function parseStartJourneyInput(obj: any): Promise<startJourneyInput> {
    return await validate(startJourneyInputSchema, obj) as startJourneyInput;
}

export async function parseStopJourneyInput(obj: any): Promise<stopJourneyInput> {
    return await validate(stopJourneyInputSchema, obj) as stopJourneyInput;
}

const startJourneyInputSchema = Joi.object({
    description: Joi.string(),
    ttl: Joi.number().min(300).max(260000).required(),
    userAccessCode: Joi.string().min(5).required()
});

const stopJourneyInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    endDate: Joi.date().required()
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