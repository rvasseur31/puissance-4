import { HttpException } from './HttpException';
import { ECode } from '../types/ECode';

/**
 * Error class, handle wrong param in request.
 */
export class ParamError extends HttpException {
    /**
     * Constructor.
     * 
     * @param message 
     * @param code 
     * @param status 
     */
    constructor(message?: string) {
        super(ECode.PRECONDITION_FAILED, message);
    }
}