import HttpCodes from './HttpCodes';

const Errors = {
    INVALID_PARAMS: {
        code: 'InvalidParams',
        message: 'Invalid parameters provided.',
        httpStatus: HttpCodes.BAD_REQUEST
    }
};

export default Errors;