import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createProject, deleteProject, editProject, getProjectbyId } from "../../src/controllers/projectController";
import Project from "../../src/models/project.js";
import User from "../../src/models/user.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    let user = new User({ username: "owner", email: "owner@example.com", password: "password123" });
    await user.save();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Project.deleteMany({});
});

describe("ProjectController - createProject", () => {
    let res, req, owner;

    beforeEach(async () => {
        owner = await User.findOne({ email: "owner@example.com" });
        req = { body: {}, user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should create a new project", async () => {
        req.user = { id: owner._id };
        req.body = { name: "New Project" };
        await createProject(req, res);

        const projectInDb = await Project.findOne({ name: "New Project", owner: owner._id });
        expect(projectInDb).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(projectInDb.name).toBe("New Project");
        expect(projectInDb.owner.toString()).toBe(owner._id.toString());
        expect(projectInDb.members).toHaveLength(1);
        expect(projectInDb.members[0].role).toBe("Scrum Master");
        expect(projectInDb.members[0].userID.toString()).toBe(owner._id.toString());

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("should not create a project without a name", async () => {
        req.user = { id: owner._id };
        req.body = {};
        await createProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should not create a project with duplicate name for the same owner", async () => {
        req.user = { id: owner._id };
        req.body = { name: "Duplicate Project" };

        await createProject(req, res);

        // Try to create again with the same name
        await createProject(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should not create a project if user is not authenticated", async () => {
        req.body = { name: "Unauthorized Project" };
        await createProject(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});

describe("ProjectController - getProjectbyId", () => {
    let res, req, owner, project;

    beforeEach(async () => {
        owner = await User.findOne({ email: "owner@example.com" });
        project = new Project({ name: "Test Project", owner: owner._id });
        await project.save();
    });

    it("should retrieve project by ID for the member", async () => {
        req = { params: { id: project._id }, user: { id: owner._id } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProjectbyId(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            project: expect.objectContaining({ name: "Test Project" }),
        }));
    });
});

describe("ProjectController - deleteProject", () => {
    let res, req, owner, project;

    beforeEach(async () => {
        owner = await User.findOne({ email: "owner@example.com" });
        project = new Project({ name: "Test Project", owner: owner._id });
        await project.save();        
    });

    it("should delete project by ID", async () => {
        req = { params: { id: project._id }, user: { id: owner._id } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await deleteProject(req, res);
        const deletedProject = await Project.findById(project._id);
        expect(deletedProject).toBeNull();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Project deleted successfully."
        }));
    });
});

describe("ProjectController - editProject", () => {
    let res, req, owner, project;

    beforeEach(async () => {
        owner = await User.findOne({ email: "owner@example.com" });
        project = new Project({ name: "Test Project", owner: owner._id });
        await project.save();
    });

    it("should edit project details", async () => {
        req = { params: { id: project._id }, user: { id: owner._id }, body: { name: "Updated Project", description: "Updated Description" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await editProject(req, res);

        const updatedProject = await Project.findById(project._id);
        expect(updatedProject.name).toBe("Updated Project");
        expect(updatedProject.description).toBe("Updated Description");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Project updated successfully."
        }));
    });

    it("should not edit project to a duplicate name", async () => {
        const anotherProject = new Project({ name: "Another Project", owner: owner._id });
        await anotherProject.save();

        req = { params: { id: project._id }, user: { id: owner._id }, body: { name: "Another Project" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await editProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false, message: 'You already have a project with this name.'
        }));
    });
});