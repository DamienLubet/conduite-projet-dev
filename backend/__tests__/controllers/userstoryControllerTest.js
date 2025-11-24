import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createUserStory, deleteUserStory, getUserStoriesByProject, getUserStoryById, updateUserStory } from "../../src/controllers/userstoryController.js";
import Task from "../../src/models/task.js";
import UserStory from "../../src/models/userstory.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await UserStory.deleteMany({});
});

describe("UserStory Controller - createUserStory", () => {
    let res, req, projectId, userId;

    beforeEach(async () => {
        projectId = new mongoose.Types.ObjectId();
        userId = new mongoose.Types.ObjectId();
        req = { body: {}, user: { id: userId }, params: { projectId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should create a new user story successfully", async () => {
        req.body = {
            title: "New User Story",
            description: "This is a test user story",
            priority: "High",
            storyPoints: 5,
        };

        await createUserStory(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "User story created successfully."
            }));
    });

    it("should return 400 if title is missing", async () => {
        await createUserStory(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Title is required."
            }));
    });
});

describe("UserStory Controller - getUserStoriesByProject", () => {
    let res, req, projectId, userId;

    beforeEach(async () => {
        projectId = new mongoose.Types.ObjectId();
        userId = new mongoose.Types.ObjectId();
        req = { params: { projectId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        
        await new UserStory({
            title: "Sample User Story",
            description: "This is a sample user story",
            priority: "Medium",
            storyPoints: 3,
            project: projectId,
        }).save();

        jest.spyOn(UserStory, "find").mockResolvedValue([{
            _id: new mongoose.Types.ObjectId(),
            title: "Sample User Story",
            description: "This is a sample user story",
            priority: "Medium",
            storyPoints: 3,
            project: projectId,
        }]);
        jest.clearAllMocks();
    });

    it("should retrieve user stories by project ID", async () => {
        await getUserStoriesByProject(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: expect.any(Array),
            }));
        expect(res.json.mock.calls[0][0].data).toHaveLength(1);
    });
});

describe("UserStory Controller - getUserStoryById", () => {
    let res, req, userStoryId, userId;

    beforeEach(async () => {
        userStoryId = new mongoose.Types.ObjectId();
        userId = new mongoose.Types.ObjectId();
        req = { params: { id: userStoryId }, user: { id: userId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await new UserStory({
            _id: userStoryId,
            title: "Single User Story",
            description: "This is a single user story",
            priority: "Low",
            storyPoints: 2,
            project: new mongoose.Types.ObjectId(),
        }).save();

        jest.clearAllMocks();
    });

    it("should retrieve a user story by ID", async () => {
        await getUserStoryById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({ title: "Single User Story"}),
            }));
    });

    it("should return 404 if user story not found", async () => {
        req.params.id = new mongoose.Types.ObjectId();
        await getUserStoryById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "User story not found."
            }));
    });
});

describe("UserStory Controller - updateUserStory", () => {
    let res, req, userstory;

    beforeEach(async () => {
        userstory = new UserStory({
            title: "Old Title",
            description: "Old Description",
            priority: "Low",
            storyPoints: 2,
            project: new mongoose.Types.ObjectId(),
        });
        await userstory.save();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should update a user story successfully", async () => {
        req = { body: { title: "Updated Title", priority: "High", storyPoints: 8 }, userstory };
        await updateUserStory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "User story updated successfully.",
                data: expect.objectContaining({ title: "Updated Title", priority: "High", storyPoints: 8 }),
            }));
    });
});

describe("UserStory Controller - deleteUserStory", () => {
    let res, req, userstory;

    beforeEach(async () => {
        userstory = new UserStory({
            title: "Old Title",
            description: "Old Description",
            priority: "Low",
            storyPoints: 2,
            project: new mongoose.Types.ObjectId(),
        });
        await userstory.save();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should delete a user story successfully", async () => {
        req = { userstory };
        await deleteUserStory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "User story deleted successfully.",
            }));
    });

    it("should delete associated tasks when deleting a user story", async () => {
        // Assuming Task model and its relation to UserStory
        const task = new Task({
            title: "Associated Task",
            userStory: userstory._id,
            project: userstory.project,
        });
        await task.save();

        req = { userstory };
        await deleteUserStory(req, res);

        const foundTask = await Task.findOne({ userStory: userstory._id });
        expect(foundTask).toBeNull();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "User story deleted successfully.",
            }));
    });
});