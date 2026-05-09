import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { app } from "../src/server/app";

describe("Core Web Routes", () => {
	let baseUrl: string;

	beforeAll(() => {
		// Listen on a random available port
		app.listen(0);
		baseUrl = `http://localhost:${app.server?.port}`;
	});

	afterAll(async () => {
		await app.stop();
	});

	const coreRoutes = [
		{ path: "/", expected: 200 },
		{ path: "/archive", expected: 200 },
		{ path: "/404", expected: 404 },
		{ path: "/robots.txt", expected: 200 },
		{ path: "/rss.xml", expected: 200 },
		{ path: "/sitemap-index.xml", expected: 200 },
		{ path: "/favicon.ico", expected: 200 },
	];

	for (const route of coreRoutes) {
		it(`should return ${route.expected} for ${route.path}`, async () => {
			const response = await fetch(`${baseUrl}${route.path}`, {
				redirect: "manual",
			});
			expect(response.status).toBe(route.expected);
		});
	}

	it("should return 404 for random non-existent routes", async () => {
		const response = await fetch(`${baseUrl}/this-page-definitely-does-not-exist-12345`);
		expect(response.status).toBe(404);
	});
});
