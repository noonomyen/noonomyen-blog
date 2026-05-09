import { Elysia } from "elysia";
import { apiPlugin } from "./api";
import { astroStaticPlugin, contentStaticPlugin } from "./static";

const DEFAULT_PORT = process.env.NODE_ENV === "production" ? "80" : "4321";
const PORT = Number.parseInt(process.env.PORT ?? DEFAULT_PORT, 10);
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

// Handle signals for prompt and graceful shutdown
const handleShutdown = () => {
	console.log("\nShutdown signal received. Stopping server...");
	app.stop().then(() => {
		console.log("Server stopped successfully.");
		process.exit(0);
	});
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

export type App = typeof app;
