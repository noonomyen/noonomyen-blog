import { expect, test } from "bun:test";
import { app } from "../src/server/app";

test("health check returns 200", async () => {
	const response = await app.handle(new Request("http://localhost/api/health"));
	expect(response.status).toBe(200);
	expect(await response.json()).toEqual({ status: "ok" });
});

test("correct security headers", async () => {
	const response = await app.handle(new Request("http://localhost/api/health"));
	expect(response.headers.get("Cache-Control")).toBe("no-store");
	expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
	await response.text();
});

test("unknown endpoint returns 404", async () => {
	const response = await app.handle(
		new Request("http://localhost/api/unknown-endpoint"),
	);
	expect(response.status).toBe(404);
	await response.text();
});
