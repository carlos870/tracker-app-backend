interface CustomErrorInput {
    code: string,
    message: string,
    httpStatus: number
}

class CustomError extends Error {
    public code: string;
    public message: string;
    public httpStatus: number;

    constructor(errObj: CustomErrorInput) {
        super(errObj.code);

        this.code = errObj.code;
        this.message = errObj.message;
        this.httpStatus = errObj.httpStatus;
    }

    get httpResponse() {
        return {
            statusCode: this.httpStatus,
            body: JSON.stringify({ code: this.code, message: this.message })
        };
    }
}

export default CustomError;