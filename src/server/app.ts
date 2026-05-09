import { Elysia } from "elysia";
import {
	parseRedirectsToAstroMap,
	REDIRECTS_FILE,
} from "../utils/parse-redirects";
import { apiPlugin } from "./api";
import { staticAssetsPlugin } from "./static";

const SYSTEM_DIR = "./dist/system";
const redirects = parseRedirectsToAstroMap(REDIRECTS_FILE);

export const app = new Elysia()
	// Redirects handling
	.onBeforeHandle(({ path, redirect }) => {
		const rule = redirects[path];
		if (rule) {
			return redirect(
				rule.destination,
				rule.status as 301 | 302 | 303 | 307 | 308,
			);
		}
	})
	// API routes
	.use(apiPlugin)
	// Static assets and content pages
	.use(staticAssetsPlugin)
	// 404 handler (Served internally from system folder)
	.onError(({ code, set }) => {
		if (code === "NOT_FOUND") {
			set.status = 404;
			set.headers["Cache-Control"] = "public, max-age=0, must-revalidate";
			// biome-ignore lint/suspicious/noExplicitAny: Bun is not available in Astro global types
			const f = (globalThis as any).Bun.file(`${SYSTEM_DIR}/404.html`);
			return f
				.exists()
				.then((exists: boolean) =>
					exists ? f : new Response("404 Not Found", { status: 404 }),
				);
		}
	});

export type App = typeof app;
