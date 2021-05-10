import HttpCodes from './HttpCodes';

const Errors = {
    INVALID_PARAMS: {
        code: 'InvalidParams',
        message: 'Invalid parameters provided.',
        httpStatus: HttpCodes.BAD_REQUEST
    },
    NOT_FOUND: {
        code: 'NotFound',
        message: 'Resource not found.',
        httpStatus: HttpCodes.NOT_FOUND
    }
};

export default Errors;