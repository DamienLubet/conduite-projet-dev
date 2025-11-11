import { expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { getUserProjects } from "../../src/controllers/userController.js";
import Project from "../../src/models/project.js";
import User from "../../src/models/user.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    let user = new User({ username: "owner", email: "owner@example.com", password: "password123" });
    await user.save();
    let project = new Project({ name: "Existing Project", owner: user._id, members: [{ userID: user._id, role: "Scrum Master" }] });
    await project.save();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Project.deleteMany({});
});

describe("UserController - getUserProjects", () => {
    let res, req, owner;

    beforeEach(async () => {
        owner = await User.findOne({ email: "owner@example.com" });
        req = { body: {}, user: { id: owner._id } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should retrieve projects for the user", async () => {
        await getUserProjects(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            projects: expect.any(Array),
        }));
        const projects = res.json.mock.calls[0][0].projects;
        expect(projects).toHaveLength(1);
        expect(projects[0].name).toBe("Existing Project");
    });

    it("should return 404 if user has no projects", async () => {
        req.user.id = undefined;
        await getUserProjects(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });

});