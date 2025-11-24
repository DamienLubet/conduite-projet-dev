import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createVersion, getVersionsByProject, updateVersion } from "../../src/controllers/versionController.js";
import Sprint from "../../src/models/sprint.js";
import Version from "../../src/models/version.js";

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

describe("createVersion Controller", () => {
    let req, res, sprintId, projectId;

    beforeEach(async () => {
        projectId = new mongoose.Types.ObjectId();
        const sprint = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7*24*60*60*1000) });
        await sprint.save();
        sprintId = sprint._id;
        req = { params: { projectId: projectId.toString() }, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("should create a new version successfully", async () => {
        req.body = { description: "Version 1", sprintId, type: "major" };

        await createVersion(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "Version created successfully",
                version: expect.objectContaining({
                    description: "Version 1",
                    tag: "v1.0.0",
                }),
            })
        );
    });

    it("should return 400 if sprint does not belong to project", async () => {
        const otherProjectId = new mongoose.Types.ObjectId();
        req.body = { description: "Version 1", sprintId, type: "major" };
        req.params.projectId = otherProjectId;

        await createVersion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Invalid sprint for the specified project",
            })
        );
    });

    it("should return 400 if newVersion throws an error", async () => {
        req.body = { description: "Version 1", sprintId, type: "invalid-type" };

        await createVersion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: expect.any(String),
            })
        );
    });
});

describe("getVersionsByProject Controller", () => {
    let req, res, projectId;

    beforeEach(async () => {
        projectId = new mongoose.Types.ObjectId();
        let sprint = await new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date(), endDate: new Date(Date.now() + 7*24*60*60*1000) }).save();
        await new Version({ description: "Version 1", tag: "v1.0.0", sprint: sprint._id, project: projectId, releaseDate: new Date() }).save();
        await new Version({ description: "Version 2", tag: "v1.1.0", project: projectId, releaseDate: new Date() }).save();
        req = { params: { projectId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("should retrieve versions for the specified project", async () => {
        await getVersionsByProject(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                versions: expect.arrayContaining([
                    expect.objectContaining({ description: "Version 1", tag: "v1.0.0", sprint: expect.objectContaining({ name: "Sprint 1" }) }),
                    expect.objectContaining({ description: "Version 2", tag: "v1.1.0" }),
                ]),
            })
        );
    });
});

describe("updateVersion Controller", () => {
    let req, res, version;

    beforeEach(async () => {
        version = new Version({ description: "Old Description", tag: "v1.0.0", releaseDate: new Date("2023-01-01"), project: new mongoose.Types.ObjectId() });
        await version.save();
        req = { version, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("should update version description and release date", async () => {
        const newDate = new Date().toISOString();
        req.body = { description: "New Description", releaseDate: newDate };

        await updateVersion(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: "Version updated successfully",
            })
        );

        const updatedVersion = await Version.findById(version._id);
        expect(updatedVersion.description).toBe("New Description");
        expect(updatedVersion.releaseDate.toISOString()).toBe(new Date(newDate).toISOString());
    });
});
