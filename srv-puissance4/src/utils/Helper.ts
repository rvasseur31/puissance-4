import { ITokenData } from '../types/ITokenData';
import { IDataStoredInToken } from '../types/IDataStoredInToken';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User.entity';

export class Helper {
    /**
     * Helper instance.
     */
    private static INSTANCE: Helper;

    /**
     * Singleton instance accessor.
     */
    public static getInstance(): Helper {
        if (this.INSTANCE == null) {
            this.INSTANCE = new Helper();
        }
        return this.INSTANCE;
    }

    /**
     * Return the current method name.
     */
    public getMethodName(): string {
        let err = new Error();
        if (/at \w+\.(\w+)/.exec(err.stack.split('\n')[2]) != null) {
            return /at \w+\.(\w+)/.exec(err.stack.split('\n')[2])[1] // we want the 2nd method in the call stack
        } else {
            return "method not found";
        }
    }
    
    /**
     * Check if current parameter match email adress regex.
     * @param email email to validate.
     */
    public validateEmail(email: string): boolean {
        let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }

    /**
     * Print all function parameters.
     * @param parameters : arguments
     */
    public parameters(parameters: any) {
        let stringParameters = " [ params : ";
        for (let index = 0; index < parameters.length; index++) {
            stringParameters += parameters[index] + ", ";
        }
        return stringParameters + " ] ";
    }
}