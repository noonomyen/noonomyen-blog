import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const TARGET_DIR = path.join("dist", "astro-static", "_astro");

async function main() {
	const dirStat = await stat(TARGET_DIR).catch(() => undefined);
	if (!dirStat?.isDirectory()) {
		console.log(`Skip purge. Directory not found: ${TARGET_DIR}`);
		return;
	}

	const entries = await readdir(TARGET_DIR, { withFileTypes: true });
	let deleted = 0;

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".png")) {
			continue;
		}

		await rm(path.join(TARGET_DIR, entry.name));
		deleted++;
		console.log(`Deleted: ${entry.name}`);
	}

	console.log(`Total PNG deleted: ${deleted}`);
}

main().catch((error) => {
	console.error("PNG purge failed:", error);
	process.exit(1);
});
