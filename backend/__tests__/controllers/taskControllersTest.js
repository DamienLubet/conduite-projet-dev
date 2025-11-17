import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTask, getTaskById, getTasksByUserStory } from "../../src/controllers/taskController.js";
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
    await Task.deleteMany({});
});

describe("TaskController - createTask", () => {
    let res, req, userStoryId;

    beforeEach(() => {
        projectId = new mongoose.Types.ObjectId();
        userStoryId = new mongoose.Types.ObjectId();
        req = { body: {}, params: { userStoryId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(UserStory, "findById").mockResolvedValue({
            _id: userStoryId,
            project: projectId
        });

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

describe("TaskController - getTasksByUserStory", () => {
    let res, req, userStoryId;

    beforeEach(() => {
        userStoryId = new mongoose.Types.ObjectId();
        projectId = new mongoose.Types.ObjectId();
        req = { params: { userStoryId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(UserStory, "findById").mockResolvedValue({
            _id: userStoryId,
            project: projectId
        });

        jest.clearAllMocks();
    });

    it("should retrieve tasks by user story ID", async () => {
        await new Task({ title: "Task 1", userStory: userStoryId, project: projectId }).save();
        await new Task({ title: "Task 2", userStory: userStoryId, project: projectId }).save();

        await getTasksByUserStory(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: expect.arrayContaining([
                expect.objectContaining({ title: "Task 1" }),
                expect.objectContaining({ title: "Task 2" }),
            ]),
        }));
    });
});

describe("TaskController - getTaskById", () => {
    let res, req, taskId;

    beforeEach(async () => {
        const task = await new Task({ title: "Single Task", userStory: new mongoose.Types.ObjectId(), project: new mongoose.Types.ObjectId() }).save();
        taskId = task._id;
        req = { params: { id: taskId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should retrieve a task by ID", async () => {
        await getTaskById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: expect.objectContaining({ title: "Single Task" }),
        }));
    });

    it("should return 404 if task not found", async () => {
        req.params.id = new mongoose.Types.ObjectId();

        await getTaskById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Task not found.",
        }));
    });
});