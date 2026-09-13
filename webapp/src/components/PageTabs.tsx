export type PageTab = { id: string; label: string };

type Props = {
	tabs: PageTab[];
	active: string;
	onChange: (id: string) => void;
	testId?: string;
};

export function PageTabs({
	tabs,
	active,
	onChange,
	testId = "page-tabs",
}: Props) {
	return (
		<div
			className="mb-6 flex flex-wrap gap-2 border-b border-zinc-800 pb-3"
			data-testid={testId}
			role="tablist"
		>
			{tabs.map((t) => (
				<button
					key={t.id}
					type="button"
					role="tab"
					aria-selected={active === t.id}
					data-testid={`${testId}-${t.id}`}
					onClick={() => onChange(t.id)}
					className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						active === t.id
							? "bg-violet-600 text-white"
							: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
					}`}
				>
					{t.label}
				</button>
			))}
		</div>
	);
}
