/** Knowledge article sidebar clusters (culture box — not the Language curriculum page). */

export const KNOWLEDGE_CLUSTERS = [
	{ id: "all", label: "All topics" },
	{ id: "history", label: "History" },
	{ id: "society", label: "Daily life & society" },
	{ id: "politics", label: "Politics & economy" },
	{ id: "culture", label: "Culture & arts" },
	{ id: "travel", label: "Travel & geography" },
	{ id: "crime", label: "Crime & justice" },
] as const;

export type KnowledgeClusterId = (typeof KNOWLEDGE_CLUSTERS)[number]["id"];

const PAGE_LABELS: Record<string, string> = {
	"2026-snapshot": "2026 Snapshot",
	"20thcentury": "20th Century",
	anime: "Anime",
	art: "Art",
	bakumatsu: "Bakumatsu",
	battles: "Battles",
	cuisine: "Cuisine",
	culture: "Culture",
	dailylife: "Daily Life",
	economy: "Economy",
	education: "Education",
	emperors: "Emperors",
	"games-gambling": "Games & Gambling",
	geography: "Geography",
	history: "History",
	kombini: "Kombini",
	language: "Language & Literacy (society)",
	literature: "Literature",
	manga: "Manga",
	modern: "Modern Japan",
	personages: "Personages",
	"police-justice": "Police & Justice",
	problems: "Societal Problems",
	religion: "Religion",
	"samurai-era": "Samurai Era",
	samurai: "Samurai",
	shopping: "Shopping & Vending",
	strengths: "Strengths",
	timeline: "Timeline",
	travel: "Travel Guide",
	yakuza: "Yakuza (Organized Crime)",
};

function titleCaseWords(raw: string): string {
	return raw
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export function pageLabel(stem: string): string {
	if (PAGE_LABELS[stem]) return PAGE_LABELS[stem];
	const spaced = stem
		.replace(/([a-z])([0-9])/g, "$1 $2")
		.replace(/[-_]/g, " ");
	return titleCaseWords(spaced);
}

export const PAGE_CLUSTER: Record<string, KnowledgeClusterId> = {
	"2026-snapshot": "politics",
	"20thcentury": "history",
	anime: "culture",
	art: "culture",
	bakumatsu: "history",
	battles: "history",
	cuisine: "society",
	culture: "society",
	dailylife: "society",
	economy: "politics",
	education: "society",
	emperors: "history",
	"games-gambling": "crime",
	geography: "travel",
	history: "history",
	kombini: "society",
	language: "culture",
	literature: "culture",
	manga: "culture",
	modern: "society",
	personages: "history",
	"police-justice": "crime",
	problems: "society",
	religion: "society",
	"samurai-era": "history",
	samurai: "history",
	shopping: "society",
	strengths: "society",
	timeline: "history",
	travel: "travel",
	yakuza: "crime",
};

export function pagesInCluster(
	stems: string[],
	cluster: KnowledgeClusterId,
): string[] {
	if (cluster === "all") {
		return stems;
	}
	return stems.filter((stem) => PAGE_CLUSTER[stem] === cluster);
}
