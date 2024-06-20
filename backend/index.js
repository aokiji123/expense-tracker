import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import passport from "passport";
import { GraphQLLocalStrategy, buildContext } from "graphql-passport";


import mergedTypeDefs from "./typeDefs/index.js";
import mergedResolvers from "./resolvers/index.js";
import connectDb from "./db/connectDB.js";
import { configurePassport } from "./passport/passport.js";

dotenv.config();
configurePassport();

const app = express();
const httpServer = http.createServer(app);

const MongoDBStore = connectMongo(session);

const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
});

store.on("error", function (error) {
    console.log(error);
})

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        },
        store,
    })
);

app.use(passport.initialize())
app.use(passport.session())

const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
    '/',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req, res }) => buildContext({ req, res }),
    }),
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDb();

console.log(`🚀 Server ready at http://localhost:4000/`);
