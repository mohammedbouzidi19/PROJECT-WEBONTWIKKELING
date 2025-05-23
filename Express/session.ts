
import { MONGODB_URI } from "./database";
import session, { MemoryStore } from "express-session";
import { FlashMessage, UserModel } from "./types";
import mongoDbSession from "connect-mongodb-session";

import dotenv from "dotenv";
dotenv.config();

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    databaseName: "login-express",
});


export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET ?? "your_secret_key",
    resave: true,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
});

declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean;
        message?: FlashMessage;
        user?: UserModel;
    }
}