const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const admin = require("firebase-admin");
const redisClient = require("../src/config/redis");
const { app } = require("../src/app");
const urlController = require("../src/controller/urlController");
jest.setTimeout(15000); // 15 seconds for long-running tests

jest.mock("firebase-admin", () => {
    const auth = {
        verifyIdToken: jest.fn(),
    };
    return {
        auth: () => auth,
        credential: {
            cert: jest.fn(),
        },
        initializeApp: jest.fn(),
    };
});

describe("Google Auth API", () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.disconnect(); // Ensure no active connections
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
        await redisClient.quit(); // Close Redis client
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should authenticate the user with a valid token", async () => {
        const mockUser = {
            uid: "testUid",
            email: "test@example.com",
            name: "Test User",
            picture: "http://example.com/picture.jpg",
        };

        admin.auth().verifyIdToken.mockResolvedValue(mockUser);

        const res = await request(app)
            .post("/api/google-auth")
            .set("Authorization", "validToken");

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User authenticated");
        expect(res.body.data).toMatchObject(mockUser);
        expect(admin.auth().verifyIdToken).toHaveBeenCalledWith("validToken");
    });

    it("should return 401 if no token is provided", async () => {
        const res = await request(app).post("/api/google-auth");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Authorization token is required");
        expect(admin.auth().verifyIdToken).not.toHaveBeenCalled();
    });

    it("should return 401 if the token is invalid", async () => {
        admin.auth().verifyIdToken.mockRejectedValue(new Error("Invalid token"));

        const res = await request(app)
            .post("/api/google-auth")
            .set("Authorization", "invalidToken");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Authentication failed");
        expect(admin.auth().verifyIdToken).toHaveBeenCalledWith("invalidToken");
    });

    it("should return 401 if the token verification fails", async () => {
        admin.auth().verifyIdToken.mockRejectedValue(new Error("Verification failed"));

        const res = await request(app)
            .post("/api/google-auth")
            .set("Authorization", "validToken");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Authentication failed");
        expect(admin.auth().verifyIdToken).toHaveBeenCalledWith("validToken");
    });
});

jest.mock("../src/middleware/authMiddleware", () => {
    return jest.fn((req, res, next) => {
        req.user = { uid: "testUid", email: "test@gmail.com", name: "test", picture: "test.jpg" };
        next();
    });
});

// Mock Redis Client
jest.mock("../src/config/redis", () => ({
    get: jest.fn(),
    set: jest.fn(),
    quit: jest.fn(),
}));



// Mock URL Controller
jest.mock("../src/controller/urlController", () => ({
    createShortUrlHandler: jest.fn(),
    redirectShortUrlHandler: jest.fn(),
}));


describe("URL Shortening API", () => {
    let mongoServer;
    let userToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.disconnect(); // Ensure no active connections
        await mongoose.connect(uri);

        // Mock user token
        userToken = "validUserToken";
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
        await redisClient.quit(); // Close Redis client
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a short URL", async () => {
        // Mock the controller's implementation
        urlController.createShortUrlHandler.mockImplementation((req, res) => {
            res.status(201).send({
                message: "Short URL created successfully",
                data: { shortUrl: "http://localhost/api/shorten/short-url" },
            });
        });

        const res = await request(app)
            .post("/api/shorten")
            .set("Authorization", "validToken")
            .send({
                longUrl: "http://example.com/long-url",
                customAlias: "short-url",
                topic: "test",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Short URL created successfully");
        expect(res.body.data.shortUrl).toBeDefined();
        expect(urlController.createShortUrlHandler).toHaveBeenCalled();
    });


    it("should return 409 if the custom alias is already in use", async () => {
        // Mock a conflict error
        urlController.createShortUrlHandler.mockImplementation((req, res) => {
            res.status(409).send({
                message: "Custom alias already in use",
            });
        });

        const res = await request(app)
            .post("/api/shorten")
            .set("Authorization", "validToken")
            .send({
                longUrl: "http://example.com/long-url",
                customAlias: "existingAlias",
                topic: "test",
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("Custom alias already in use");
        expect(urlController.createShortUrlHandler).toHaveBeenCalled();
    });


    it("should redirect to the long URL", async () => {
        // Mock the controller's implementation
        urlController.redirectShortUrlHandler.mockImplementation((req, res) => {
            res.status(302).redirect("http://example.com/long-url");
        });

        const mockUrl = {
            shortUrl: "short-url",
            longUrl: "http://example.com/long-url",
            _id: "urlId",
        };

        const res = await request(app)
            .get("/api/shorten/short-url");

        expect(res.statusCode).toBe(302);
        expect(res.header.location).toBe(mockUrl.longUrl);
    });

    it("should return 404 if the short URL does not exist", async () => {
        urlController.redirectShortUrlHandler.mockImplementation((req, res) => {
            res.status(404).send({ message: "Short URL not found" });
        });

        const res = await request(app).get("/api/shorten/nonexistent-url");

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Short URL not found");
    });
});


