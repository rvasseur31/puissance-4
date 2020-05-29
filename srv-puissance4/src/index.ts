import "reflect-metadata";
import { createConnection } from "typeorm";
import express from 'express';
import { factory } from "./utils/ConfigLog4j";
import { RootController } from './controllers/root.controller';
import { errorMiddleware } from './middlewares/error.middleware';
import * as http from "http";
import { SocketServer } from './SocketServer';

createConnection({
    "type": "mysql",
    "host": "remotemysql.com",
    "port": 3306,
    "username": "pYt5j8LscQ",
    "password": "H4aexHC0AF",
    "database": "pYt5j8LscQ",
    "entities": [
        "dist/src/entities/*.entity.js"
    ],
    synchronize: true
}).then(async connection => {
    /**
     * Logger.
     */
    const LOGGER = factory.getLogger("Server.ts");

    /**
     * App object using express.
     */
    const app = express();

    /**
     * Port used to reach server.
     */
    const port = process.env.PORT || 3000;

    app.use(function (req, res, next) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Pass to next layer of middleware
        next();
    });

    /**
     * Size limit specification.
     */
    app.use(express.json({ limit: "50mb" }));

    /**
     * Encoding specifications.
     */
    app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

    /**
     * Middleware to use the api.
     */
    app.use('/api', RootController);

    /**
     * Middleware called when error raised.
     */
    app.use(errorMiddleware);

    /**
     * Create http server.
     */
    const server = http.createServer(app);

    SocketServer.getInstance(server);

    /**
     * Server starting.
     * Listening on port specified.
     */
    server.listen(process.env.PORT || port, () => {
        LOGGER.info(`Server is listening on ${port}`);
    });
}).catch(error => console.log("TypeORM connection error: ", error));