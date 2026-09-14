export type TravelDiaryEntry = {
	id: string;
	/** ISO or human date line */
	when: string;
	place: string;
	title: string;
	body: string;
	tags?: string[];
};

/** Curated travel log (~1 year in Japan total, multiple trips). Prose is editorial, not synced to Immich. */
export const TRAVEL_DIARY_INTRO =
	"A long-term japanophile pattern: not one sprint through Tokyo Disney, but repeated stays — " +
	"roughly a year on the ground across visits, enough to stop performing tourist and start noticing laundry theft making the Japan Times. " +
	"Pair this text with your photo library in Immich (see below).";

export const TRAVEL_DIARY_ENTRIES: TravelDiaryEntry[] = [
	{
		id: "arrival-haneda",
		when: "Spring arrival · Haneda",
		place: "Tokyo",
		title: "Land inside the city",
		body:
			"Haneda beats Narita for jet-lagged sanity: monorail hum, first Suica tap, humidity through the taxi window. " +
			"Shibuya scramble at night — orderly chaos, no eye contact, everyone still polite when the light changes. " +
			"First konbini onigiri tastes like victory.",
		tags: ["tokyo", "konbini"],
	},
	{
		id: "nikko-day",
		when: "Long weekend · Tobu line",
		place: "Nikko",
		title: "Gold that isn’t subtle",
		body:
			"Toshogu is everything Meiji restraint is not: Ieyasu enshrined as politics in lacquer. Cedar avenue in light rain; " +
			"Okusha path actually quiet compared to the gate selfies. Day trip from Tokyo works; overnight would have been Chuzenji.",
		tags: ["nikko", "history"],
	},
	{
		id: "kyoto-night",
		when: "Autumn · Kansai base",
		place: "Kyoto",
		title: "Torii after the crowds leave",
		body:
			"Fushimi Inari at nightfall, not dawn — torii glow orange, forest sounds return, steps need a pocket light. " +
			"Daytime Kyoto is temple queues; evening Higashiyama lanes feel closer to the city people romanticize.",
		tags: ["kyoto", "fushimi"],
	},
	{
		id: "learn-streak",
		when: "Weekly habit · anywhere with Wi‑Fi",
		place: "Study",
		title: "Japanese on the road",
		body:
			"Exam drills on Learn between meetings; kanji lookups from menus I couldn’t read last trip. " +
			"Progress session id in Settings ties quiz scores here on the Study log tab — streaks beat guilt.",
		tags: ["learn", "jlpt"],
	},
	{
		id: "crime-contrast",
		when: "Reading the paper · Tokyo",
		place: "Daily life",
		title: "Japan Times vs home headlines",
		body:
			"Some days the worst crime in the English paper is a clothesline thief — underwear stolen off a balcony. " +
			"Back in a large US city the same week’s lead stories are shootings. Not utopia (ore-ore fraud, chikan, upskirting are real) but the violent floor is different.",
		tags: ["safety", "media"],
	},
	{
		id: "nightlife-once",
		when: "One night · club district",
		place: "Tokyo",
		title: "Yakuza flash (rare)",
		body:
			"A year total in Japan; open gang violence seen once: a large, drunk Western patron out of line in a club, " +
			"then compact enforcers — fast, loud, gone. Spectacular, still assault. Movies exaggerate daily life; this was exception, not routine.",
		tags: ["safety", "yakuza"],
	},
	{
		id: "photos-immich",
		when: "After each trip",
		place: "Archive",
		title: "Where the real diary lives",
		body:
			"Text is shorthand. Geotagged albums, faces, and seasons live in Immich — use immich-mcp to search “Japan”, build shared links, " +
			"and let agents attach photos to chat without dumping RAWs into this repo.",
		tags: ["immich", "photos"],
	},
];

export const IMMICH_MCP = {
	id: "immich-mcp",
	name: "immich-mcp",
	github: "https://github.com/sandraschi/immich-mcp",
	webapp: "http://127.0.0.1:10838",
	api: "http://127.0.0.1:10839",
	ports: { frontend: 10838, backend: 10839 },
};
