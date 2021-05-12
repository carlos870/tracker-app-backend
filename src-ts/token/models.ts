import Joi from 'joi';
import { IJourneyId } from '../journey/models';
import Validate from '../utils/Validation';

export interface ITokenAuth {
    managementToken: string;
};

export async function parseTokenAuthInput(value: ITokenAuth & IJourneyId) {
    return await Validate<ITokenAuth & IJourneyId>(tokenAuthSchema, value);
};

const tokenAuthSchema = Joi.object({
    journeyId: Joi.string().min(5).required(),
    managementToken: Joi.string().min(5).required()
});