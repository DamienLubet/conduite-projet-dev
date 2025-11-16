import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Project from "../../src/models/project.js";
import User from "../../src/models/user.js";
import projectRouter from "../../src/routes/projectRoutes.js";
import { generateToken } from "../../src/services/authService.js";

let mongoServer;
let app;
let token, user;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = express();
    app.use(express.json());
    app.use("/", projectRouter);

    // Register and login a user to get a token
    user = await new User({ username: "testuser", email: "testuser@example.com", password: "password123" }).save();
    token = generateToken(user);
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Project.deleteMany({});
    await User.deleteMany({ _id: { $ne: user._id } });
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

    describe("POST /projects/:id/members", () => {
        it("should add a member to the project", async () => {
            const newUser = await new User({ username: "memberuser", email: "memberuser@example.com", password: "pass" }).save();
            const project = await new Project({ name: "Member Project", owner: user._id, members: [{ userID: user._id, role: "Scrum Master" }] }).save();

            const res = await request(app)
                .post(`/projects/${project._id}/members`)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: newUser.email });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);

            const updatedProject = await Project.findById(project._id);
            expect(updatedProject.members).toHaveLength(2);
            expect(updatedProject.members[1].userID.toString()).toBe(newUser._id.toString());
        });
    });

    describe("DELETE /projects/:id/members", () => {
        it("should remove a member from the project", async () => {
            const newUser = await new User({ username: "memberuser", email: "memberuser@example.com", password: "pass" }).save();
            const project = await new Project({ name: "Member Project", owner: user._id, members: [{ userID: user._id, role: "Scrum Master" }, { userID: newUser._id, role: "Developer" }] }).save();

            const res = await request(app)
                .delete(`/projects/${project._id}/members`)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: newUser.email });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);

            const updatedProject = await Project.findById(project._id);
            expect(updatedProject.members).toHaveLength(1);
        });
    });

    describe("PUT /projects/:id/members", () => {
        it("should change a member's role in the project", async () => {
            const newUser = await new User({ username: "memberuser", email: "memberuser@example.com", password: "pass" }).save();
            const project = await new Project({ name: "Member Project", owner: user._id, members: [{ userID: user._id, role: "Scrum Master" }, { userID: newUser._id, role: "Developer" }] }).save();

            const res = await request(app)
                .put(`/projects/${project._id}/members`)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: newUser.email, newRole: "Viewer" });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("success", true);

            const updatedProject = await Project.findById(project._id);
            const member = updatedProject.members.find(m => m.userID.toString() === newUser._id.toString());
            expect(member.role).toBe("Viewer");
        });
    });
});

