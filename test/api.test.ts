import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";

describe("Backend API", () => {
	it("should return 200 for health check", async () => {
		const response = await app.handle(
			new Request("http://localhost/api/health"),
		);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual({ status: "ok" });
	});

	it("should have correct API security and cache headers", async () => {
		const response = await app.handle(
			new Request("http://localhost/api/health"),
		);

		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
	});

	it("should return 404 for unknown API endpoints", async () => {
		const response = await app.handle(
			new Request("http://localhost/api/unknown-endpoint"),
		);
		expect(response.status).toBe(404);
	});
});
