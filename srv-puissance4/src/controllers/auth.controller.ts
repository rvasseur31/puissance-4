import { Router, Request, Response, NextFunction } from "express";
import { UserManagementService } from "../services/UserManagementService";
import { factory } from "../utils/ConfigLog4j"
import { CustomResponse } from '../utils/CustomResponse';
import { EStatus } from '../types/EStatus';
import { ECode } from "../types/ECode";
import { ParamError } from '../errors/ParamError';
import { InternalError } from '../errors/InternalError';

/**
 * Logger.
 */
const LOGGER = factory.getLogger("AuthController.ts");

/**
 * Auth controller router.
 */
export const AuthController = Router();

/**
 * Login route.
 */
AuthController.post('/login', (req: Request, res: Response, next: NextFunction) => {
    LOGGER.debug("login route");
    let customResponse: CustomResponse;
    if (req.body.email && req.body.password) {
        UserManagementService.getInstance().login(req.body.email, req.body.password).then(user => {
            customResponse = new CustomResponse(EStatus.SUCCESS, ECode.OK, "User successfully logged", user);
            res.send(customResponse);
        }).catch(error => {
            next(error);
        });
    } else {
        next(new ParamError('Email and password have to be specified'));
    }
});

/**
 * Register route.
 */
AuthController.post('/register', (req: Request, res: Response, next: NextFunction) => {
    LOGGER.debug("subscription route");
    let body: any = req.body;
    if (body.pseudo && body.password && body.email) {
        UserManagementService.getInstance().register(body.email, body.password, body.pseudo).then(user => {
            let customResponse: CustomResponse = new CustomResponse(EStatus.SUCCESS, ECode.CREATED, "user successfully registered", user);
            res.send(customResponse);
        }).catch(error => {
            if (error.errno == 1062) {
                res.send(new CustomResponse(EStatus.FAIL, ECode.BAD_REQUEST, "user already exists in database", error.sqlMessage));
            } else {
                next(new InternalError());
            }
        });
    } else {
        next(new ParamError("All fields has to be filled up to register successfully"));
    }
});