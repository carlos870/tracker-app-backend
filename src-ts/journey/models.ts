import Joi from 'joi';
import Validate from '../utils/Validation';
import HttpCodes from '../utils/HttpCodes';
import { ICustomError } from '../utils/CustomError';

export interface IJourneyId {
    journeyId: string;
};

export interface IJourneyLocation {
    latitude: number;
    longitude: number;
    date: Date;
};

export interface IJourney extends IJourneyId {
    description: string;
    startDate: Date;
    expireDate: Date;
    endDate?: Date;
    location?: IJourneyLocation;
};

export interface IJourneyInput {
    accessCode: string;
    description: string;
    ttl: number;
};

export async function parseJourneyIdInput(value: IJourneyId) {
    return await Validate<IJourneyId>(journeyIdSchema, value);
};

export async function parseJourneyStartInput(value: IJourneyInput) {
    return await Validate<IJourneyInput>(journeyStartSchema, value);
};

export async function parseLocationSetInput(value: IJourneyId & IJourneyLocation) {
    return await Validate<IJourneyId & IJourneyLocation>(locationSetSchema, value);
};

const journeyIdSchema = Joi.object({
    journeyId: Joi.string().min(5).required()
});

const journeyStartSchema = Joi.object({
    description: Joi.string(),
    ttl: Joi.number().min(300).max(260000).required(),
    accessCode: Joi.string().min(5).required()
});

const locationSetSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    date: Joi.date().required()
});

const NOT_FOUND: ICustomError = {
    code: 'NotFound',
    message: 'Resource not found.',
    httpStatus: HttpCodes.NOT_FOUND
};

export const Errors = {
    NOT_FOUND
};