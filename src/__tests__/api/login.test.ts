import { POST } from "@/app/api/v1/auth/login/route";
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

describe("API Route: /login", () => {
    let server = createTestServer(POST);

    beforeAll((done) => {
        server = createTestServer(POST);
        server.listen(3000, done);

        jest.mock("@/lib/redis", () => {
            return {
                createRateLimit: jest.fn().mockImplementation(() => {
                    return {
                        responseHeader: {
                            "X-RateLimit-Limit": "5",
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": "60"
                        },
                        success: false
                    }
                })
            }
        });
    });

    afterAll((done) => {
        server.close(done);
        jest.clearAllMocks();
    });

    it("should return 200 if email and password are correct", async () => {
        await db.insert(users).values({
            email: "joe@example.com",
            passwordHash: "$2a$10$b1PjHXbAggZjr7YsIFDdf.SE9M1FfFrOl6YooXRr/bA/tegE7jE92" // test
        });

        const response = await request(server)
            .post("/login")
            .send({
                email: "joe@example.com",
                password: "test"
            });

        await db.delete(users).where(and(eq(users.email, "joe@example.com"), eq(
            users.passwordHash, "$2a$10$b1PjHXbAggZjr7YsIFDdf.SE9M1FfFrOl6YooXRr/bA/tegE7jE92" // test
        )))

        expect(response.status).toBe(HTTP_RESPONSE.OK);
    });

    it("should return 400 if email is missing", async () => {
        await request(server)
            .post("/login")
            .send({
                password: "test"
            })
            .expect(HTTP_RESPONSE.BAD_REQUEST);
    });

    it("should return 400 if password is missing", async () => {
        await request(server)
            .post("/login")
            .send({
                email: "joe@example.com"
            })
            .expect(HTTP_RESPONSE.BAD_REQUEST);
    });

    it("should return 429 if too many requests are made", async () => {
        jest.clearAllMocks();


        for (let i = 0; i < 5; i++) {
            await request(server)
                .post("/login")
        }

        await request(server)
            .post("/login")
            .expect(HTTP_RESPONSE.TOO_MANY_REQUESTS);
    })
});