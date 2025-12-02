import { describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { assignUserStoriesToSprint, completeSprint, createSprint, deleteSprint, getSprintsByProject, startSprint, updateSprint } from "../../src/controllers/sprintController.js";
import Sprint from "../../src/models/sprint.js";
import UserStory from "../../src/models/userstory.js";
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
    jest.clearAllMocks();
    await Sprint.deleteMany({});
    await UserStory.deleteMany({});
    await Version.deleteMany({});
});

describe("SprintController - createSprint", () => {
    let req, res, projectId;

    beforeEach(() => {
        projectId = new mongoose.Types.ObjectId();
        req = { body: {}, params: { projectId: projectId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should create a sprint successfully", async () => {
        req.body = {
            name: "Sprint 1",
            description: "First Sprint",
            startDate: "2024-01-01",
            endDate: "2024-01-15"
        };

        await createSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint created successfully',
            sprint: expect.objectContaining({
                name: "Sprint 1",
                description: "First Sprint",
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-15"),
                project: projectId
            })
        }));
    });

    it("should return 400 if startDate is after endDate", async () => {
        req.body = {
            name: "Sprint 1",
            description: "First Sprint",
            startDate: "2024-01-16",
            endDate: "2024-01-15"
        };

        await createSprint(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Start date must be before end date'
        });
    });

    it("should return 400 if required fields are missing", async () => {
        req.body = {
            description: "First Sprint",
            startDate: "2024-01-01"
        };

        await createSprint(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Name, start date, and end date are required'
        });
    });
});

describe("SprintController - getSprintsByProject", () => {
    let req, res, projectId;

    beforeEach(async () => {
        projectId = new mongoose.Types.ObjectId();
        const sprint1 = new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date("2024-01-01"), endDate: new Date("2024-01-15") });
        const sprint2 = new Sprint({ name: "Sprint 2", project: projectId, startDate: new Date("2024-02-01"), endDate: new Date("2024-02-15") });
        await sprint1.save();
        await sprint2.save();
        await new UserStory({ title: "User Story 1", project: projectId, sprint: sprint1._id }).save();
        await new UserStory({ title: "User Story 2", project: projectId, sprint: sprint1._id }).save();
        await new UserStory({ title: "User Story 3", project: projectId, sprint: sprint2._id }).save();

        req = { params: { projectId: projectId } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should retrieve sprints with their user stories", async () => {
        await getSprintsByProject(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            sprints: expect.arrayContaining([
                expect.objectContaining({
                    name: "Sprint 1",
                    timeRemaining: expect.any(Number),
                    userStories: expect.arrayContaining([
                        expect.objectContaining({ title: "User Story 1" }),
                        expect.objectContaining({ title: "User Story 2" })
                    ])
                }),
                expect.objectContaining({
                    name: "Sprint 2",
                    userStories: expect.arrayContaining([
                        expect.objectContaining({ title: "User Story 3" })
                    ])
                })
            ])
        }));
    });
});

describe("SprintController - updateSprint", () => {
    let req, res, sprintId, sprint;

    beforeEach(async () => {
        sprint = await new Sprint({ name: "Sprint 1", project: new mongoose.Types.ObjectId(), startDate: new Date("2024-01-01"), endDate: new Date("2024-01-15") }).save();
        sprintId = sprint._id;
        req = { body: {}, params: { sprintId: sprintId }, sprint: sprint };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should update sprint details successfully", async () => {
        req.body = {
            name: "Updated Sprint 1",
            description: "Updated Description",
            startDate: "2024-01-05",
            endDate: "2024-01-20"
        };

        await updateSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint updated successfully'
        }));

        const updatedSprint = await Sprint.findById(sprintId);
        expect(updatedSprint.name).toBe("Updated Sprint 1");
        expect(updatedSprint.description).toBe("Updated Description");
        expect(updatedSprint.startDate).toEqual(new Date("2024-01-05"));
        expect(updatedSprint.endDate).toEqual(new Date("2024-01-20"));
    });

    it("should return 400 if startDate is after endDate", async () => {
        req.body = {
            startDate: "2024-01-21",
            endDate: "2024-01-20"
        };

        await updateSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Start date must be before end date'
        });
    });
});

describe("SprintController - assignUserStoriesToSprint", () => {
    let req, res, sprintId, sprint, userStory1, userStory2;

    beforeEach(async () => {
        const projectId = new mongoose.Types.ObjectId();
        sprint = await new Sprint({ name: "Sprint 1", project: projectId, startDate: new Date("2024-01-01"), endDate: new Date("2024-01-15") }).save();
        sprintId = sprint._id;
        userStory1 = await new UserStory({ title: "User Story 1", project: projectId }).save();
        userStory2 = await new UserStory({ title: "User Story 2", project: projectId }).save();

        req = { body: {}, params: { sprintId: sprintId }, sprint: sprint };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should assign user stories to sprint successfully", async () => {
        req.body = {
            userStoriesIDs: [userStory1._id, userStory2._id]
        };

        await assignUserStoriesToSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'User Stories assigned to sprint successfully.'
        }));

        const updatedUS1 = await UserStory.findById(userStory1._id);
        const updatedUS2 = await UserStory.findById(userStory2._id);
        expect(updatedUS1.sprint.toString()).toBe(sprintId.toString());
        expect(updatedUS2.sprint.toString()).toBe(sprintId.toString());
    });

    it("should return 400 if userStoriesIDs is not a non-empty array", async () => {
        req.body = {
            userStoriesIDs: []
        };

        await assignUserStoriesToSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'userStoriesIDs must be a non-empty array'
        });
    });

    it("should return 400 if some user stories are invalid", async () => {
        const invalidId = new mongoose.Types.ObjectId();
        req.body = {
            userStoriesIDs: [userStory1._id, invalidId]
        };

        await assignUserStoriesToSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Some user stories are invalid or do not belong to the sprint's project"
        });
    });
});

describe("SprintController - startSprint", () => {
    let req, res, sprintId, sprint;

    beforeEach(async () => {
        sprint = await new Sprint({ name: "Sprint 1", project: new mongoose.Types.ObjectId(), startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'planned' }).save();
        sprintId = sprint._id;
        req = { params: { sprintId: sprintId }, sprint: sprint };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should start a planned sprint successfully", async () => {
        await startSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint started successfully'
        }));

        const updatedSprint = await Sprint.findById(sprintId);
        expect(updatedSprint.status).toBe('active');
    });

    it("should return 400 if sprint is not planned", async () => {
        sprint.status = 'active';
        await sprint.save();

        await startSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Only planned sprints can be started'
        });
    });
});

describe("SprintController - completeSprint", () => {
    let req, res, sprintId, sprint;

    beforeEach(async () => {
        sprint = await new Sprint({ name: "Sprint 1", project: new mongoose.Types.ObjectId(), startDate: new Date("2024-01-01"), endDate: new Date("2024-01-15"), status: 'active' }).save();
        sprintId = sprint._id;
        req = { params: { sprintId: sprintId }, sprint: sprint };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should complete an active sprint successfully", async () => {
        await completeSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint completed successfully'
        }));

        const updatedSprint = await Sprint.findById(sprintId);
        expect(updatedSprint.status).toBe('completed');

        const version = await Version.findOne({ sprint: sprintId });
        expect(version).not.toBeNull();
        expect(version.sprint.toString()).toBe(sprintId.toString());
        expect(version.description).toBe(`Release for sprint ${sprint.name}`);
        expect(version.tag).toBe('v0.1.0');
    });

    it("should return 400 if sprint is not active", async () => {
        sprint.status = 'planned';
        await sprint.save();

        await completeSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Only active sprints can be completed'
        });
    });

    it("should create version with specified type", async () => {
        req.body = { type: 'major' };
        await completeSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint completed successfully'
        }));

        const version = await Version.findOne({ sprint: sprintId });
        expect(version).not.toBeNull();
        expect(version.sprint.toString()).toBe(sprintId.toString());
        expect(version.tag).toBe('v1.0.0');
    });
});

describe("SprintController - deleteSprint", () => {
    let req, res, sprintId, sprint;

    beforeEach(async () => {
        sprint = await new Sprint({ name: "Sprint 1", project: new mongoose.Types.ObjectId(), startDate: new Date("2024-01-01"), endDate: new Date("2024-01-15") }).save();
        sprintId = sprint._id;
        req = { params: { sprintId: sprintId }, sprint: sprint };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should delete a sprint successfully", async () => {
        await deleteSprint(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Sprint deleted successfully'
        }));

        const deletedSprint = await Sprint.findById(sprintId);
        expect(deletedSprint).toBeNull();
    });
});
