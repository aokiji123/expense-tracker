import passport from "passport";
import bcrypt from "bcryptjs";
import { GraphQLLocalStrategy } from "graphql-passport";

import User from "../models/user.model.js";

export const configurePassport = () => {
    passport.serializeUser((user, done) => {
        console.info("Serializing user")
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        console.info("Deserializing user")
        try {
            const user = User.findById(id)
            done(null, user);
        } catch (e) {
            done(e);
        }
    })

    passport.use(
        new GraphQLLocalStrategy(async (username, password, done) => {
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    throw new Error("User not found");
                }
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    throw new Error("Invalid password");
                }
                done(null, user);
            } catch (e) {
                done(e);
            }
        }
    ))
}
