import {
	KyotoPhotoGallery,
	NikkoPhotoGallery,
	TokyoPhotoGallery,
} from "@/components/TravelPhotoGallery";
import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";
import { PageTabs } from "@/components/PageTabs";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const TABS = [
	{ id: "plan", label: "Planning checklist" },
	{ id: "flights", label: "Flights & fares" },
	{ id: "trains", label: "Shinkansen & passes" },
	{ id: "buses", label: "Highway & night buses" },
	{ id: "places", label: "Where to go" },
	{ id: "tokyo", label: "Tokyo" },
	{ id: "kansai", label: "Kyoto & Osaka" },
	{ id: "nikko", label: "Nikko" },
	{ id: "hazards", label: "Hazards & seasons" },
	{ id: "housing", label: "Sharehouses & stays" },
	{ id: "legal", label: "Visas & stay length" },
	{ id: "insurance", label: "Insurance" },
	{ id: "guide", label: "Budget travel guide" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-violet-400 underline decoration-violet-400/40 hover:text-violet-300"
		>
			{children}
		</a>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="mb-8 space-y-3">
			<h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
			<div className="space-y-2 text-sm leading-relaxed text-zinc-300">
				{children}
			</div>
		</section>
	);
}

function AirlineCard({
	name,
	href,
	note,
}: {
	name: string;
	href: string;
	note: string;
}) {
	return (
		<li className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
			<p className="font-medium text-zinc-100">
				<ExtLink href={href}>{name}</ExtLink>
			</p>
			<p className="mt-1 text-xs text-zinc-400">{note}</p>
		</li>
	);
}

function PlaceCard({
	name,
	what,
	trip,
}: {
	name: string;
	what: string;
	trip: string;
}) {
	return (
		<li className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
			<p className="font-medium text-zinc-100">{name}</p>
			<p className="mt-1 text-sm text-zinc-300">{what}</p>
			<p className="mt-2 text-xs text-zinc-500">{trip}</p>
		</li>
	);
}

export default function Travel() {
	const [params, setParams] = useSearchParams();
	const initial = useMemo(() => {
		const t = params.get("tab") ?? "plan";
		return TAB_IDS.has(t) ? (t as TabId) : "plan";
	}, [params]);
	const [tab, setTab] = useState<TabId>(initial);

	useEffect(() => {
		setTab(initial);
	}, [initial]);

	const selectTab = (id: TabId) => {
		setTab(id);
		setParams({ tab: id }, { replace: true });
	};

	return (
		<div data-testid="travel-page">
			<h2 className="mb-2 text-2xl font-bold" data-testid="travel-hero">
				Plan · Travel
			</h2>
			<p className="mb-4 max-w-3xl text-sm text-zinc-400">
				Practical planning: airlines, housing, legal stay limits, and insurance.
				Prices and rules change — verify on official sites before you book. Not
				legal or medical advice.
			</p>

			<PageTabs
				tabs={[...TABS]}
				active={tab}
				onChange={(id) => selectTab(id as TabId)}
				testId="travel-tabs"
			/>

			{tab === "plan" && (
				<div data-testid="travel-panel-plan">
					<Section title="Before you book">
						<ol className="list-decimal space-y-2 pl-5">
							<li>
								Passport validity (often 6+ months beyond return date — check
								your nationality).
							</li>
							<li>
								Maximum stay allowed on your visa status (see{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("legal")}
								>
									Visas tab
								</button>
								).
							</li>
							<li>
								Travel medical insurance for the whole trip (see{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("insurance")}
								>
									Insurance tab
								</button>
								).
							</li>
							<li>
								Compare flights 2–4 months ahead for long-haul (
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("flights")}
								>
									Flights tab
								</button>
								: Haneda vs Narita, N&apos;EX, monorail).
							</li>
							<li>
								Book housing early for Tokyo peak seasons (March–April sakura,
								Golden Week, autumn).
							</li>
							<li>
								Run the rail pass math before you buy —{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("trains")}
								>
									Shinkansen & passes
								</button>
								; overnight{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("buses")}
								>
									buses
								</button>{" "}
								are a cheap alternative if time allows.
							</li>
							<li>
								Check{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("hazards")}
								>
									hazards & seasons
								</button>{" "}
								(heat, typhoons, earthquakes) before picking dates.
							</li>
						</ol>
					</Section>
					<Section title="Also in this app">
						<p>
							<Link
								to="/know?page=travel"
								className="text-violet-400 hover:underline"
							>
								Know → travel
							</Link>{" "}
							mirrors the budget guide article.{" "}
							<Link
								to="/help?tab=learn-japanese"
								className="text-violet-400 hover:underline"
							>
								Help → So you want to learn Japanese?
							</Link>{" "}
							if you are combining study and travel.
						</p>
					</Section>
				</div>
			)}

			{tab === "flights" && (
				<div data-testid="travel-panel-flights">
					<Section title="Compare prices (schedules + fares)">
						<p>
							Use metasearch first, then book on the airline or a trusted agent:
						</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<ExtLink href="https://www.google.com/travel/flights">
									Google Flights
								</ExtLink>{" "}
								— calendar view, multi-city
							</li>
							<li>
								<ExtLink href="https://www.skyscanner.net/">Skyscanner</ExtLink>{" "}
								— broad OTA comparison
							</li>
							<li>
								<ExtLink href="https://www.kayak.com/">Kayak</ExtLink> — price
								alerts
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							Ticket prices swing with season, fuel, and sales; Scoot and legacy
							carriers often differ by ¥30k–80k on the same route week to week.
						</p>
					</Section>
					<Section title="Airlines (book direct when possible)">
						<p className="text-xs text-zinc-500 mb-3">
							Legacy full-service: best service and through-checking to domestic
							Japan flights, but cheap tickets are often non-changeable. Compare
							fare rules before you assume “economy” is flexible.
						</p>
						<ul className="grid gap-3 sm:grid-cols-2">
							<AirlineCard
								name="ANA (All Nippon Airways)"
								href="https://www.ana.co.jp/en/jp/"
								note="Star Alliance flagship; polish, punctuality, and the densest domestic network (HND/NRT → everywhere). Long-haul often lands Haneda when possible — huge time save. Cheap international fares are rigid; flex or business if typhoon season might move dates. Vienna and Europe routes often via FRA/MUC partners — check whether one ticket covers the whole journey."
							/>
							<AirlineCard
								name="JAL (Japan Airlines)"
								href="https://www.jal.co.jp/en/"
								note="Oneworld; rivals ANA on service and domestic coverage. Strong if you already use BA/AA/oneworld miles. ZIPAIR (below) is their budget long-haul arm — same group, different rules. Like ANA, only upper fare buckets or insurance save you when plans change."
							/>
							<AirlineCard
								name="Scoot"
								href="https://www.flyscoot.com/"
								note="Budget subsidiary of Singapore Airlines — modern fleet (787 Dreamliners and newer narrow-bodies), usually via SIN to NRT/HND/KIX. Base fares are cheap; tick the flex/rebook-cancellation add-ons at checkout — for a modest fee you get changeable or refundable rules that full-service carriers usually reserve for pricey flex economy or business. Worth it if typhoon season or visa timing might shift your dates."
							/>
							<AirlineCard
								name="Austrian Airlines"
								href="https://www.austrian.com/"
								note="Star Alliance; seasonal nonstop VIE–NRT is the dream for Austrians (no FRA hub stress). Miles & More earning; codeshare onto ANA domestic. When nonstop is not running, you are on Lufthansa-group connections — same strict economy rules, EU261 delay rights on the EU leg."
							/>
							<AirlineCard
								name="Lufthansa / SWISS"
								href="https://www.lufthansa.com/"
								note="Workhorse Europe–Japan via FRA/MUC (LH) or ZRH (LX). Frequent but tight connections — allow buffer at FRA in winter. Second checked bag and seat selection often cost extra on lowest fares. SWISS long-haul product is consistently good; neither LH nor LX gives cheap ticket flexibility without a fare upgrade."
							/>
							<AirlineCard
								name="ZIPAIR Tokyo"
								href="https://www.zipair.net/en"
								note="JAL’s long-haul LCC from Narita — 787 fleet, stripped base fare (bags/meals/seat extra). Japan–Bangkok/US routes common; watch for NRT only. Flex-change bundles at booking are the Scoot-style sweet spot vs mainline JAL. Not the same as Jetstar Japan (domestic LCC)."
							/>
							<AirlineCard
								name="Jetstar Japan"
								href="https://www.jetstar.com/jp/en"
								note="Qantas-group domestic LCC (HND/NRT ↔ Osaka, Sapporo, Okinawa…). Useful after you land on a long-haul ticket — book bags early online. Links with international Jetstar Asia in some markets; Europe travellers usually connect via Scoot/ZIPAIR/legacy instead."
							/>
						</ul>
					</Section>
					<Section title="Hop to China, Hong Kong & Taiwan (from Japan)">
						<p>
							A Japan trip pairs well with a few days in Hong Kong, Taipei, or
							mainland hubs — <b>short hops on regional LCCs</b> are often far
							cheaper than flying those legs from Europe on the same ticket.
							Shop from Tokyo (NRT/HND), Osaka (KIX), or Nagoya when routes
							exist.
						</p>
						<p className="rounded border border-amber-900/40 bg-amber-950/25 p-3 text-xs text-amber-100/90">
							<b>Visas are separate:</b> Hong Kong SAR and Taiwan usually have
							tourist rules distinct from mainland China. Most EU/Austrian
							passports need a <b>China (PRC) visa</b> in advance for
							Beijing/Shanghai — plan embassy time in Vienna, not at Narita.
						</p>
						<ul className="grid gap-3 sm:grid-cols-2">
							<AirlineCard
								name="Peach Aviation"
								href="https://www.flypeach.com/en"
								note="Japanese LCC from KIX/NRT and others — frequent sales to Taipei, Hong Kong, Shanghai, Seoul. Classic ‘base in Osaka + long weekend in HK’ move. Bags and seats extra; check which Tokyo airport each route uses."
							/>
							<AirlineCard
								name="Spring Airlines Japan"
								href="https://www.springairlines.com/en/"
								note="Budget links between Japan and China/Taiwan on some dates. Fares can undercut legacy carriers sharply; product is no-frills and schedules change — verify visa + airport (PVG/PEK/HKG) before booking."
							/>
							<AirlineCard
								name="HK Express"
								href="https://www.hkexpress.com/en"
								note="Hong Kong home LCC — useful for HK ↔ Japan legs when you are already in the SAR or open-jaw into HKG and out of Tokyo. Not a mainland carrier; still counts as ‘hop from Japan’ in many itineraries."
							/>
							<AirlineCard
								name="Scoot — multi-city itineraries"
								href="https://www.flyscoot.com/en/plan/book-a-flight"
								note="On their booking flow, choose multi-city: e.g. Vienna→Tokyo, later Tokyo→Singapore→Hong Kong, or Tokyo→SIN plus SIN→mainland Asia on Scoot’s network. Often beats stitching separate full-service tickets for side trips — still add flex bundles if typhoon season. A SIN layover can be a bonus day (Changi)."
							/>
						</ul>
						<p className="text-xs text-zinc-500">
							Also compare ANA/JAL promo fares on Asia routes — sometimes close
							to LCC when booked early. Skyscanner/Google Flights “multi-city”
							helps sanity-check Scoot vs Peach + separate returns.
						</p>
					</Section>
					<Section title="Tokyo airports (names, not just codes)">
						<div className="space-y-4">
							<div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
								<p className="font-medium text-zinc-100">
									Haneda —{" "}
									<span className="font-normal text-zinc-300">
										Tokyo International Airport (羽田)
									</span>{" "}
									<code className="text-violet-300">HND</code>
								</p>
								<p className="mt-2 text-xs text-zinc-400">
									Sits on Tokyo Bay, minutes from the city. Most domestic
									flights and many international ones; great if you hate long
									airport transfers.
								</p>
								<p className="mt-2 font-medium text-zinc-200">
									City center → Haneda (and reverse)
								</p>
								<ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
									<li>
										<b>Tokyo Monorail</b> from{" "}
										<ExtLink href="https://www.tokyo-monorail.co.jp/english/">
											Hamamatsuchō
										</ExtLink>{" "}
										(JR Yamanote / Keihin-Tōhoku) to Terminal 3 — about 17
										minutes. Pay with Suica/Pasmo or a monorail ticket. The ride
										is an underrated welcome: elevated tracks over the bay,
										ships, and runway views — part theme-park, part commute.
										Worth doing once even if a taxi is faster.
									</li>
									<li>
										<b>Keikyu Line</b> from Shinagawa (and Yokohama side) —
										often handy if your hotel is south/west Tokyo.
									</li>
									<li>
										<b>Taxi</b> — ¥6,000–10,000+ to central wards; fine with jet
										lag and luggage, painful on a budget.
									</li>
								</ul>
							</div>
							<div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
								<p className="font-medium text-zinc-100">
									Narita —{" "}
									<span className="font-normal text-zinc-300">
										Narita International Airport (成田)
									</span>{" "}
									<code className="text-violet-300">NRT</code>
								</p>
								<p className="mt-2 text-xs text-zinc-400">
									East of Tokyo in Chiba — the classic long-haul gateway. Budget
									carriers and many intercontinental flights land here; plan
									60–90 minutes to central Tokyo by train.
								</p>
								<p className="mt-2 font-medium text-zinc-200">
									Narita → city center
								</p>
								<ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
									<li>
										<b>N&apos;EX (Narita Express)</b> —{" "}
										<ExtLink href="https://www.jreast.co.jp/multi/en/nex/">
											JR East reserved train
										</ExtLink>{" "}
										to Tokyo Station (~55 min), Shinjuku, Shibuya, Yokohama, and
										other JR hubs. Comfortable luggage racks; buy at airport JR
										desk or ticket machines. Some Japan Rail Pass products
										include N&apos;EX segments — check your pass rules before
										you ride.
									</li>
									<li>
										<b>Keisei Skyliner</b> — fast to Ueno / Nippori (~40 min);
										good if your base is north/east Tokyo and you want a lower
										fare than N&apos;EX.
									</li>
									<li>
										<b>Airport Limousine Bus</b> — direct to major hotels and
										stations; slow in traffic but door-ish if you are buried in
										suitcases.
									</li>
									<li>
										<b>Regular Keisei / JR local</b> — cheapest, longest; for
										heroes with time and small bags.
									</li>
								</ul>
								<p className="mt-2 text-xs text-zinc-500">
									Returning to Narita: allow extra time — trains are reliable
									but N&apos;EX and Skyliner seats can sell out in peak season;
									buy a return slot early or take an earlier train than you
									think you need.
								</p>
							</div>
							<p className="text-xs text-zinc-400">
								<b>Osaka region:</b> Kansai International Airport (関西国際空港){" "}
								<code className="text-violet-300">KIX</code> on an artificial
								island — Haruka express to Osaka/Kyoto; not the same beast as
								Tokyo but equally worth reading up before landing.
							</p>
						</div>
					</Section>
					<Section title="Surprises on arrival (first-time visitors)">
						<p className="rounded-lg border border-violet-900/40 bg-violet-950/20 p-4 italic text-zinc-300">
							You cleared immigration, found the train, and feel very worldly.
							Then you open a restroom door and face a control panel with more
							icons than the International Space Station.
						</p>
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>The hi-tech toilet</b> (ウォシュレット): heated seat, bidet
								with adjustable pressure, dryer, sometimes a “sound” button that
								plays fake flushing for modesty. None of this is mandatory —
								look for 止 or a plain flush lever on the side if you want
								old-school.
							</li>
							<li>
								<b>Do not panic</b> when the lid moves or water runs before you
								sit — motion sensors are enthusiastic, not sentient.
							</li>
							<li>
								<b>Photography</b>: please no. The airport ones are impressive;
								so is basic human dignity.
							</li>
							<li>
								<b>Bonus culture shocks</b> (non-bathroom): IC cards for
								everything, cash still king in some izakaya, trash cans are rare
								— carry a small bag, and the quiet train rule is real.
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							Consider it Japan’s way of saying welcome: we take comfort
							seriously, and we will not explain the sixteen buttons in English.
						</p>
					</Section>
				</div>
			)}

			{tab === "trains" && (
				<div data-testid="travel-panel-trains">
					<Section title="Shinkansen (新幹線) — what it is">
						<p>
							Japan’s high-speed rail network: separate tracks, platform safety
							lines, trains that feel like aircraft on rails. Lines you will
							hear about: <b>Tokaido</b> (Tokyo–Shin-Osaka, via Kyoto),
							<b> Sanyo</b> (Osaka–Hakata), <b>Tohoku</b> (Tokyo–Sendai–Aomori),{" "}
							<b> Hokuriku</b> (Tokyo–Kanazawa), <b>Kyushu</b>, <b>Hokkaido</b>.
						</p>
						<p>
							Buy reserved seats (指定席) for peace of mind in peak season;
							unreserved (自由席) is cheaper and fine off-peak if you board at
							the start station. Luggage rules tightened on some trains — check
							JR for oversized bags.
						</p>
					</Section>
					<Section title="Train names on Tokaido (Tokyo ↔ Kyoto/Osaka)">
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<b>Nozomi</b> — fastest, fewest stops. Often <b>not</b> on the
								classic nationwide Japan Rail Pass (pay extra or use Hikari).
							</li>
							<li>
								<b>Hikari</b> — still fast; the usual JR Pass sweet spot on this
								corridor.
							</li>
							<li>
								<b>Kodama</b> — stops everywhere; slower, fine if you are not in
								a hurry.
							</li>
						</ul>
					</Section>
					<Section title="Tourist-only rail passes (often MUCH cheaper than singles)">
						<p className="rounded border border-emerald-900/40 bg-emerald-950/20 p-3 text-emerald-100/90">
							These passes are for <b>short-term foreign tourists</b> on tourist
							status. A Tokyo → Kyoto → Osaka → Tokyo loop on individual
							Shinkansen tickets can cost more than a whole-week pass — but a
							Tokyo-only trip with one side trip may <b>not</b> break even.
							Always spreadsheet your legs.
						</p>
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Japan Rail Pass (national)</b> — unlimited JR Shinkansen
								(with Nozomi restrictions on standard pass), limited expresses,
								local JR, some buses/ferries. 7 / 14 / 21 days. Must usually be{" "}
								<b>purchased outside Japan</b> as an exchange voucher then
								activated at a JR office — rules and prices change; see{" "}
								<ExtLink href="https://www.japanrailpass.net/en/">
									official JR Pass site
								</ExtLink>
								. Huge price rises in recent years: only buy if your route
								clearly needs it.
							</li>
							<li>
								<b>Regional tourist passes</b> — better when you stay in one
								area:{" "}
								<ExtLink href="https://www.jreast.co.jp/multi/en/pass/">
									JR East passes
								</ExtLink>{" "}
								(Tokyo wide, Tohoku, Nagano/Niigata),{" "}
								<ExtLink href="https://www.westjr.co.jp/global/en/ticket/pass/">
									JR West Kansai / Sanyo / Hokuriku
								</ExtLink>
								, Kyushu, Hokkaido passes, etc. Often include non-JR lines in
								the region.
							</li>
							<li>
								<b>Hokuriku Arch Pass</b> — Tokyo ↔ Kanazawa ↔ Osaka corridor
								without backtracking through Tokyo core — good for
								Nikko/Kanazawa combos if dates align.
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							Passes do not replace seat reservations where required — reserve
							at JR ticket offices or machines. Passes generally do not cover
							the fastest Nozomi on the classic national pass; read the fine
							print for 2024+ “Nozomi option” add-ons if offered.
						</p>
					</Section>
					<Section title="When singles beat a pass">
						<p>
							One round trip Tokyo–Kyoto only, flying into Osaka and out of
							Tokyo, staying entirely inside Tokyo with a day trip to Kamakura —
							buy single tickets or a <b>one-day regional ticket</b> instead.
							Use Hyperdia successor sites /{" "}
							<ExtLink href="https://www.jrpass.com/reservation/jr-pass-calculator">
								pass calculators
							</ExtLink>{" "}
							as hints, not gospel.
						</p>
					</Section>
				</div>
			)}

			{tab === "buses" && (
				<div data-testid="travel-panel-buses">
					<Section title="Why buses (especially overnight)">
						<p>
							Highway coaches link cities when the Shinkansen is over budget or
							sold out. <b>Overnight buses</b> (夜行バス) save a hotel night:
							leave Tokyo late, arrive Kyoto/Osaka early — tight seats, but
							¥3,000–8,000 vs ¥13,000+ on the bullet train. Slower,
							weather-sensitive, less glamorous; perfectly valid Japan travel.
						</p>
					</Section>
					<Section title="Major operators & booking">
						<ul className="grid gap-3 sm:grid-cols-2">
							<AirlineCard
								name="Willer Express"
								href="https://willerexpress.com/en/"
								note="Wide network, tourist-friendly booking, seat types from bus to semi-lie-flat."
							/>
							<AirlineCard
								name="Kosoku Bus / Japan Bus Online"
								href="https://japanbusonline.com/en"
								note="Aggregator across companies; compare Tokyo–Osaka/Kyoto night routes."
							/>
							<AirlineCard
								name="JR Bus (JR Highway Bus)"
								href="https://www.jrbusbustour.com/en/"
								note="JR-branded long-distance; some legs covered by select rail passes — check pass rules."
							/>
							<AirlineCard
								name="Highway Bus Japan (JNTO list)"
								href="https://www.japan.travel/en/plan/getting-around/bus/"
								note="Overview of regional operators and airport shuttle buses."
							/>
						</ul>
					</Section>
					<Section title="Practical tips">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								Book ahead in Golden Week, Obon, and New Year — night buses sell
								out.
							</li>
							<li>
								Bring a neck pillow, layers (AC is cold), and expect highway
								rest stops every few hours.
							</li>
							<li>
								Luggage: one large bag + small pack; overhead space is not
								airline generous.
							</li>
							<li>
								Combine with rail: e.g. bus to a pass boundary, Shinkansen
								inside a regional pass window.
							</li>
						</ul>
					</Section>
				</div>
			)}

			{tab === "places" && (
				<div data-testid="travel-panel-places">
					<Section title="Iconic stops (what they actually are)">
						<ul className="grid gap-3 sm:grid-cols-2">
							<PlaceCard
								name="Nikko (日光)"
								what="UNESCO shrine mountains north of Tokyo. Memorial shrine of Tokugawa Ieyasu (first shogun) at Nikko Toshogu — gold, lacquer, famous carvings."
								trip="Day or overnight from Tokyo. Open the Nikko tab for Toshogu, trains, and Lake Chuzenji."
							/>
							<PlaceCard
								name="Nara (奈良) — the deer"
								what="Japan’s first permanent capital (8th century). Todaiji holds a giant bronze Buddha; Nara Park’s semi-wild deer bow for shika senbei crackers (and will mug you politely)."
								trip="Easy from Kyoto/Osaka (~45–60 min). Half day minimum."
							/>
							<PlaceCard
								name="Itsukushima / Miyajima (厳島) — torii in the sea"
								what="Red giant torii gate standing in the Seto Inland Sea at high tide; Itsukushima Shrine floats on pilings. Japan’s postcard view near Hiroshima."
								trip="Ferry from Miyajimaguchi; tide times matter for ‘floating’ photos."
							/>
							<PlaceCard
								name="Himeji — White Heron Castle (姫路城)"
								what="Himeji-jo: white plaster and curved roofs like a heron taking flight — Japan’s finest surviving original feudal castle (not a concrete rebuild)."
								trip="Shinkansen stop between Osaka and Okayama; allow half a day inside the keep."
							/>
							<PlaceCard
								name="Kyoto (京都)"
								what="Former imperial capital: thousands of temples, geiko district (Gion), Fushimi Inari’s orange torii tunnels (best at nightfall), bamboo grove in Arashiyama."
								trip="Packed year-round; spring/autumn crush. Stay multiple nights if possible."
							/>
							<PlaceCard
								name="Hakone (箱根)"
								what="Onsen hills with Fuji views (weather lottery), volcanic valley (Owakudani), lake cruise, ropeways — classic Tokyo side trip."
								trip="Hakone Freepass bundles transport; check Fuji visibility before you go."
							/>
							<PlaceCard
								name="Kamakura (鎌倉)"
								what="Coastal samurai capital: Great Buddha (Kotoku-in), shrines, beaches — closer than Nikko for a Tokyo day trip."
								trip="JR Yokosuka Line or Enoden scenic tram."
							/>
							<PlaceCard
								name="Hiroshima & Miyajima"
								what="Peace Memorial Park and Museum (essential history); combine with Miyajima island for contrast of sorrow and beauty."
								trip="Shinkansen from Osaka/Kyoto; at least one night recommended."
							/>
						</ul>
					</Section>
					<Section title="City & region guides">
						<p>
							Deep dives:{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("tokyo")}
							>
								Tokyo
							</button>
							,{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("kansai")}
							>
								Kyoto & Osaka
							</button>
							,{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("nikko")}
							>
								Nikko
							</button>
							.
						</p>
					</Section>
					<Section title="More in Know">
						<p>
							Culture deep dives live under{" "}
							<Link to="/know" className="text-violet-400 hover:underline">
								Know
							</Link>{" "}
							(history, cuisine, geography…). This tab is the “what should I put
							on the map?” layer.
						</p>
					</Section>
				</div>
			)}

			{tab === "tokyo" && (
				<div data-testid="travel-panel-tokyo">
					<Section title="Tokyo (東京) — first-time base camp">
						<p>
							Mega-region of ~14 million people in the core wards, ~37M in
							Greater Tokyo — yet it runs on trains that mostly arrive on time.
							You will not “see all of Tokyo”; pick <b>2–3 hubs</b> plus one day
							trip.
						</p>
					</Section>
					<Section title="Tokyo landmarks (photos)">
						<p className="text-xs text-zinc-500">
							Skytree, scramble, Senso-ji, and Shinjuku&apos;s alley grills —
							anchors for a first visit.
						</p>
						<TokyoPhotoGallery />
					</Section>
					<Section title="Arriving">
						<p>
							<b>Haneda</b> (Tokyo International, 羽田) is inside the city —
							monorail from Hamamatsuchō or Keikyu from Shinagawa. <b>Narita</b>{" "}
							(成田) is farther; use N&apos;EX or Skyliner (see{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("flights")}
							>
								Flights tab
							</button>
							). Buy a <b>Suica/Pasmo</b> IC card at the airport and tap
							everywhere.
						</p>
					</Section>
					<Section title="Neighborhoods worth your time">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Shinjuku</b> — skyscrapers, Kabukicho neon, Tokyo
								Metropolitan Government free observatories, gateway to west
								Japan trains.
							</li>
							<li>
								<b>Shibuya</b> — scramble crossing, youth fashion, easy Yamanote
								hub.
							</li>
							<li>
								<b>Asakusa</b> — Senso-ji temple and old-town street food vibe.
							</li>
							<li>
								<b>Ueno</b> — museums, park, cheaper hotels, Skyliner/N&apos;EX
								friend if you use Narita.
							</li>
							<li>
								<b>Akihabara</b> — electronics, anime/games culture (otaku
								ground zero).
							</li>
							<li>
								<b>Odaiba</b> — bay views, teamLab-style digital art, Rainbow
								Bridge photos.
							</li>
						</ul>
					</Section>
					<Section title="Getting around">
						<p>
							The <b>Yamanote Line</b> loop ties most tourist hubs. Google Maps
							works well for train routing; last trains are ~midnight — miss one
							and it is taxi or wait. Taxis are clean but expensive; subway
							beats car every time.
						</p>
					</Section>
					<Section title="Day trips from Tokyo">
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<b>Kamakura</b> — Great Buddha, Enoden coastal tram (~1 hr).
							</li>
							<li>
								<b>Nikko</b> — UNESCO shrine district and{" "}
								<b>Toshogu</b>, memorial to Tokugawa Ieyasu (first shogun): gold,
								carved gates, cedar approach (see{" "}
								<button
									type="button"
									className="text-violet-400 underline"
									onClick={() => selectTab("nikko")}
								>
									Nikko tab
								</button>
								). JR or Tobu from Tokyo; overnight unlocks Lake Chuzenji.
							</li>
							<li>
								<b>Hakone</b> — onsen, ropeway, Fuji views if weather
								cooperates.
							</li>
						</ul>
					</Section>
					<Section title="When to visit">
						<p>
							Spring (sakura) and autumn (maple) are peak beauty and crowds.{" "}
							<b>Avoid July–August</b> unless you accept humid heat — see{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("hazards")}
							>
								Hazards
							</button>
							.
						</p>
					</Section>
					<Section title="Know articles">
						<p>
							<Link
								to="/know?page=dailylife"
								className="text-violet-400 hover:underline"
							>
								Daily life
							</Link>
							,{" "}
							<Link
								to="/know?page=kombini"
								className="text-violet-400 hover:underline"
							>
								Kombini
							</Link>
							,{" "}
							<Link
								to="/know?page=modern"
								className="text-violet-400 hover:underline"
							>
								Modern Japan
							</Link>
							.
						</p>
					</Section>
				</div>
			)}

			{tab === "kansai" && (
				<div data-testid="travel-panel-kansai">
					<Section title="Kyoto & Osaka (関西) — temple gravity vs kitchen energy">
						<p>
							<b>Kyoto</b> (京都) was the imperial capital for a millennium —
							temples, gardens, geiko culture, strict etiquette. <b>Osaka</b>{" "}
							(大阪) is the merchant city: louder, funnier, obsessed with food.
							Most visitors do
							<b> both</b> with a base in one and day trips to the other (~30–60
							min by train).
						</p>
					</Section>
					<Section title="Kyoto landmarks (photos)">
						<p className="text-xs text-zinc-500">
							Main temples and the bamboo grove — spread across days, not one
							marathon.
						</p>
						<KyotoPhotoGallery />
					</Section>
					<Section title="Arriving in Kansai">
						<p>
							<b>Kansai International Airport (関西国際空港, KIX)</b> sits on an
							artificial island south of Osaka. <b>Haruka</b> limited express to
							Shin-Osaka or Kyoto Station; buses to Osaka hotels. If you land in
							Tokyo first, Shinkansen Tokaido line reaches Kyoto in ~2h15
							(Hikari) or Osaka in ~2h30.
						</p>
					</Section>
					<Section title="Kyoto — what to prioritize">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Fushimi Inari</b> — torii tunnels up the mountain. Skip the
								“must arrive at dawn” crowd advice: at <b>nightfall</b> the gates
								glow, the forest goes quiet, and the mood is indescribably
								romantic (bring a light for steps, check closing times on busy
								holidays).
							</li>
							<li>
								<b>Kiyomizu-dera</b> — hillside temple over the old Higashiyama
								lanes.
							</li>
							<li>
								<b>Arashiyama</b> — bamboo grove (crowded midday), river, monkey
								park optional.
							</li>
							<li>
								<b>Gion</b> — geiko district; quiet respect, no paparazzi on
								people.
							</li>
							<li>
								<b>Nijo Castle, Ryoan-ji, Golden Pavilion</b> — classic circuit;
								spread across days.
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							Kyoto accommodation fills months ahead for cherry season and
							autumn — book early or stay in Osaka and commute.
						</p>
					</Section>
					<Section title="Osaka — eat and laugh">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Dotonbori</b> — neon, takoyaki, okonomiyaki, crab sign
								landmarks.
							</li>
							<li>
								<b>Shinsekai</b> — retro tower vibe, kushikatsu (no double-dip
								sauce rule).
							</li>
							<li>
								<b>Osaka Castle</b> — museum inside reconstructed keep; park
								runs are popular.
							</li>
							<li>
								<b>Universal Studios Japan</b> — block a day if theme parks
								matter to you.
							</li>
						</ul>
					</Section>
					<Section title="Nara day trip (both bases)">
						<p>
							<b>Nara</b> — Todaiji giant Buddha and deer park — ~45 min from
							Kyoto or Osaka. Half day minimum; combine with early Kyoto
							checkout or Osaka dinner return.
						</p>
					</Section>
					<Section title="Where to sleep">
						<p>
							<b>Stay in Kyoto</b> if temples and dawn walks are the point.{" "}
							<b>Stay in Osaka</b> if you want cheaper hotels, nightlife, and
							food — still easy to reach Kyoto. Avoid ping-ponging hotels
							nightly; Shinkansen pass math lives on the{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("trains")}
							>
								Shinkansen tab
							</button>
							.
						</p>
					</Section>
					<Section title="Know articles">
						<p>
							<Link
								to="/know?page=cuisine"
								className="text-violet-400 hover:underline"
							>
								Cuisine
							</Link>
							,{" "}
							<Link
								to="/know?page=history"
								className="text-violet-400 hover:underline"
							>
								History
							</Link>
							,{" "}
							<Link
								to="/know?page=travel"
								className="text-violet-400 hover:underline"
							>
								Travel guide
							</Link>
							.
						</p>
					</Section>
				</div>
			)}

			{tab === "nikko" && (
				<div data-testid="travel-panel-nikko">
					<Section title="Nikko (日光) — mountains and the first Tokugawa shogun">
						<p>
							<b>Nikko</b> sits in the mountains of Tochigi Prefecture, roughly
							2 hours north of Tokyo. The town is famous for a cluster of
							shrines and temples registered as a{" "}
							<b>UNESCO World Heritage</b> site — not one building but a sacred
							landscape of cedars, rivers, and lacquer. Most visitors come for{" "}
							<b>Nikko Toshogu (日光東照宮)</b>, the memorial shrine of{" "}
							<b>Tokugawa Ieyasu</b>, founder of the Edo shogunate.
						</p>
						<NikkoPhotoGallery />
					</Section>
					<Section title="Tokugawa Ieyasu and why the shrine looks like this">
						<p>
							<b>Ieyasu</b> (1543–1616) survived the Warring States period,
							won the Battle of Sekigahara (1600), and became the first{" "}
							<b>Tokugawa shogun</b> in 1603, ruling from Edo (today&apos;s
							Tokyo). His line held power until 1868. In his will he asked to
							be enshrined in Nikko as a <b>kami</b> (Shinto deity). His
							grandson <b>Tokugawa Iemitsu</b> rebuilt Toshogu in the 1630s
							into the lavish complex you see now — gold leaf, vivid color, and
							countless carvings. The message was political: no regional{" "}
							<b>daimyo</b> should outshine the Tokugawa, even in death.
						</p>
						<p className="text-xs text-zinc-500">
							Today Toshogu is active worship (Shinto-Buddhist syncretism), not
							a museum. Dress and behavior accordingly.
						</p>
					</Section>
					<Section title="What to see on the ground">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Shinkyo bridge (神橋)</b> — vermilion sacred arch over the
								Daiya River; symbolic gateway to the whole sanctuary.
							</li>
							<li>
								<b>Rinno-ji (輪王寺)</b> and <b>Futarasan (二荒山神社)</b> —
								part of the World Heritage ensemble; often visited before
								Toshogu on the same walk.
							</li>
							<li>
								<b>Cedar avenue (杉並木)</b> — towering cryptomeria lining the
								approach; iconic even in rain or snow.
							</li>
							<li>
								<b>Yomeimon gate (陽明門)</b> — the “sunlight gate”; dense
								carving and gold on the upper tier — no two panels alike on the
								famous row.
							</li>
							<li>
								<b>Three wise monkeys</b> — see no evil, hear no evil, speak no
								evil on the sacred stable (Mizaru, Kikazaru, Iwazaru).
							</li>
							<li>
								<b>Nemuri-neko (sleeping cat)</b> — tiny carving above the gate
								to the tomb path; national craft icon.
							</li>
							<li>
								<b>Okusha (奥社)</b> — Ieyasu&apos;s mausoleum path uphill
								through cedars; bronze urn holds the shogun. The quietest,
								most restrained part of the site.
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							Admission is split (Toshogu inner precinct vs other halls). Budget
							at least a half day for the shrine district alone.
						</p>
					</Section>
					<Section title="Getting there from Tokyo">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Tobu Railway</b> — frequent service from Asakusa or
								Skytree area to Tobu-Nikko; World Heritage passes sometimes
								bundle train plus local buses (check current Tobu offers before
								you buy).
							</li>
							<li>
								<b>JR</b> — Tohoku Shinkansen to Utsunomiya, then JR Nikko Line
								to JR Nikko; useful if you already hold a JR Pass segment.
							</li>
							<li>
								<b>Day trip</b> — doable if you leave early and accept a tight
								schedule. <b>Overnight</b> is better if you add the lakes and
								falls below.
							</li>
						</ul>
						<p>
							Base in{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("tokyo")}
							>
								Tokyo
							</button>{" "}
							and treat Nikko as the classic counterweight to neon and density.
						</p>
					</Section>
					<Section title="If you stay overnight — lakes and onsen">
						<p>
							Above the town, <b>Lake Chuzenji (中禅寺湖)</b> and{" "}
							<b>Kegon Falls (華厳の滝)</b> sit on the old Nikko mountain road
							(Irohazaka switchbacks). Autumn foliage here is spectacular;
							summer is cooler than Tokyo. <b>Yumoto Onsen</b> offers hot-spring
							stays at the lake&apos;s north end. Winter can be snowy and
							beautiful but check road and bus schedules.
						</p>
					</Section>
					<Section title="When to go">
						<p>
							Autumn (maple) and spring cherry at lower elevations draw crowds.
							Winter shrine visits in snow are memorable but cold. Summer in
							Nikko is milder than Tokyo but still busy on weekends — see{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("hazards")}
							>
								Hazards
							</button>{" "}
							for typhoon season buffer days if you travel August–October.
						</p>
					</Section>
					<Section title="Know articles">
						<p>
							<Link
								to="/know?page=history"
								className="text-violet-400 hover:underline"
							>
								History
							</Link>
							,{" "}
							<Link
								to="/know?page=travel"
								className="text-violet-400 hover:underline"
							>
								Travel guide
							</Link>
							,{" "}
							<Link
								to="/know?page=geography"
								className="text-violet-400 hover:underline"
							>
								Geography
							</Link>
							.
						</p>
					</Section>
				</div>
			)}

			{tab === "hazards" && (
				<div data-testid="travel-panel-hazards">
					<Section title="Ring of Fire — earthquakes & volcanoes">
						<p>
							Japan sits on the Pacific Ring of Fire. Earthquakes are routine;
							big ones are rare but real. Know your hotel evacuation route,
							follow J-Alert on your phone, and use{" "}
							<ExtLink href="https://www.jnto.go.jp/emerg/eng/index.html">
								JNTO emergency info
							</ExtLink>
							. Aftershocks follow major events — trains stop until tracks are
							inspected.
						</p>
						<p>
							Active volcanoes (Sakurajima, Asama, Fuji when open) can affect
							air travel and local access — check Japan Meteorological Agency
							warnings before hiking.
						</p>
					</Section>
					<Section title="Typhoons (台風)">
						<p>
							Pacific typhoon season peaks roughly <b>August–October</b>. Expect
							flight cancellations, Shinkansen suspensions, and flooded streets.
							Build buffer days; avoid tight “fly home next morning” plans in
							peak season.
						</p>
					</Section>
					<Section title="Tokyo summer heat (humid hell)">
						<p className="rounded border border-rose-900/50 bg-rose-950/25 p-3 text-rose-100/90">
							<b>July and August in Tokyo</b> are brutal: 30°C+ with soaking
							humidity, heat-index extremes, and concrete-island nights that
							never cool down. Summer festivals and fireworks look magical in
							photos — they are not worth heat exhaustion, dehydration, or ER
							visits if you are not acclimated. Visit in spring or autumn
							instead; if you must come in summer, schedule slow mornings, AC
							museums, and honest hydration.
						</p>
					</Section>
					<Section title="Wildlife — bears & hornets">
						<p>
							Urban Japan feels tame; mountains and countryside are not a zoo
							without fences. Respect signs and local guidance.
						</p>
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Asian black bears (ツキノワグマ)</b> — Hokkaido, Tohoku, and
								mountain trails elsewhere. Encounters rise when berries and nuts
								ripen (spring–autumn). Carry a bell on remote hikes, do not
								leave food or trash at campsites, and back away slowly if you
								see one — never run. Many trails post closure notices when bear
								activity is high.
							</li>
							<li>
								<b>Giant hornets (スズメバチ)</b> — the “yak-killer” type gets
								headlines, but any hornet nest near a trail is serious. Peak
								aggression in late summer and autumn when nests are largest.
								Avoid dark clothing and strong perfume in the woods; if stung
								multiple times or feel unwell, call <b>119</b> — allergic shock
								happens fast.
							</li>
							<li>
								<b>Smaller nuisances</b> — mosquitoes in summer (see health
								section), sea urchins and jellyfish at some beaches, wild boar
								in rural fringes. Read trailhead signs even if you only read
								English — pictograms are universal.
							</li>
						</ul>
					</Section>
					<Section title="Health risks, vaccines & clinics">
						<p className="rounded border border-amber-900/40 bg-amber-950/25 p-3 text-amber-100/90">
							Not medical advice. See a travel clinic or GP{" "}
							<b>6–8 weeks before</b> departure with your itinerary (cities only
							vs rural hiking, season, length of stay).
						</p>
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Routine boosters</b> — measles-mumps-rubella, dT/IPV
								(tetanus), COVID/influenza as your age and health require.
								Tetanus matters if you hike or get scrapes outdoors.
							</li>
							<li>
								<b>Japanese encephalitis (JE)</b> — mosquito-borne; risk is{" "}
								<b>low for typical short city tourism</b> but rises with long
								stays or repeated time in rural farming areas, especially in
								warm months. Vaccination is a multi-dose series — plan ahead.
								Details:{" "}
								<ExtLink href="https://www.who.int/news-room/fact-sheets/detail/japanese-encephalitis">
									WHO fact sheet
								</ExtLink>
								,{" "}
								<ExtLink href="https://wwwnc.cdc.gov/travel/diseases/japanese-encephalitis">
									CDC travel health
								</ExtLink>
								.
							</li>
							<li>
								<b>Hepatitis A / B, typhoid</b> — often discussed for longer
								trips or adventurous food; city short trips may skip per clinic
								advice.
							</li>
							<li>
								<b>Rabies</b> — Japan is not rabies-free in wildlife (bats, rare
								terrestrial cases historically controlled). Post-exposure
								treatment exists but prevention beats ER drama; avoid touching
								wild animals.
							</li>
							<li>
								<b>While there</b> — heat illness (see summer above),
								dehydration, food safety is generally excellent; fish allergy
								and shellfish toxins are the gourmet risks. Pharmacies (薬局)
								handle many OTC needs; for English help try larger cities or{" "}
								<ExtLink href="https://www.jnto.go.jp/emerg/eng/index.html">
									JNTO medical guidance
								</ExtLink>
								.
							</li>
						</ul>
						<p className="text-xs text-zinc-500">
							EU/Austrian travellers: check national travel-health portals (e.g.
							AGES / tropical institutes) for JE and tick-borne advice if you
							also visit rural Honshu or Hokkaido forests.
						</p>
					</Section>
					<Section title="What Japan does unusually well (safety & cleanliness)">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Street crime</b> is very low by global standards — lost
								wallets often return with cash intact. Still use normal sense
								(bike theft, drink spiking anywhere exists).
							</li>
							<li>
								<b>Graffiti and tag vandalism</b> are rare; public space stays
								clean without looking militarized. Trains, stations, and alleys
								stay readable — a relief if you hate scrawled walls elsewhere.
							</li>
							<li>
								<b>Politeness ≠ weakness</b> — follow rules (queues, trash
								take-home, quiet phones on trains) and you will be treated well.
							</li>
						</ul>
					</Section>
					<Section title="Insurance tie-in">
						<p>
							Natural disasters, hornet ER visits, and evacuation flights are
							why{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("insurance")}
							>
								travel insurance
							</button>{" "}
							and flexible tickets matter — not paranoia, just arithmetic.
							Confirm your policy covers adventure hiking and medical evacuation
							if you leave the cities.
						</p>
					</Section>
				</div>
			)}

			{tab === "housing" && (
				<div data-testid="travel-panel-housing">
					<Section title="Sharehouses & monthly stays">
						<p>
							For stays of a few weeks to months, sharehouses beat hotels on
							price and include furnished rooms plus common areas. Read contract
							length, deposit, and guest rules.
						</p>
						<ul className="grid gap-3 sm:grid-cols-2">
							<AirlineCard
								name="Sakura House"
								href="https://www.sakura-house.com/"
								note="Long-running Tokyo/Osaka sharehouses; English support."
							/>
							<AirlineCard
								name="Borderless House"
								href="https://www.borderless-house.com/"
								note="International mix; multiple cities."
							/>
							<AirlineCard
								name="Oakhouse"
								href="https://www.oakhouse.jp/"
								note="Sharehouses and apartments; Japanese/English site."
							/>
							<AirlineCard
								name="Leopalace21"
								href="https://www.leopalace21.com/"
								note="Furnished apartments (not always shared); common for students."
							/>
							<AirlineCard
								name="GaijinPot Apartments"
								href="https://apartments.gaijinpot.com/"
								note="Listings aggregator; filter sharehouse / monthly."
							/>
							<AirlineCard
								name="Airbnb / Booking (monthly)"
								href="https://www.airbnb.com/"
								note="Short trips; check local short-term rental rules in your ward."
							/>
						</ul>
					</Section>
					<Section title="Short tourist stays">
						<p>
							Business hotels (APA, Toyoko Inn), hostels, and capsule hotels for
							1–2 weeks. The vendored{" "}
							<button
								type="button"
								className="text-violet-400 underline"
								onClick={() => selectTab("guide")}
							>
								Budget travel guide
							</button>{" "}
							covers guesthouses and combini budgeting.
						</p>
					</Section>
				</div>
			)}

			{tab === "legal" && (
				<div data-testid="travel-panel-legal">
					<Section title="Disclaimer">
						<p className="rounded border border-amber-900/50 bg-amber-950/30 p-3 text-amber-100/90">
							Immigration rules depend on your passport and purpose. Confirm
							with <ExtLink href="https://www.mofa.go.jp/">Japan MOFA</ExtLink>{" "}
							and your embassy before travel. This app is not a law firm.
						</p>
					</Section>
					<Section title="Short tourist visits">
						<p>
							Many nationalities enter as <b>temporary visitor (短期滞在)</b>{" "}
							with no visa applied in advance — often up to <b>90 days</b> per
							entry for tourism (EU/US/AU/NZ etc.; length stamped at entry). You
							cannot work on this status. Side jobs and “remote work while
							tourist” are gray areas — treat paid work in Japan as requiring
							proper status.
						</p>
					</Section>
					<Section title="Longer or other purposes">
						<ul className="list-disc space-y-2 pl-5">
							<li>
								<b>Working holiday</b> — age/country limited; one-year visa with
								work allowed (quota per nationality).
							</li>
							<li>
								<b>Student</b> — language school or university; COE from school
								then visa at embassy.
							</li>
							<li>
								<b>Work</b> — employer sponsors Certificate of Eligibility (在留
								資格認定証明書) before visa application.
							</li>
							<li>
								<b>Spouse / permanent</b> — separate tracks with documentation.
							</li>
						</ul>
						<p>
							Overstay and working illegally have serious consequences (fines,
							deportation, re-entry bans).
						</p>
					</Section>
					<Section title="Police & criminal justice (context)">
						<p>
							Japan is safe and koban boxes are everywhere, but the justice system is
							not like Western TV court drama. Prosecutors only indict when they
							expect conviction; confessions historically dominated trials; the death
							penalty is hanging, still used for the worst murders, with long isolated
							waits on death row — and late exonerations after decades do happen.
						</p>
						<ul className="list-disc space-y-2 pl-5 text-sm">
							<li>
								<b>Koban (交番)</b> — neighborhood police box; bike patrols with the
								white <b>keibo (警棒)</b> baton.
							</li>
							<li>
								<b>110</b> police / <b>119</b> ambulance. Carry passport or residence
								card; ask for embassy if arrested.
							</li>
							<li>
								<b>Drugs & knives</b> — harsh; do not assume a warning for tourists.
							</li>
						</ul>
						<p>
							Full write-up:{" "}
							<Link
								to="/know?page=police-justice"
								className="text-violet-400 hover:underline"
								data-testid="travel-link-police-justice"
							>
								Know → Police &amp; justice
							</Link>
							. Not legal advice.
						</p>
					</Section>
					<Section title="Useful official links">
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<ExtLink href="https://www.mofa.go.jp/j_info/visit/visa/">
									MOFA visa information
								</ExtLink>
							</li>
							<li>
								<ExtLink href="https://www.isa.go.jp/en/applications/procedures/nyuukokukanri07_00001.html">
									Immigration Services Agency (status of residence)
								</ExtLink>
							</li>
						</ul>
					</Section>
				</div>
			)}

			{tab === "insurance" && (
				<div data-testid="travel-panel-insurance">
					<Section title="Travel insurance (tourists)">
						<p>
							Japan has excellent healthcare but it is{" "}
							<b>not free for visitors</b>. EU EHIC/GHIC does not cover Japan.
							Buy comprehensive travel medical insurance before departure —
							evacuation, hospitalization, trip cancel, and baggage as needed.
						</p>
						<p>
							Compare policies from your home insurers, credit-card included
							coverage (read exclusions), and specialists. Some visa categories
							now require proof of insurance — check MOFA for your case.
						</p>
					</Section>
					<Section title="If you live in Japan (mid/long stay)">
						<p>
							Residents enroll in{" "}
							<b>National Health Insurance (国民健康保険)</b> or employee
							insurance (社会保険). Enrollment is mandatory when you register
							address. Student and work visas usually require joining.
						</p>
					</Section>
					<Section title="Safety net info">
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<ExtLink href="https://www.jnto.go.jp/emerg/eng/index.html">
									JNTO safety / emergency (English)
								</ExtLink>
							</li>
							<li>
								<ExtLink href="https://www.japan.travel/en/plan/travel-guide-info/">
									Japan Travel official guide
								</ExtLink>
							</li>
						</ul>
					</Section>
				</div>
			)}

			{tab === "guide" && (
				<div data-testid="travel-panel-guide">
					<p className="mb-3 text-sm text-zinc-400">
						Vendored knowledge article: JR, regions, budget tips, etiquette.
						Interactive booking APIs are still roadmap.
					</p>
					<KnowledgeArticleView page="travel" testId="travel-iframe" />
				</div>
			)}
		</div>
	);
}
