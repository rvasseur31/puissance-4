import { HttpException } from './HttpException';
import { ECode } from '../types/ECode';

/**
 * Internal Error.
 */
export class InternalError extends HttpException {
    /**
     * Constructor.
     */
    constructor() {
        super(ECode.INTERNAL_SERVER_ERROR, "Internal error");
    }
}