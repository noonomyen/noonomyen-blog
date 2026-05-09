import { app } from "./app";

const DEFAULT_PORT = process.env.NODE_ENV === "production" ? "80" : "4321";
const PORT = Number.parseInt(process.env.PORT ?? DEFAULT_PORT, 10);

app.listen(PORT, () => {
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
