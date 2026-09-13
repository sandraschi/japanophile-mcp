import { LlmPageGate } from "@/components/LlmPageGate";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
} from "react-router-dom";
import App from "./App";
import AiSettingsPage from "./pages/AiSettingsPage";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Diary from "./pages/Diary";
import Games from "./pages/Games";
import Help from "./pages/Help";
import Know from "./pages/Know";
import Learn from "./pages/Learn";
import Logs from "./pages/Logs";
import Skills from "./pages/Skills";
import Tools from "./pages/Tools";
import Travel from "./pages/Travel";
import { AppsPage } from "./pages/apps";
import ToolRunner from "./pages/tool-runner";
import "./index.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <Dashboard /> },
			{ path: "learn", element: <Learn /> },
			{ path: "know", element: <Know /> },
			{ path: "travel", element: <Travel /> },
			{ path: "diary", element: <Diary /> },
			{ path: "games", element: <Games /> },
			{
				path: "chat",
				element: (
					<LlmPageGate>
						<Chat />
					</LlmPageGate>
				),
			},
			{ path: "skills", element: <Skills /> },
			{ path: "tools", element: <Tools /> },
			{ path: "tools/:name", element: <ToolRunner /> },
			{ path: "apps", element: <AppsPage /> },
			{ path: "settings", element: <AiSettingsPage /> },
			{ path: "ai-settings", element: <Navigate to="/settings" replace /> },
			{ path: "help", element: <Help /> },
			{ path: "logs", element: <Logs /> },
		],
	},
]);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root");
createRoot(rootEl).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
