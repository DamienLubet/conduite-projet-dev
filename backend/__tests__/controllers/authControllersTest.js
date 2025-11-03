import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { login, register } from "../../src/controllers/authController.js";
import User from "../../src/models/user.js";

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
    await User.deleteMany({});
});

describe("AuthController - register", () => {
    let res, req;

    beforeEach(() => {
        req = { body: {} };
        res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        };
        jest.clearAllMocks();
    });
    
    it("should register a new user", async () => {
        req.body = { username: "test", email: "test@example.com", password: "password123" };
        await register(req, res);

        const UserInDb = await User.findOne({ email: "test@example.com" });
        
        expect(UserInDb).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true
        }));
    });

    it("should not register a user with existing email", async () => {
        req.body = { username: "test", email: "existing@example.com", password: "password123" };
        await register(req, res);
        
        // Try to register again with the same email
        req.body = { username: "test2", email: "existing@example.com", password: "password123" };
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });

    it("should not register with existing username", async () => {
        req.body = { username: "existingUser", email: "test@example.com", password: "password123" };
        await register(req, res);

        // Try to register again with the same username
        req.body = { username: "existingUser", email: "test2@example.com", password: "password123" };
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });

    it("should not register a user with missing fields", async () => {
        req.body = { username: "test" };
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });
});

describe("AuthController - login", () => {
    let res, req;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it("should login an existing user", async () => {
        // First register a user
        req.body = { username: "loginTest", email: "loginTest@example.com", password: "password123" };
        await register(req, res);

        // Now try to login
        req.body = { email: "loginTest@example.com", password: "password123" };
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true
        }));
    });

    it("should not login with incorrect password", async () => {
        // First register a user
        req.body = { username: "loginTest", email: "loginTest@example.com", password: "password123" };
        await register(req, res);

        // Now try to login with incorrect password
        req.body = { email: "loginTest@example.com", password: "wrongPassword" };
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });

    it("should not login non-existing user", async () => {
        req.body = { email: "nonExisting@example.com", password: "password123" };
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });

    it("should not login with missing fields", async () => {
        req.body = { email: "loginTest@example.com" };
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });
});