const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("../src/config/db");
const typeDefs = require("../src/graphql/typeDefs");
const resolvers = require("../src/graphql/resolvers");
const auth = require("../src/middleware/auth");

let handler; // cache between invocations

module.exports = async (req, res) => {
  if (!handler) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // IMPORTANT: make sure auth does NOT block requests with no token
    app.use(auth);

    await connectDB(process.env.MONGODB_URI);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ user: req.user }),
    });

    await server.start();
    server.applyMiddleware({ app, path: "/api/graphql" });

    handler = app;
  }

  return handler(req, res);
};
