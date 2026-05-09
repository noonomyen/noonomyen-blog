import { describe, expect, it } from "bun:test";
import { app } from "../src/server/app";
import { glob } from "glob";

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
		it(`should resolve content post: ${path}`, async () => {
			const response = await app.handle(
				new Request(`http://localhost${path}`),
			);

			// We expect 200 for content. If it redirects, we still consider it valid for now
			expect([200, 301, 302]).toContain(response.status);
			await response.blob(); // Consume body
		});
	}
});
