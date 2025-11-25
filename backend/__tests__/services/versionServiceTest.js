import { describe, expect, it } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Sprint from "../../src/models/sprint.js";
import Version from "../../src/models/version.js";
import { generateVersionTag, newVersion } from "../../src/services/versionService";

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
    await Version.deleteMany({});
});

describe("Version Service", () => {
    describe("generateVersionTag", () => {
        it("should generate correct version tags no previous versions", async () => {
            const projectId = new mongoose.Types.ObjectId();
            expect(await generateVersionTag(projectId, "major")).toBe("v1.0.0");
            expect(await generateVersionTag(projectId, "minor")).toBe("v0.1.0");
            expect(await generateVersionTag(projectId, "patch")).toBe("v0.0.1");
        });

        it("should generate correct version tags with previous versions", async () => {
            const projectId = new mongoose.Types.ObjectId();
            const version1 = new Version({ project: projectId, tag: "v1.2.3", releaseDate: new Date() });
            await version1.save();

            expect(await generateVersionTag(projectId, "major")).toBe("v2.0.0");
            expect(await generateVersionTag(projectId, "minor")).toBe("v1.3.0");
            expect(await generateVersionTag(projectId, "patch")).toBe("v1.2.4");
        });
    });

    describe("newVersion", () => {
        it("should create a new version", async () => {
            const projectId = new mongoose.Types.ObjectId();
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            const version = await newVersion(sprint, "minor", "First minor release");
            expect(version).toHaveProperty("tag", "v0.1.0");
            expect(version).toHaveProperty("description", "First minor release");
            expect(version.sprint.toString()).toBe(sprint._id.toString());
        });

        it("should throw error for invalid version type", async () => {
            const projectId = new mongoose.Types.ObjectId();
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            await expect(newVersion(sprint, "invalidType")).rejects.toThrow("Invalid version type");
        });

        it("should set default description if none provided", async () => {
            const projectId = new mongoose.Types.ObjectId();
            const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await sprint.save();

            const version = await newVersion(sprint, "patch");
            expect(version).toHaveProperty("description", `Release for sprint ${sprint.name}`);
        });
    });
});