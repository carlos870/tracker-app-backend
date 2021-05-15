export interface ICustomError {
    code: string,
    message: string,
    httpStatus: number
};

export interface ICustomErrorHttpResponse {
    statusCode: number;
    body: string
};

/**
 * A class responsible for extending the default Error Object and add new functionality.
 * The added properties are used to facilitate the integration with the Lambda system, and are
 *  related with the 'statusCode' and 'body' props needed to reply to HTTP requests.
 * 
 * This class should be instanciated with an object that implements ICustomError interface.
 */
export default class CustomError extends Error implements ICustomError {
    public readonly code: string;
    public readonly message: string;
    public readonly httpStatus: number;

    constructor(errObj: ICustomError) {
        super(errObj.code);

        this.code = errObj.code;
        this.message = errObj.message;
        this.httpStatus = errObj.httpStatus;
    }

    get httpResponse(): ICustomErrorHttpResponse {
        return {
            statusCode: this.httpStatus,
            body: JSON.stringify({ code: this.code, message: this.message })
        };
    }
};