import fs from "node:fs";
import path from "node:path";

export type RedirectEntry = {
	source: string;
	destination: string;
	status: number;
};

export type AstroRedirectMap = Record<
	string,
	{ status: number; destination: string }
>;

function tokenize(line: string): string[] {
	const tokens: string[] = [];
	const regex = /(?:"([^"]*)")|(\S+)/g;
	for (const match of line.matchAll(regex)) {
		tokens.push(match[1] !== undefined ? match[1] : match[2]);
	}
	return tokens;
}

export function parseRedirects(filePath: string): RedirectEntry[] {
	const redirects: RedirectEntry[] = [];

	if (!fs.existsSync(filePath)) {
		throw new Error(`Redirects file not found at: ${filePath}`);
	}

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	for (const raw of lines) {
		const line = raw.trim();
		if (!line || line.startsWith("--")) continue;

		const tokens = tokenize(line);
		if (tokens.length < 2) continue;

		const source = tokens[0];
		const destination = tokens[1];
		const status = tokens[2] ? Number.parseInt(tokens[2], 10) : 301;

		redirects.push({ source, destination, status });
	}

	return redirects;
}

export function parseRedirectsToAstroMap(filePath: string): AstroRedirectMap {
	const entries = parseRedirects(filePath);
	const map: AstroRedirectMap = {};
	for (const entry of entries) {
		map[entry.source] = {
			status: entry.status,
			destination: entry.destination,
		};
	}
	return map;
}

export const REDIRECTS_FILE = path.resolve("./src/redirects.txt");
