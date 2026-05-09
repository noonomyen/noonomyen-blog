import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";
import fs from "node:fs";

const PATHS_FILE = "data/backward-compatible-content-path.txt";
const paths = fs
	.readFileSync(PATHS_FILE, "utf-8")
	.split("\n")
	.map(p => p.trim())
	.filter(p => p && !p.startsWith("--"));

describe("Backward Compatibility Routing", () => {
	for (const path of paths) {
		it(`should resolve legacy path ${path} correctly`, async () => {
			const response = await app.handle(
				new Request(`http://localhost${path}`),
			);
			expect([200, 301, 302]).toContain(response.status);
			await response.blob(); // Consume body
		});
	}
});
