import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userRouter from "../../src/routes/userRoutes.js";
import authRouter from '../../src/routes/authRoutes.js';
import projectRouter from '../../src/routes/projectRoutes.js';

let mongoServer;
let app;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = express();
    app.use(express.json());
    app.use("/", authRouter);
    app.use("/", projectRouter);
    app.use("/", userRouter);

    await request(app)
        .post("/auth/register")
        .send({ username: "testuser", email: "testuser@example.com", password: "password" });
    const res = await request(app)
        .post("/auth/login")
        .send({ email: "testuser@example.com", password: "password" });
    token = res.body.data.token;

    await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "User Project" });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("User Routes", () => {
    describe("GET /user/projects", () => {
        it("should retrieve projects for the authenticated user", async () => {
            const res = await request(app)
                .get("/user/projects")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("projects");
            expect(Array.isArray(res.body.projects)).toBe(true);
            expect(res.body.projects.length).toBe(1);
            expect(res.body.projects[0].name).toBe("User Project");
        });
    });
});