import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 11194,
		host: true,
		proxy: {
			// NOTE: only /api + /health are proxied. /games, /know, /skills are
			// frontend ROUTES - proxying them shadows the SPA (same bug once shipped
			// JSON 404s for page navigations). Static assets come from the backend
			// origin directly (see BACKEND constant in lib/api.ts); backend has CORS open.
			"/api": "http://127.0.0.1:11193",
			"/health": "http://127.0.0.1:11193",
		},
	},
});
