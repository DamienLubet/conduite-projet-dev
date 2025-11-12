import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import UserStory from '../../src/models/userstory.js';

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

describe("UserStory Model", () => {
    it("should create a user story with auto-incremented number", async () => {
        const projectId = new mongoose.Types.ObjectId();

        const userStory1 = new UserStory({
            title: "First Story",
            project: projectId,
        });
        const savedStory1 = await userStory1.save();

        expect(savedStory1._id).toBeDefined();
        expect(savedStory1.number).toBe(1);
        expect(savedStory1.title).toBe("First Story");

        const userStory2 = new UserStory({
            title: "Second Story",
            project: projectId,
        });
        const savedStory2 = await userStory2.save();

        expect(savedStory2._id).toBeDefined();
        expect(savedStory2.number).toBe(2);
        expect(savedStory2.title).toBe("Second Story");
    });
    
    it("should default priority to 'Medium' and storyPoints to 0", async () => {
        const projectId = new mongoose.Types.ObjectId();

        const userStory = new UserStory({
            title: "Default Values Story",
            project: projectId,
        });
        const savedStory = await userStory.save();

        expect(savedStory.priority).toBe("Medium");
        expect(savedStory.storyPoints).toBe(0);
    });

    it("should require title and project fields", async () => {
        const userStory = new UserStory({});

        let err;
        try {
            await userStory.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.title).toBeDefined();
        expect(err.errors.project).toBeDefined();
    });
});