import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";

describe("Core Web Routes", () => {
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
			const response = await app.handle(
				new Request(`http://localhost${route.path}`),
			);
			expect(response.status).toBe(route.expected);
		});
	}

	it("should return 404 for random non-existent routes", async () => {
		const response = await app.handle(
			new Request("http://localhost/this-page-definitely-does-not-exist-12345"),
		);
		expect(response.status).toBe(404);
	});
});
