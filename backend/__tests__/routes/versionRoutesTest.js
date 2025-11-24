import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Project from "../../src/models/project.js";
import Sprint from "../../src/models/sprint.js";
import User from "../../src/models/user.js";
import UserStory from "../../src/models/userstory.js";
import Version from "../../src/models/version.js";
import versionRouter from "../../src/routes/versionRoutes.js";
import { generateToken } from "../../src/services/authService.js";

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
    app.use("/", versionRouter);

    const user = new User({ username: "scrumMaster", email: "scrumMaster@example.com", password: "password" });
    await user.save();
    token = generateToken(user);

    const project = new Project({
        name: "Test Project", description: "A project for testing", owner: user._id, members: [{ userID: user._id, role: "Scrum Master" }]
    });
    await project.save();
    projectId = project._id;
});

afterAll(async () => {
    await User.deleteMany();
    await Project.deleteMany();
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await UserStory.deleteMany();
    await Sprint.deleteMany();
    await Version.deleteMany();
});

describe("Version Routes", () => {
    describe("POST /projects/:projectId/versions", () => {
        it("should create a new version", async () => {
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            const res = await request(app)
                .post(`/projects/${projectId}/versions`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    sprintId: sprint._id,
                    type: "minor",
                    description: "First minor release",
                    releaseDate: new Date()
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.version).toHaveProperty("tag", "v0.1.0");
        });
    });

    describe("GET /projects/:projectId/versions", () => {
        it("should get all versions for a project", async () => {
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            const version = new Version({
                project: projectId,
                tag: "v0.1.0",
                description: "First minor release",
                releaseDate: new Date(),
                sprint: sprint._id
            });
            await version.save();

            const res = await request(app)
                .get(`/projects/${projectId}/versions`)
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.versions.length).toBe(1);
            expect(res.body.versions[0]).toHaveProperty("tag", "v0.1.0");
        });
    });

    describe("PUT /versions/:versionId", () => {
        it("should update a version", async () => {
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            const version = new Version({
                project: projectId,
                tag: "v0.1.0",
                description: "First minor release",
                releaseDate: new Date(),
                sprint: sprint._id
            });
            await version.save();

            const res = await request(app)
                .put(`/versions/${version._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    description: "Updated description"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Version updated successfully");

            const updatedVersion = await Version.findById(version._id);
            expect(updatedVersion.description).toBe("Updated description");
        });
    });
});