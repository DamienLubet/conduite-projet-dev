import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Task from '../../src/models/task.js';

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

describe('Task Model', () => {
    it('should create a task successfully', async () => {
        const task = await Task.create({
            title: 'Test Task',
            description: 'This is a test task',
            status: 'To Do',
            userStory: new mongoose.Types.ObjectId(),
            project: new mongoose.Types.ObjectId(),
        });
        expect(task._id).toBeDefined();
        expect(task.number).toBe(1);
        expect(task.title).toBe('Test Task');
    });
    
    it('should auto-increment task number within the same user story', async () => {
        const userStoryId = new mongoose.Types.ObjectId();
        const projectId = new mongoose.Types.ObjectId();
        const task1 = await Task.create({
            title: 'First Task',
            userStory: userStoryId,
            project: projectId,
        });
        const task2 = await Task.create({
            title: 'Second Task',
            userStory: userStoryId,
            project: projectId,
        });
        expect(task1.number).toBe(1);
        expect(task2.number).toBe(2);
    });

    it('should enforce required fields', async () => {
        let error;
        try {
            await Task.create({
                description: 'Missing title and userStory',
            });
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error.errors.title).toBeDefined();
        expect(error.errors.userStory).toBeDefined();
    });

    it('should enforce status enum values', async () => {
        let error;
        try {
            await Task.create({
                title: 'Invalid Status Task',
                status: 'Invalid Status',
                userStory: new mongoose.Types.ObjectId(),
                project: new mongoose.Types.ObjectId(),
            });
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error.errors.status).toBeDefined();
    });
});