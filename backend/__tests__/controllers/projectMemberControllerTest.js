import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { addProjectMember, changeMemberRole, removeProjectMember } from "../../src/controllers/projectMemberController";
import Project from "../../src/models/project.js";
import User from "../../src/models/user.js";

let mongoServer;
let project, member, owner;
let res;

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
	await Project.deleteMany({});
	await User.deleteMany({});
	jest.clearAllMocks();
});

beforeEach(async () => {
    owner = await new User({ username: "owner", email: "owner@example.com", password: "pass" }).save();
    member = await new User({ username: "dev", email: "dev@example.com", password: "pass" }).save();
    project = await new Project({ name: "Project", owner: owner._id }).save();

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
});

describe("ProjectMemberController - addProjectMember", () => {


	it("adds a member by email", async () => {
		const req = { body: { email: member.email }, project };

		await addProjectMember(req, res);

		const updated = await Project.findById(project._id);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
		expect(updated.members).toHaveLength(1);
		expect(updated.members[0].userID.toString()).toBe(member._id.toString());
		expect(updated.members[0].role).toBe("Developer");
	});

	it("returns 404 when user not found", async () => {
		const req = { body: { email: "missing@example.com" }, project };

		await addProjectMember(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "User not found." }));
	});

	it("returns 400 when user already a member", async () => {
        project.members.push({ userID: member._id });
		const req = { body: { email: member.email }, project };

		await addProjectMember(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'User is already a member of the project.' }));
	});
});

describe("ProjectMemberController - removeProjectMember", () => {
    it("removes an existing member", async () => {
        project.members.push({ userID: member._id, role: 'Developer' });
        await project.save();
		const req = { body: { email: member.email }, project };

		await removeProjectMember(req, res);

		const updated = await Project.findById(project._id);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
		expect(updated.members).toHaveLength(0);
	});

	it("returns 404 when user not found", async () => {
		const req = { body: { email: "missing@example.com" }, project };

		await removeProjectMember(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'User not found.' }));
	});

    it("returns 404 when user not a member", async () => {
        const nonMember = await new User({ username: "dev2", email: "dev2@example.com", password: "pass" }).save();
		const req = { body: { email: nonMember.email }, project };

		await removeProjectMember(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'User is not a member of this project.' }));
	});
});

describe("ProjectMemberController - changeMemberRole", () => {
    beforeEach(async () => {
        project.members.push({ userID: member._id, role: 'Developer' });
        await project.save();
    });

	it("updates member role to Viewer", async () => {
		const req = { body: { username: member.username, newRole: 'Viewer' }, project };

		await changeMemberRole(req, res);

		const updated = await Project.findById(project._id);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
		expect(updated.members[0].role).toBe('Viewer');
	});

	it("returns 400 for invalid role", async () => {
		const req = { body: { username: member.username, newRole: 'Owner' }, project };

		await changeMemberRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Invalid role specified.' }));
	});

	it("returns 404 when user not found", async () => {
		const req = { body: { username: 'missingUser', newRole: 'Viewer' }, project };

		await changeMemberRole(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'User not found.' }));
	});

	it("returns 404 when user not a member", async () => {
        const nonMember = await new User({ username: "dev2", email: "dev2@example.com", password: "pass" }).save();
		const req = { body: { username: nonMember.username, newRole: 'Viewer' }, project };

		await changeMemberRole(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'User is not a member of this project.' }));
	});
});
