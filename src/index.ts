import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db";

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  const gqlserver = new ApolloServer({
    typeDefs: `
    type Query {
        hello: String
        users: [User!]!
        user(id: String!): User
    }
    type Mutation {
      createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
      deleteUser(id: String!): Boolean
      updateUser(id: String!, firstName: String!): Boolean 
    }
    type User {
      id: String!
      firstName: String!
    }
    `,
    resolvers: {
      Query: {
        hello: () => `Hey there`,
        user: async (_, { id }) => {
          try {
            const user = await prismaClient.user.findUnique({
              where: { id }
            });
            return user;
          } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
          }
        },
        users: async () => {
          try {
            const users = await prismaClient.user.findMany();
            return users;
          } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
          }
        }
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              email,
              firstName,
              lastName,
              password,
              salt: "random_salt",
            },
          });
          return true;
        },
        deleteUser: async (_, { id }) => {
          try {
            await prismaClient.user.delete({
              where: { id }
            });
            return true;
          } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
          }
        },
        updateUser: async (_, { id, firstName }) => {  // Resolver for updating a movie by ID
          try {
            await prismaClient.user.update({
              where: { id },
              data: {
                firstName
              }
            });
            return true;
          } catch (error) {
            console.error('Error updating movie:', error);
            throw error;
          }
        }
      },
    },
  });
  await gqlserver.start();

  app.get("/", (req, res) => {
    res.json({ message: "seevering" });
  });
  app.use("/graphql", expressMiddleware(gqlserver));

  app.listen(PORT, () => console.log(`server is riu ${PORT}`));
}

init();
