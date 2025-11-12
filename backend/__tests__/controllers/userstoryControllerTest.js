import { expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import UserStory from "../../src/models/userstory.js";
import { createUserStory } from "../../src/controllers/userstoryController.js";

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