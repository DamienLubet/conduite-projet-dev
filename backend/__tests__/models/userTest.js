import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../../src/models/user.js';

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
  await User.deleteMany({});
});

describe("User Model", () => {
  it("should create a user", async () => {
    const user = new User({
      username: "test",
      email: "test@example.com",
      password: "password123"
    });
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe("test");
    expect(savedUser.email).toBe("test@example.com");
  });

  it("should not create a user with invalid email", async () => {
    const user = new User({
      username: "test2",
      email: "invalid-email",
      password: "password123"
    });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("should not create a user without required fields", async () => {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("should enforce unique username", async () => {
    const user1 = new User({
      username: "uniqueUser",
      email: "unique@example.com",
      password: "password123"
    });
    await user1.save();

    const user2 = new User({
      username: "uniqueUser",
      email: "notunique@example.com",
      password: "password123"
    });
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
    expect(Object.keys(err.keyPattern)).toEqual(
    expect.arrayContaining(["username"])
    );
  });

  it("should enforce unique email", async () => {
    const user1 = new User({
      username: "userOne",
      email: "unique@example.com",
      password: "password123"
    });
    await user1.save();

    const user2 = new User({
      username: "userTwo",
      email: "unique@example.com",
      password: "password123"
    });
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
    expect(Object.keys(err.keyPattern)).toEqual(
      expect.arrayContaining(["email"])
    );
  });
});