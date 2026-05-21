import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";
import fs from "node:fs";

const TARGET_URL = process.env.TARGET_URL || null;
const PATHS_FILE = "data/backward-compatible-content-path.txt";
const paths = fs
	.readFileSync(PATHS_FILE, "utf-8")
	.split("\n")
	.map(p => p.trim())
	.filter(p => p && !p.startsWith("--"));

const statusMap: Record<string, number> = {
  "+": 301, // redirect
  "-": 200, // no change
  "x": 404 // removed
};

async function fetchStatus(path: string): Promise<number> {
  if (!TARGET_URL) return app.handle(new Request(`http://localhost${path}`)).then(response => response.status);
  return await fetch(`${TARGET_URL}${path}`, { redirect: "manual" }).then(response => response.status);
}

describe("Backward Compatibility Routing", () => {
  for (let path of paths) {
    const status = statusMap[path.charAt(0)];
    path = path.slice(1);
    if (path.endsWith("/")) path = path.slice(0, -1);

		it(`should resolve legacy path ${path} correctly`, async () => {
		  expect(await fetchStatus(path)).toBe(status);
    });

		path += "/";
		it(`should resolve legacy path ${path} correctly (trailing slash)`, async () => {
		  expect(await fetchStatus(path)).toBe(status);
    });
	}
});
