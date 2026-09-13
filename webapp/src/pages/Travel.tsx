import { Link } from "react-router-dom";
import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";

export default function Travel() {
	return (
		<div>
			<h2 className="mb-2 text-2xl font-bold" data-testid="travel-hero">
				Plan · Travel
			</h2>
			<p className="mb-4 max-w-2xl text-sm text-zinc-400">
				Vendored travel guide from the knowledge box (JR, regions, budget, etiquette).
				Interactive itinerary planner and bookings are{" "}
				<strong className="text-zinc-300">roadmap</strong> — same content also lives under{" "}
				<Link to="/know" className="text-blue-400 hover:underline">
					Know → travel
				</Link>
				.
			</p>
			<KnowledgeArticleView page="travel" testId="travel-iframe" />
		</div>
	);
}
