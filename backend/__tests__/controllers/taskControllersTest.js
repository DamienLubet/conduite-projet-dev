import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { assignTask, createTask, deleteTask, getTaskById, getTasksByUserStory, updateTask } from "../../src/controllers/taskController.js";
import Project from "../../src/models/project.js";
import Task from "../../src/models/task.js";
import User from "../../src/models/user.js";
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
    await UserStory.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
});

describe("TaskController - createTask", () => {
    let res, req, userStoryId;

    beforeEach(() => {
        let projectId = new mongoose.Types.ObjectId();
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
    let res, req, userStoryId, projectId;

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

describe("TaskController - updateTask", () => {
    let res, req, taskId;

    beforeEach(async () => {
        const task = await new Task({ title: "Old Task", userStory: new mongoose.Types.ObjectId(), project: new mongoose.Types.ObjectId() }).save();
        taskId = task._id;
        req = { params: { id: taskId }, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should update a task successfully", async () => {
        req.body = {
            title: "Updated Task",
            description: "Updated description",
            status: "In Progress",
        };

        req.task = await Task.findById(taskId);
        await updateTask(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Task updated successfully.",
        }));

        const updatedTask = await Task.findById(taskId);
        expect(updatedTask.title).toBe("Updated Task");
        expect(updatedTask.description).toBe("Updated description");
        expect(updatedTask.status).toBe("In Progress");
    });

    it("should return 400 for invalid status", async () => {
        req.body = {
            status: "Invalid Status",
        };

        req.task = await Task.findById(taskId);
        await updateTask(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Invalid status value.",
        }));
    });
});

describe("TaskController - deleteTask", () => {
    let res, req, task, taskId;

    beforeEach(async () => {
        task = await new Task({ title: "Task to Delete", userStory: new mongoose.Types.ObjectId(), project: new mongoose.Types.ObjectId() }).save();
        taskId = task._id;
        req = { task };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should delete a task successfully", async () => {
        await deleteTask(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Task deleted successfully.",
        }));

        const deletedTask = await Task.findById(taskId);
        expect(deletedTask).toBeNull();
    });
});

describe("TaskController - assignTask", () => {
    let res, req, task, userId;

    beforeEach(async () => {
        const user = await new User({ username: "assignee", email: "assignee@example.com", password: "password123" }).save();
        const project = await new Project({ name: "Test Project", owner: new mongoose.Types.ObjectId(), members: [{userID: user._id, role: "Developer"}] }).save();
        task = await new Task({ title: "Task to Assign", userStory: new mongoose.Types.ObjectId(), project: project._id }).save();
        userId = user._id;
        req = { task, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should assign a task to a user successfully", async () => {
        req.body = { assigneeId: userId };
        await assignTask(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: "Task assigned successfully.",
        }));

        const updatedTask = await Task.findById(task._id);
        expect(updatedTask.assignee.toString()).toBe(userId.toString());
    });

    it("should return 400 if assigneeId is missing", async () => {
        await assignTask(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Assignee ID is required.",
        }));
    });

    it("should return 404 if user not found", async () => {
        req.body = { assigneeId: new mongoose.Types.ObjectId() };
        await assignTask(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "User not found.",
        }));
    });

    it("should return 400 if user is not a project member", async () => {
        const nonMemberId = await new User({ username: "nonmember", email: "nonmember@example.com", password: "password123" }).save();
        req.body = { assigneeId: nonMemberId._id };
        await assignTask(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "User is not a member of the project.",
        }));
    });
});