type PageLoadingProps = {
	label?: string;
	variant?: "page" | "inline" | "row";
	testId?: string;
	className?: string;
};

function Spinner({ large }: { large?: boolean }) {
	return (
		<span
			className={`inline-block animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500 ${large ? "h-8 w-8" : "h-4 w-4"}`}
			aria-hidden
		/>
	);
}

export function PageLoading({
	label,
	variant = "page",
	testId = "page-loading",
	className = "",
}: PageLoadingProps) {
	if (variant === "page") {
		return (
			<div
				className={`flex min-h-[320px] flex-col items-center justify-center gap-3 p-12 ${className}`}
				data-testid={testId}
				role="status"
				aria-busy="true"
			>
				<Spinner large />
				{label ? <p className="text-sm text-zinc-400">{label}</p> : null}
			</div>
		);
	}

	if (variant === "row") {
		return (
			<div
				className={`flex items-center justify-center gap-2 p-12 ${className}`}
				data-testid={testId}
				role="status"
				aria-busy="true"
			>
				<Spinner large />
				{label ? <span className="text-sm text-zinc-400">{label}</span> : null}
			</div>
		);
	}

	return (
		<p
			className={`flex items-center gap-2 text-xs text-zinc-400 animate-pulse ${className}`}
			data-testid={testId}
			role="status"
			aria-busy="true"
		>
			<Spinner />
			{label ?? "Loading…"}
		</p>
	);
}
