import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import Project from '../../src/models/project.js';
import Task from '../../src/models/task.js';
import User from '../../src/models/user.js';
import UserStory from '../../src/models/userstory.js';
import taskRouter from '../../src/routes/taskRoutes.js';
import { generateToken } from '../../src/services/authService.js';

let mongoServer;
let app;
let token;
let userStoryId;
let projectId;

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
    projectId = project._id;
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

    describe('GET /userstories/:userStoryId/tasks', () => {
        it('should retrieve tasks for the specified user story', async () => {
            const res = await request(app)
                .get(`/userstories/${userStoryId}/tasks`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0]).toHaveProperty('title', 'Test Task');
        });
    });

    describe('GET /tasks/:id', () => {
        it('should retrieve a single task by ID', async () => {
            // First, create a task to retrieve
            const task = await new Task({
                title: 'Single Task',
                description: 'This is a single task',
                status: 'In Progress',
                userStory: userStoryId,
                project: projectId
            }).save();
            const taskId = task._id;

            const res = await request(app)
                .get(`/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('_id', String(taskId));
            expect(res.body.data).toHaveProperty('title', 'Single Task');
            expect(res.body.data).toHaveProperty('description', 'This is a single task');
        });
    });
});