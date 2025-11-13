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
    
    describe("GET /projects/:id", () => {
        it("should retrieve a project by ID", async () => {
            // First, create a project
            await request(app)
                .post("/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Integration Project" });
            const projectId = (await Project.findOne({ name: "Integration Project" }))._id;
            // Now, retrieve the project
            const getRes = await request(app)
                .get(`/projects/${projectId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.statusCode).toBe(200);
            expect(getRes.body).toHaveProperty("success", true);
            expect(getRes.body.project).toHaveProperty("name", "Integration Project");
        });
    });

    describe("PUT /projects/:id", () => {
        it("should update a project by ID", async () => {
            await request(app)
                .post("/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Integration Project" });
            const projectId = (await Project.findOne({ name: "Integration Project" }))._id;

            const editRes = await request(app)
                .put(`/projects/${projectId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Updated Project Name" });
            expect(editRes.statusCode).toBe(200);
            expect(editRes.body).toHaveProperty("success", true);

            // Verify update
            const getRes = await request(app)
                .get(`/projects/${projectId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.body.project).toHaveProperty("name", "Updated Project Name");
        });
    });

    describe("DELETE /projects/:id", () => {
        it("should delete a project by ID", async () => {
            await request(app)
                .post("/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Integration Project" });
            const projectId = (await Project.findOne({ name: "Integration Project" }))._id;

            const deleteRes = await request(app)
                .delete(`/projects/${projectId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(deleteRes.statusCode).toBe(200);
            expect(deleteRes.body).toHaveProperty("success", true);

            // Verify project is deleted
            const getRes = await request(app)
                .get(`/projects/${projectId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.statusCode).toBe(404);
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

