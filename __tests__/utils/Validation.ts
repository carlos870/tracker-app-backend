import Joi from 'joi';

import Validation from '../../src-ts/utils/Validation';
import CustomError from '../../src-ts/utils/CustomError';

const testSchema = Joi.object({
    field1: Joi.string().min(5).required()
});

test('Asserts that the validation succeeds when the provided value matches the Joi schema.', async () => {
    const testValue = {
        field1: 'abcdef'
    };

    const result = await Validation(testSchema, testValue);

    expect(result).toHaveProperty('field1', 'abcdef');
});

test('Asserts that the validation fails when the provided value does not match the Joi schema.', async () => {
    const testValue = {
        field2: 'abcdef'
    };

    expect.assertions(1);

    try {
        await Validation(testSchema, testValue);
    } catch (err) {
        expect(err).toBeInstanceOf(CustomError);
    }
});