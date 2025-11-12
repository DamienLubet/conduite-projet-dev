import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Project from "../../src/models/project.js";
import authRouter from "../../src/routes/authRoutes.js";
import projectRouter from "../../src/routes/projectRoutes.js";

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

    // Register and login a user to get a token
    await request(app)
        .post("/auth/register")
        .send({ username: "testuser", email: "testuser@example.com", password: "password" });
    const res = await request(app)
        .post("/auth/login")
        .send({ email: "testuser@example.com", password: "password" });
    token = res.body.data.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Project.deleteMany({});
});

describe("Project Routes", () => {
    describe("POST /projects", () => {
        it("should create a new project", async () => {
            const res = await request(app)
                .post("/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Integration Project" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("success", true);
        });
    });
    
    describe("Route protection", () => {
        it("should deny access to create project without token", async () => {
            const res = await request(app)
                .post("/projects")
                .send({ name: "No Auth Project" });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("success", false);
        });
    });
});

