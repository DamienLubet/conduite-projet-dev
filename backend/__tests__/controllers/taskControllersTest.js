import { expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTask } from "../../src/controllers/taskController.js";
import Task from "../../src/models/task.js";

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
    await Task.deleteMany({});
});

describe("TaskController - createTask", () => {
    let res, req, userStoryId;

    beforeEach(() => {
        userStoryId = new mongoose.Types.ObjectId();
        req = { body: {}, params: { userStoryId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should create a new task successfully", async () => {
        req.body = {
            title: "New Task",
            description: "This is a test task",
            status: "To Do",
        };
        
        await createTask(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Task created successfully.",
        }));
        
        const tasks = await Task.find({ userStory: userStoryId });
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe("New Task");
    });

    it("should return 400 if title is missing", async () => {
        req.body = {
            description: "This is a test task without a title",
        };
        
        await createTask(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Title is required.",
        }));

        const tasks = await Task.find({ userStory: userStoryId });
        expect(tasks).toHaveLength(0);
    });
});