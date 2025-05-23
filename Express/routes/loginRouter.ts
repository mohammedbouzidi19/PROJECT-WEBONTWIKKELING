import express from "express";
import { UserModel } from "../types";
import { isAuthenticated } from "../middleware/secureMiddleware";
import { login, register } from "../database";


export function loginRouter() {
    const router = express.Router();
    router.get("/login" , async (req, res) => {
        if(req.session.loggedIn && req.session.user) {
            res.redirect("/home");
        } else {
            res.render('login', { currentPage: 'login',title: 'login',  user: req.session.user });
        }
    });

   router.post("/login", async (req, res) => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    try {
        let user: UserModel = await login(username, password);

        // Zet sessie-gegevens
        req.session.user = user;
        req.session.loggedIn = true;

        // Debug info
        console.log("Gebruiker succesvol ingelogd:", user);
        console.log(" Sessie vóór save:", req.session);

        // Zorg dat sessie correct wordt opgeslagen
        req.session.save((err) => {
            if (err) {
                console.error(" Fout bij opslaan van sessie:", err);
                req.session.message = { type: "error", message: "Sessie kon niet worden opgeslagen" };
                return res.redirect("/login");
            }

            req.session.message = { type: "success", message: "Login succesvol" };
            res.redirect("/home");
        });

    } catch (e: any) {
        console.error(" Login fout:", e.message);
        req.session.message = { type: "error", message: e.message };
        res.redirect("/login");
    }
});

        

    router.post("/logout", isAuthenticated, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/login");
        });
    });

    router.get("/register", async (req, res) => {
        res.render('register', { currentPage: 'register',title: 'register',  user: req.session.user });

    });

    router.post("/register", async (req, res) => {
        const username: string = req.body.username;
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            await register(username, email, password);

            req.session.message = {type: "success", message: "Registration successful"};
            res.redirect("/login");
        } catch (e: any) {
            req.session.message = {type: "error", message: e.message};
            res.redirect("/register");
        }

        
    });

    router.post("/logout", isAuthenticated, async (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/login");
    });
});

    return router;

}