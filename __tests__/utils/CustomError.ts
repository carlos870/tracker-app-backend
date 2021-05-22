import CustomError from '../../src-ts/utils/CustomError';

test('Asserts that the custom error is an instance of the Error object.', () => {
    const myError = new CustomError({
        code: 'MyError',
        message: 'My custom error message.',
        httpStatus: 500
    });

    expect(myError).toBeInstanceOf(Error);
});

test('Asserts that the custom error httpResponse getter matches the Lambda specification.', () => {
    const messageCode = 'MyError';
    const message = 'My custom error message.';
    const httpCode = 400;

    const myError = new CustomError({
        code: messageCode,
        message: message,
        httpStatus: httpCode
    });

    const response = myError.httpResponse;

    expect(response).toHaveProperty('statusCode', httpCode);
    expect(response).toHaveProperty('body');
    expect(typeof response.body).toBe('string');

    const parsedResponse = JSON.parse(response.body);

    expect(parsedResponse).toHaveProperty('code', messageCode);
    expect(parsedResponse).toHaveProperty('message', message);
});