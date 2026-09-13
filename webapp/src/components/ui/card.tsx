import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function Card({ className, children, ...rest }: Props) {
	return (
		<div
			className={cn(
				"rounded-lg border border-zinc-700 bg-zinc-900/80 p-4",
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
}
