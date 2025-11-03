import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Project from '../../src/models/project.js';
import User from '../../src/models/user.js';

let mongoServer;
let ownerUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  ownerUser = await User.create({
    username: 'owner',
    email: 'owner@example.com',
    password: 'password',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Project.deleteMany({});
});

describe('Project Model', () => {
    it('should create a project successfully', async () => {
        const project = await Project.create({
            name: 'Test Project',
            description: 'This is a test project',
            owner: ownerUser._id,
        });
        expect(project).toBeDefined();
        expect(project.name).toBe('Test Project');
        expect(project.description).toBe('This is a test project');
        expect(project.owner).toEqual(ownerUser._id);
    });

    it('should not create a project without required fields', async () => {
        const project = new Project({});
        let err;
        try {
            await project.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
        expect(err.errors.owner).toBeDefined();
    });
});
