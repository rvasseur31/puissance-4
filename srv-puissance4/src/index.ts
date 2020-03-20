import express, { NextFunction, Request, Response } from "express";
import bodyParser, { json } from 'body-parser';

export const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "API for instagram clone" });
});

