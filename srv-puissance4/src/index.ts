import "reflect-metadata";
import { createConnection } from "typeorm";
import express from 'express';
import { factory } from "./utils/ConfigLog4j";
import { RootController } from './controllers/root.controller';
import { errorMiddleware } from './middlewares/error.middleware';
import * as http from "http";
import WebSocket from 'ws';

var participants = [];

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
    const port = 3000;

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
    /**
     * Create websocket server.
     */
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: any) => {
        ws.on('message', (message: string) => {
            let json = JSON.parse(message);
            if (json.action == "new-participant") {
                participants.push(json.sender);
                json["participants"] = participants;
                broadcastSocket(JSON.stringify(json));
            } else if (json.action == "participant-left") {
                console.log(json);
                participants = participants.filter(participant => participant !== json.sender);
                json["participants"] = participants;
                ws.close();
                broadcastSocket(JSON.stringify(json));
                console.log("participants : "+participants);
            } else if (json.action == "new-message") {
                broadcastSocket(message);
            }
        });

        ws.on("close", (client:any) => {
            console.log("client : " + client);
            console.log("closed");
        })
    });

    const broadcastSocket = (message: string) => {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    /**
     * Server starting.
     * Listening on port specified.
     */
    server.listen(process.env.PORT || port, () => {
        LOGGER.info(`Server is listening on ${port}`);
    });
}).catch(error => console.log("TypeORM connection error: ", error));