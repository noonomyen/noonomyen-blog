import { Elysia } from "elysia";

export const apiPlugin: Elysia<any, any, any, any, any, any, any> = new Elysia({ prefix: "/api" })
	.onBeforeHandle(({ set }) => {
		set.headers["Cache-Control"] = "no-store";
		set.headers["X-Robots-Tag"] = "noindex, nofollow";
	})
	.get("/health", () => ({ status: "ok" }));
