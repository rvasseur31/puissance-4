import { factory } from "../utils/ConfigLog4j";
import { Helper } from '../utils/Helper';
import { getConnection, EntityManager } from "typeorm";
import { AuthError } from '../errors/AuthError';
import { ParamError } from '../errors/ParamError';
import bcrypt from 'bcrypt';
import { User } from '../entities/User.entity';

/**
 * Logger.
 */
const LOGGER = factory.getLogger("UserManagementService");

/**
 * User management service.
 * Handle all user treatment.
 */
export class UserManagementService {
    /**
     * UserManagementService instance.
     */
    private static INSTANCE: UserManagementService;

    /**
     * User repository.
     */
    private userRepository: EntityManager;

    /**
     * Private constructor.
     */
    private constructor() {
        this.userRepository = getConnection().manager;
    }

    /**
     * Singleton instance accessor.
     */
    public static getInstance(): UserManagementService {
        if (this.INSTANCE == null) {
            this.INSTANCE = new UserManagementService();
        }
        return this.INSTANCE;
    }

    /**
     * shut down the user management service.
     */
    public static shutDownService(): void {
        this.INSTANCE = null;
        LOGGER.info(this.constructor.name + " : shutted down");
    }

    /**
     * Register method.
     * Method to create a new User account.
     * Password chosen by user is hashed using bcrypt before insert it in database.
     *
     * @param emailParam email chosen by user.
     * @param passwordParam  password chosen by user.
     * @param pseudoParam pseudo chosen by user.
     * @param res response to send back to user interface.
     */
    async register(emailParam: string, passwordParam: string, pseudoParam: string) {
        LOGGER.debug(Helper.getInstance().getMethodName() + Helper.getInstance().parameters(arguments));
        try {
            const userToCreate: User = new User(emailParam,
                bcrypt.hashSync(passwordParam, 10), pseudoParam);
            const user: User = await this.userRepository.save(userToCreate);
            user.password = undefined;
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login method .
     * Check if username exists in database.
     * If username exists, password entered by user is compared with hashed password in database.
     *
     * @param emailParam : User's pseudo.
     * @param passwordParam : User's password.
     * @param res response to send back to user interface.
     */
    async login(emailParam: string, passwordParam: string) {
        LOGGER.debug(Helper.getInstance().getMethodName() + Helper.getInstance().parameters(arguments));
        if (Helper.getInstance().validateEmail(emailParam)) {
            let user: User = await this.userRepository.findOne(User, { email: emailParam });
            if (user) {
                try {
                    if (bcrypt.compareSync(passwordParam, user.password)) {
                        user.password = undefined;
                        return user;
                    } else {
                        throw new AuthError("Password doesn't match");
                    }
                } catch (error) {
                    throw error;
                }
            } else {
                throw new AuthError("Email doesn't exist in database");
            }
        } else {
            throw new ParamError("Wrong email format");
        }
    }
}
