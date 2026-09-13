import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LlmPageGate } from "@/components/LlmPageGate";
import App from "./App";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Help from "./pages/Help";
import Know from "./pages/Know";
import Travel from "./pages/Travel";
import Diary from "./pages/Diary";
import Learn from "./pages/Learn";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Skills from "./pages/Skills";
import Tools from "./pages/Tools";
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
			{ path: "settings", element: <Settings /> },
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
