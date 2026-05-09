import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { app } from "../src/server/app";
import fs from "node:fs";

const PATHS_FILE = "data/backward-compatible-content-path.txt";
const paths = fs
	.readFileSync(PATHS_FILE, "utf-8")
	.split("\n")
	.map(p => p.trim())
	.filter(p => p && !p.startsWith("--"));

describe("Backward Compatibility Routing", () => {
	let baseUrl: string;

	beforeAll(() => {
		app.listen(0);
		baseUrl = `http://localhost:${app.server?.port}`;
	});

	afterAll(async () => {
		await app.stop();
	});

	for (const path of paths) {
		it(`should resolve legacy path ${path} correctly`, async () => {
			const response = await fetch(`${baseUrl}${path}`, {
				redirect: "manual",
			});
			expect([200, 301, 302]).toContain(response.status);
		});
	}
});
