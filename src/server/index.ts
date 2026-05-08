import { Elysia } from "elysia";
import { apiPlugin } from "./api";
import { astroStaticPlugin, contentStaticPlugin } from "./static";

const PORT = Number.parseInt(process.env.PORT ?? "4321", 10);
const SYSTEM_DIR = "./dist/system";

const app = new Elysia()
	// API routes
	.use(apiPlugin)
	// 1. Serve hashed/immutable Astro static assets
	.use(astroStaticPlugin)
	// 2. Serve content pages/HTML assets via scoped sub-instance
	.use(contentStaticPlugin)
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
	})
	.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});

export type App = typeof app;
