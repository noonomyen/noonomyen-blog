import { Elysia } from "elysia";

export const prerender = false;

const app = new Elysia({ prefix: "/api" })
	.onRequest(({ set }) => {
		set.headers["Cache-Control"] = "no-store";
		set.headers["X-Robots-Tag"] = "noindex, nofollow";
	});

const handle = ({ request }: { request: Request }) => app.handle(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
export const HEAD = handle;
