import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Project from "../../src/models/project.js";
import authRouter from "../../src/routes/authRoutes.js";
import projectRouter from "../../src/routes/projectRoutes.js";
import userstoryRouter from "../../src/routes/userstoryRoutes.js";

let mongoServer;
let app;
let token;
let projectId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = express();
    app.use(express.json());
    app.use("/", authRouter);
    app.use("/", projectRouter);
    app.use("/", userstoryRouter);

    // Register and login a user to get a token
    await request(app)
        .post("/auth/register")
        .send({ username: "testuser", email: "testuser@example.com", password: "password" });
    const res = await request(app)
        .post("/auth/login")
        .send({ email: "testuser@example.com", password: "password" });
    token = res.body.data.token;
    
    // Create a project to associate user stories with
    const projectRes = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Project" });
    projectId = await Project.findOne({ name: "Test Project" }).then(proj => proj._id);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await mongoose.connection.collection('userstories').deleteMany({});
});

describe("UserStory Routes", () => {
    describe("POST /projects/:projectId/userstories", () => {
        it("should create a new user story", async () => {
            const res = await request(app)
                .post(`/projects/${projectId}/userstories`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Integration Test Story",
                    description: "This is a test user story",
                    priority: "High",
                    storyPoints: 8
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("message", "User story created successfully.");
        });
    });

    describe("Route protection", () => {
        it("should deny access to create user story without token", async () => {
            const res = await request(app)
                .post(`/projects/${projectId}/userstories`)
                .send({
                    title: "Integration Test Story",
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Authorization header missing");
        });
    });
});