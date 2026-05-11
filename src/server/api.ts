import { Elysia } from "elysia";

export const apiPlugin = new Elysia({
	prefix: "/api",
})
	.onBeforeHandle(({ set }) => {
		set.headers["Cache-Control"] = "no-store";
		set.headers["X-Robots-Tag"] = "noindex, nofollow";
	})
	.get("/health", () => ({ status: "ok" }))
	.get("/version", () => ({
		status: "ok",
		commit: process.env.APP_COMMIT_HASH || null,
	}));
