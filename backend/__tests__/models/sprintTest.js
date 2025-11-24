import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import Sprint from '../../src/models/sprint.js';

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
    await Sprint.deleteMany({});
});

describe('Sprint Model', () => {
    it('should auto-increment sprint number within the same project', async () => {
        const projectId = new mongoose.Types.ObjectId();

        const sprint1 = await new Sprint({
            name: 'Sprint 1',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-15'),
            project: projectId,
        }).save();

        const sprint2 = await new Sprint({
            name: 'Sprint 2',
            startDate: new Date('2024-01-16'),
            endDate: new Date('2024-01-31'),
            project: projectId,
        }).save();

        expect(sprint1.number).toBe(1);
        expect(sprint2.number).toBe(2);
    });

    it('should not create a sprint with endDate before startDate', async () => {
        const projectId = new mongoose.Types.ObjectId();

        let err;
        try {
            await new Sprint({
                name: 'Invalid Sprint',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-01-31'),
                project: projectId,
            }).save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.message).toBe('Start date must be before end date');
    });

    it('should calculate timeRemaining virtual field correctly', async () => {
        const projectId = new mongoose.Types.ObjectId();
        const future = new Date();
        future.setDate(future.getDate() + 10); 
        const sprint = await new Sprint({
            name: 'Future Sprint',
            startDate: new Date(),
            endDate: future,
            project: projectId,
        }).save();

        expect(sprint.timeRemaining).toBe(10);
    });
});