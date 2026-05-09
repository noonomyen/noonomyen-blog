import { getImage } from "astro:assets";
import path from "node:path";
import { url } from "./url-utils";

// Glob is defined at module level so it runs only once per build
const files = import.meta.glob<ImageMetadata>("../**/*", {
	import: "default",
});

function isRemote(src: string): boolean {
	return (
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("data:")
	);
}

export async function resolveOgImage(
	src?: string,
): Promise<string | undefined> {
	if (!src || src.trim() === "") {
		return undefined;
	}

	// 1. Remote URL
	if (isRemote(src)) {
		return src;
	}

	// 2. Absolute path (public folder)
	if (src.startsWith("/")) {
		return url(src);
	}

	// 3. Local relative path (source folder)
	// Try to resolve via glob
	let normalizedPath = path
		.normalize(path.join("../", "/", src))
		.replace(/\\/g, "/");
	
	const file = files[normalizedPath];

	if (file) {
		const img = await file();
		const optimizedImage = await getImage({ src: img, format: "webp" });
		return optimizedImage.src;
	}

	// Fallback to string if not found in glob
	return src;
}
