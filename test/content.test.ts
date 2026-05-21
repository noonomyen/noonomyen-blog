import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";
import { glob } from "glob";
import { readFileSync } from "node:fs"

// Helper to convert md file path to site URL path
function fileToPath(filePath: string): string {
    // Expected input: src/content/posts/category/slug/index.md or src/content/posts/slug.md
    let path = filePath
        .replace("src/content/posts/", "/posts/")
        .replace(/index\.mdx?$/, "")
        .replace(/\.mdx?$/, "");

    // Remove trailing slash if not root
    if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
    }
    return path;
}

const mdFiles = glob.sync("src/content/posts/**/*.{md,mdx}");
const contentPaths = mdFiles.map(fileToPath);

describe("Dynamic Content Routing", () => {
	it("should have found some markdown files", () => {
		expect(contentPaths.length).toBeGreaterThan(0);
	});

  for (const path of contentPaths) {
    // There should be a better way to check this (temporary fix).
    const status = readFileSync(`src/content${path}/index.md`).toString().split("---", 2)[1].includes("draft: true") ? 404 : 200;

		it(`should resolve content post: ${path}`, async () => {
			const response = await app.handle(new Request(`http://localhost${path}`));
			expect(response.status).toBe(status);
		});
	}
});
