import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      posts: [Post!]!
      post(id: String!): Post
    }
    type Mutation {
      createUser(firstName: String!, lastName: String!, email: String!, password: String!): User!
      updateUser(id: String!, firstName: String!, lastName: String, email: String, password: String): User!
      deleteUser(id: String!): User
      createPost(title: String!, content: String!, userId: String!): Post!
      updatePost(id: String!, title: String!, content: String!): Post!
      deletePost(id: String!): Post
    }
    type User {
      id: String!
      firstName: String!
      lastName: String
      email: String!
      posts: [Post!]!
    }
    type Post {
      id: String!
      title: String!
      content: String!
      author: User!
    }
    `,
    resolvers: {
      Query: {
        hello: () => `Hey there`,
        user: async (_, { id }) => {
          return prisma.user.findUnique({
            where: { id },
            include: {
              posts : true
            }
          });
        },
        users: async () => {
          return prisma.user.findMany({
            include: {
              posts : true
            }
          });
        },
        post: async (_, { id }) => {
          return prisma.post.findUnique({
            where: { id }
          });
        },
        posts: async () => {
          return prisma.post.findMany();
        }
      },
      Mutation: {
        createUser: async (_, { firstName, lastName, email, password }) => {
          return prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              password,
            },
          });
        },
        updateUser: async (_, { id, firstName, lastName, email, password }) => {
          return prisma.user.update({
            where: { id },
            data: {
              firstName,
              lastName,
              email,
              password
            },
          });
        },
        deleteUser: async (_, { id }) => {

          prisma.post.delete({
            where: { id: id }
          })

          return prisma.user.delete({
            where: { id }
          });
        },
        createPost: async (_, { title, content, userId }) => {
          return prisma.post.create({
            data: {
              title,
              content,
              author: {
                connect: { id: userId }
              }
            },
          });
        },
        updatePost: async (_, { id, title, content }) => {
          return prisma.post.update({
            where: { id },
            data: {
              title,
              content
            },
          });
        },
        deletePost: async (_, { id }) => {
          return prisma.post.delete({
            where: { id }
          });
        }
      },
    },
  });
  await gqlserver.start();

  app.get("/", (req, res) => {
    res.json({ message: "Working" });
  });
  app.use("/graphql", expressMiddleware(gqlserver));

  app.listen(PORT, () => console.log(`server live at ${PORT}`));
}

init();
