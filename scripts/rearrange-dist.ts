import { mkdir, rename, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DIST_DIR = "./dist";
const SYSTEM_DIR = join(DIST_DIR, "system");
const ASTRO_DIR = join(DIST_DIR, "astro-static");
const CONTENT_DIR = join(DIST_DIR, "content-static");

try {
	// 1. Create target directories
	await mkdir(SYSTEM_DIR, { recursive: true });
	await mkdir(ASTRO_DIR, { recursive: true });
	await mkdir(CONTENT_DIR, { recursive: true });

	// 2. Move 404.html to system/
	const legacy404 = join(DIST_DIR, "404.html");
	if (existsSync(legacy404)) {
		await rename(legacy404, join(SYSTEM_DIR, "404.html"));
	}

	// 3. Move _astro/ to astro-static/
	const astroAssets = join(DIST_DIR, "_astro");
	if (existsSync(astroAssets)) {
		await rename(astroAssets, join(ASTRO_DIR, "_astro"));
	}

	// 4. Move everything else to content-static/ (skipping system, astro-static, and content-static)
	const files = await readdir(DIST_DIR);
	for (const file of files) {
		if (["system", "astro-static", "content-static"].includes(file)) {
			continue;
		}
		await rename(join(DIST_DIR, file), join(CONTENT_DIR, file));
	}

	console.log("Dist directories rearranged successfully!");
} catch (error) {
	console.error("Failed to rearrange dist directories:", error);
	process.exit(1);
}
