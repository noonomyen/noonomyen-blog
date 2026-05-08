import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

const ASTRO_DIR = "./dist/astro-static";
const CONTENT_DIR = "./dist/content-static";

// 1. Astro Hashed Static Assets (immutable 7 days cache)
export const astroStaticPlugin = new Elysia().use(
	staticPlugin({
		assets: ASTRO_DIR,
		prefix: "/",
		alwaysStatic: true,
		maxAge: 604800,
		directive: "immutable",
	}),
);

// 2. Content HTML Static Pages (revalidate max-age=0 cache)
export const contentStaticPlugin = new Elysia()
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
			extension: true,
			indexHTML: true,
			alwaysStatic: true,
		}),
	);
