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
    latitude?: number;
    longitude?: number;
    updateDate?: Date;
};

export interface getJourneyInput {
    journeyId: string;
}

export interface getJourneyOutput {
    journeyId: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    latitude?: number;
    longitude?: number;
    updateDate?: Date;
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

export interface setLocationInput {
    journeyId: string;
    latitude: number;
    longitude: number;
    date: Date;
}

export interface tokenAuthInput {
    journeyId: string;
    managementToken: string;
}

export interface tokenValidationOutput extends tokenAuthInput { };

export async function parseGetJourneyInput(obj: any): Promise<getJourneyInput> {
    return await validate(getJourneyInputSchema, obj) as getJourneyInput;
}

export async function parseStartJourneyInput(obj: any): Promise<startJourneyInput> {
    return await validate(startJourneyInputSchema, obj) as startJourneyInput;
}

export async function parseStopJourneyInput(obj: any): Promise<stopJourneyInput> {
    return await validate(stopJourneyInputSchema, obj) as stopJourneyInput;
}

export async function parseSetLocationInput(obj: any): Promise<setLocationInput> {
    return await validate(setLocationInputSchema, obj) as setLocationInput;
}

export async function parseTokenAuthInput(obj: any): Promise<tokenAuthInput> {
    return await validate(authTokenInputSchema, obj) as tokenAuthInput;
}

const getJourneyInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
});

const startJourneyInputSchema = Joi.object({
    description: Joi.string(),
    ttl: Joi.number().min(300).max(260000).required(),
    accessCode: Joi.string().min(5).required()
});

const stopJourneyInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    endDate: Joi.date().required()
});

const setLocationInputSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    date: Joi.date().required()
});

const authTokenInputSchema = Joi.object({
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