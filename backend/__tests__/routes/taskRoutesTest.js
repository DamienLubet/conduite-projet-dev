import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import Project from '../../src/models/project.js';
import User from '../../src/models/user.js';
import UserStory from '../../src/models/userstory.js';
import taskRouter from '../../src/routes/taskRoutes.js';
import { generateToken } from '../../src/services/authService.js';

let mongoServer;
let app;
let token;
let userStoryId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = express();
    app.use(express.json());
    app.use("/", taskRouter);
    // Create a user and get auth token
    const user = new User({ username: 'testuser', email: 'testuser@example.com', password: 'password' });
    await user.save();
    token = generateToken(user);
    // Create a project
    const project = new Project({ name: 'Test Project', owner: user._id, members: [{ userID: user._id, role: 'Scrum Master' }] });
    await project.save();
    // Create a user story
    const userStory = new UserStory({ title: 'Test User Story', project: project._id });
    await userStory.save();
    userStoryId = userStory._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Task Routes', () => {
    describe('POST /userstories/:userStoryId/tasks', () => {
        it('should create a new task under the specified user story', async () => {
            const res = await request(app)
                .post(`/userstories/${userStoryId}/tasks`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Task',
                    description: 'This is a test task',
                    status: 'To Do'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message', 'Task created successfully.');
        });
    });
});