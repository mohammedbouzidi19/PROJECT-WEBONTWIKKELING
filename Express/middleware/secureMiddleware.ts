import { NextFunction, Request, Response } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.loggedIn && req.session.user) {
        return next();
    } else {
        return res.redirect("/login");
    }
}