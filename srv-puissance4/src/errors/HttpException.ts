export class HttpException extends Error {
    /**
     * Http status code.
     */
    status: number;

    /**
     * Error message.
     */
    message: string;

    /**
     * Constructor.
     * 
     * @param status : Http status code.
     * @param message : Error message
     */
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}