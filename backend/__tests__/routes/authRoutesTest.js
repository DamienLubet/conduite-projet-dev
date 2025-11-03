import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import User from "../../src/models/user.js";
import authRouter from "../../src/routes/authRoutes";

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = express();
    app.use(express.json());
    app.use("/", authRouter);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe("Auth Routes", () => {
    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({ username: "testuser", email: "testuser@example.com", password: "password123" });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("success", true);
        });
    });

    describe("POST /auth/login", () => {
        it("should login an existing user", async () => {
            // First, register the user
            await request(app)
                .post("/auth/register")
                .send({ username: "loginuser", email: "loginuser@example.com", password: "password123" });
            
            // Then, attempt to login
            const res = await request(app)
                .post("/auth/login")
                .send({ email: "loginuser@example.com", password: "password123" });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        });
    });
});