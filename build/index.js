"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const PORT = Number(process.env.PORT) || 3000;
        app.use(express_1.default.json());
        const gqlserver = new server_1.ApolloServer({
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
                    user: (_1, _a) => __awaiter(this, [_1, _a], void 0, function* (_, { id }) {
                        return prisma.user.findUnique({
                            where: { id },
                            include: {
                                posts: true
                            }
                        });
                    }),
                    users: () => __awaiter(this, void 0, void 0, function* () {
                        return prisma.user.findMany({
                            include: {
                                posts: true
                            }
                        });
                    }),
                    post: (_2, _b) => __awaiter(this, [_2, _b], void 0, function* (_, { id }) {
                        return prisma.post.findUnique({
                            where: { id }
                        });
                    }),
                    posts: () => __awaiter(this, void 0, void 0, function* () {
                        return prisma.post.findMany();
                    })
                },
                Mutation: {
                    createUser: (_3, _c) => __awaiter(this, [_3, _c], void 0, function* (_, { firstName, lastName, email, password }) {
                        return prisma.user.create({
                            data: {
                                firstName,
                                lastName,
                                email,
                                password,
                            },
                        });
                    }),
                    updateUser: (_4, _d) => __awaiter(this, [_4, _d], void 0, function* (_, { id, firstName, lastName, email, password }) {
                        return prisma.user.update({
                            where: { id },
                            data: {
                                firstName,
                                lastName,
                                email,
                                password
                            },
                        });
                    }),
                    deleteUser: (_5, _e) => __awaiter(this, [_5, _e], void 0, function* (_, { id }) {
                        prisma.post.delete({
                            where: { id: id }
                        });
                        return prisma.user.delete({
                            where: { id }
                        });
                    }),
                    createPost: (_6, _f) => __awaiter(this, [_6, _f], void 0, function* (_, { title, content, userId }) {
                        return prisma.post.create({
                            data: {
                                title,
                                content,
                                author: {
                                    connect: { id: userId }
                                }
                            },
                        });
                    }),
                    updatePost: (_7, _g) => __awaiter(this, [_7, _g], void 0, function* (_, { id, title, content }) {
                        return prisma.post.update({
                            where: { id },
                            data: {
                                title,
                                content
                            },
                        });
                    }),
                    deletePost: (_8, _h) => __awaiter(this, [_8, _h], void 0, function* (_, { id }) {
                        return prisma.post.delete({
                            where: { id }
                        });
                    })
                },
            },
        });
        yield gqlserver.start();
        app.get("/", (req, res) => {
            res.json({ message: "Working" });
        });
        app.use("/graphql", (0, express4_1.expressMiddleware)(gqlserver));
        app.listen(PORT, () => console.log(`server live at ${PORT}`));
    });
}
init();
