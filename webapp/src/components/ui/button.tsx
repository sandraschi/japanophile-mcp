import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: "default" | "outline" | "ghost" | "secondary";
	size?: "default" | "sm" | "lg";
	asChild?: boolean;
};

export function Button({
	className,
	variant = "default",
	size = "default",
	asChild: _asChild,
	children,
	...rest
}: Props) {
	const base =
		variant === "outline"
			? "border border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
			: variant === "ghost"
				? "bg-transparent text-zinc-300 hover:bg-zinc-800"
				: variant === "secondary"
					? "border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
					: "bg-zinc-100 text-black hover:bg-white";
	const sizing =
		size === "sm"
			? "px-2 py-1 text-xs"
			: size === "lg"
				? "px-4 py-2.5 text-base"
				: "px-3 py-2 text-sm";
	return (
		<button
			type="button"
			className={cn(
				"rounded-md font-medium disabled:opacity-50",
				sizing,
				base,
				className,
			)}
			{...rest}
		>
			{children}
		</button>
	);
}
