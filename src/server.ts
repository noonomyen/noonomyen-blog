import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { parseRedirects, REDIRECTS_FILE } from "./utils/parse-redirects.ts";

const PORT = Number.parseInt(process.env.PORT ?? "4321", 10);
const STATIC_DIR = "./dist";

const redirectEntries = parseRedirects(REDIRECTS_FILE);

const app = new Elysia()
	// Trailing slash redirect
	.onRequest(({ request, set }) => {
		const url = new URL(request.url);
		if (url.pathname !== "/" && url.pathname.endsWith("/")) {
			set.redirect = url.pathname.slice(0, -1) + url.search;
			set.status = 301;
		}
	})
	// Custom redirects from src/redirects.txt
	.onRequest(({ request, set }) => {
		const url = new URL(request.url);
		const match = redirectEntries.find((r) => r.source === url.pathname);
		if (match) {
			set.redirect = match.destination;
			set.status = match.status as 301 | 302 | 307 | 308;
		}
	})
	// API routes
	.group(
		"/api",
		(api) =>
			api.onRequest(({ set }) => {
				set.headers["Cache-Control"] = "no-store";
				set.headers["X-Robots-Tag"] = "noindex, nofollow";
			}),
		// Add API routes here
	)
	// Serve static files from dist/
	.use(
		staticPlugin({
			assets: STATIC_DIR,
			prefix: "/",
			extension: true,
			indexHTML: true,
		}),
	)
	.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});

export type App = typeof app;
