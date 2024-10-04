import { POST } from "@/app/api/v1/auth/signup/route";
import { HTTP_RESPONSE } from "@/constants/api";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createTestServer } from "@/lib/test-utils";
import { and, eq } from "drizzle-orm";
import request from "supertest"


jest.mock("server-only", () => {
    return {};
});

jest.mock('next/headers', () => ({
    ...jest.requireActual('next/headers'),
    cookies: jest.fn(() => ({
        set: jest.fn(),
    })),
}));

jest.mock('@/lib/redis', () => ({
    ...jest.requireActual('@/lib/redis'),
    createRateLimit: jest.fn().mockResolvedValue({
        responseHeader: new Headers({
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "5",
            "X-RateLimit-Reset": "0",
        }),
        success: true,
    }),
}));

describe("API Route: /signup", () => {
    let server = createTestServer(POST);

    beforeAll((done) => {
        server = createTestServer(POST);
        server.listen(3000, done);
    });


    afterAll((done) => {
        server.close(done);
        jest.clearAllMocks();
    });

    it("should return 201 if user is created", async () => {
        const response = await request(server)
            .post("/")
            .send({
                email: "user@example.com",
                name: "test",
                password: "test",
                confirmPassword: "test"
            });

        const user = await db.query.users.findFirst({
            where: eq(users.email, "user@example.com")
        });

        await db.delete(users).where(eq(users.email, "user@example.com"));

        expect(response.status).toBe(HTTP_RESPONSE.CREATED);
        expect(user).not.toBeNull();
    });

    it("should return 400 if email is not provided", async () => {
        const response = await request(server)
            .post("/")
            .send({
                password: "test"
            });

        expect(response.status).toBe(HTTP_RESPONSE.BAD_REQUEST);
    });

    it("should return 400 if email is invalid", async () => {
        const response = await request(server)
            .post("/")
            .send({
                email: "invalid",
                name: "test",
                confirmPassword: "test",
                password: "test"
            });

        expect(response.status).toBe(HTTP_RESPONSE.BAD_REQUEST);
    });

    it("should return 400 if email already exists", async () => {
        await db.insert(users).values({
            email: "john@example.com",
            passwordHash: "$2a$10$b1PjHXbAggZjr7YsIFDdf.SE9M1FfFrOl6YooXRr/bA/tegE7jE92" // test
        });

        const response = await request(server)
            .post("/")
            .send({
                email: "john@example.com",
                name: "test",
                password: "test",
                confirmPassword: "test"
            });

        await db.delete(users).where(and(eq(users.email, "john@example.com"), eq(users.passwordHash, "$2a$10$b1PjHXbAggZjr7YsIFDdf.SE9M1FfFrOl6YooXRr/bA/tegE7jE92")));

        expect(response.status).toBe(HTTP_RESPONSE.BAD_REQUEST);
    });


});