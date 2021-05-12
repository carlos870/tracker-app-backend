export interface ICustomError {
    code: string,
    message: string,
    httpStatus: number
};

export interface ICustomErrorHttpResponse {
    statusCode: number;
    body: string
};

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