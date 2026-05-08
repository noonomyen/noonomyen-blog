import { Elysia } from 'elysia';

export const prerender = false;

const app = new Elysia({ prefix: '/api' })
  .get('/', () => 'Hello from Elysia in Astro');

const handle = ({ request }: { request: Request }) => app.handle(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
export const HEAD = handle;