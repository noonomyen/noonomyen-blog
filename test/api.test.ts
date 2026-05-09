import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { app } from "../src/server/app";

describe("Backend API", () => {
	let baseUrl: string;

	beforeAll(() => {
		app.listen(0);
		baseUrl = `http://localhost:${app.server?.port}`;
	});

	afterAll(async () => {
		await app.stop();
	});

	it("should return 200 for health check", async () => {
		const response = await fetch(`${baseUrl}/api/health`);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual({ status: "ok" });
	});

	it("should have correct API security and cache headers", async () => {
		const response = await fetch(`${baseUrl}/api/health`);
		
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
	});

    it("should return 404 for unknown API endpoints", async () => {
        const response = await fetch(`${baseUrl}/api/unknown-endpoint`);
        expect(response.status).toBe(404);
    });
});
