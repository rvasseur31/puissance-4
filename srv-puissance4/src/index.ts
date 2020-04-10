import "reflect-metadata";
import { createConnection } from "typeorm";
import express from 'express';
import { factory } from "./utils/ConfigLog4j";
import { RootController } from './controllers/root.controller';
import { errorMiddleware } from './middlewares/error.middleware';
import * as http from "http";
import { socketConnection } from './controllers/socket.controller';

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection({
    "type": "mysql",
    "host": "remotemysql.com",
    "port": 3306,
    "username": "vCrjHIpYzE",
    "password": "O7pwPcBop3",
    "database": "vCrjHIpYzE",
    "entities": [
        "dist/src/entities/*.js"
    ]
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
    const port = 7070;

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
     * 
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

    /**
     * Pass a http.Server instance to the listen method. 
     */
    const io = require('socket.io').listen(server);

    /**
     * Server starting.
     * Listening on port specified.
     */
    server.listen(port);

    io.on('connection', socketConnection);

    LOGGER.info(`Server listening on port : ${port}`)
}).catch(error => console.log("TypeORM connection error: ", error));