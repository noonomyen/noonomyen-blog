import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import path from "node:path";

// Specific directory for hashed assets to avoid prefix collision at root
const ASTRO_ASSETS_DIR = path.resolve("./dist/astro-static/_astro");
const CONTENT_DIR = path.resolve("./dist/content-static");

const isTest = process.env.NODE_ENV === "test";

/**
 * Unified static asset plugin.
 * Separates hashed assets from root content to prevent route collision.
 */
export const staticAssetsPlugin = new Elysia()
	// 1. Astro Hashed Static Assets (e.g., /_astro/chunk.js)
	// Mounted on /_astro to keep / clean for content
	.use(
		staticPlugin({
			assets: ASTRO_ASSETS_DIR,
			prefix: "/_astro",
			alwaysStatic: !isTest,
			maxAge: 604800,
			directive: "immutable",
		}),
	)
	// 2. Content HTML Static Pages & Root Assets (robots.txt, favicon.ico, etc.)
	.onBeforeHandle(({ set, path, redirect }) => {
		if (path.endsWith("/index.html")) {
			return redirect(path.slice(0, -11) || "/", 301);
		}
		set.headers["Cache-Control"] = "public, max-age=0, must-revalidate";
	})
	.use(
		staticPlugin({
			assets: CONTENT_DIR,
			prefix: "/",
			indexHTML: true,
			alwaysStatic: !isTest,
		}),
	);
