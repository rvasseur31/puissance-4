import { HttpException } from './HttpException';
import { ECode } from '../types/ECode';

/**
 * Exception called when authentification failed.
 */
export class AuthError extends HttpException {
    /**
     * Constructor.
     * 
     * @param message : response message.
     */
    constructor(message?: string) {
        super(ECode.FORBIDDEN, message);
    }
}