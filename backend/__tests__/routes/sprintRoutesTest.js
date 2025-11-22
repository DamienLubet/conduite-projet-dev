import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Project from "../../src/models/project.js";
import User from "../../src/models/user.js";
import Sprint from "../../src/models/sprint.js";
import sprintRouter from "../../src/routes/sprintRoutes.js";
import { generateToken } from "../../src/services/authService.js";
import UserStory from "../../src/models/userstory.js";

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
    app.use("/", sprintRouter);

    const user = new User({ username: "scrumMaster", email: "scrumMaster@example.com", password: "password", role: "scrumMaster" });
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
    await Sprint.deleteMany();
});

describe("Sprint Routes", () => {
    describe("POST /projects/:projectId/sprints", () => {
        it("should create a new sprint", async () => {
            const res = await request(app)
                .post(`/projects/${projectId}/sprints`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Sprint 1",
                    description: "First sprint",
                    startDate: "2024-01-01",
                    endDate: "2024-01-15"
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("sprint");
            expect(res.body.sprint.name).toBe("Sprint 1");
        });
    });

    describe("GET /projects/:projectId/sprints", () => {
        it("should get all sprints for a project", async () => {
            // First, create a sprint to retrieve later
            const sprint = new Sprint({
                name: "Sprint 1",
                description: "First sprint",
                startDate: "2024-01-01",
                endDate: "2024-01-15",
                project: projectId
            });
            await sprint.save();

            const userStory = new UserStory({
                title: "User Story 1",
                project: projectId,
                sprint: sprint._id
            });
            await userStory.save();

            const res = await request(app)
                .get(`/projects/${projectId}/sprints`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("sprints");
            expect(res.body.sprints.length).toBe(1);
            expect(res.body.sprints[0].name).toBe("Sprint 1");
            expect(res.body.sprints[0]).toHaveProperty("userStories");
            expect(res.body.sprints[0].userStories.length).toBe(1);
            expect(res.body.sprints[0].userStories[0].title).toBe("User Story 1");
        });
    });
});
