/** In-app copy; canonical text is LICENSE and CONTRIBUTORS.md at repo root. */

export const PROJECT_LICENSE = "MIT";

export const LICENSE_SUMMARY =
	"japanophile-mcp is released under the MIT License. You may use, modify, and distribute the software with attribution and the same license notice.";

export const REPO_LICENSE_URL =
	"https://github.com/sandraschi/japanophile-mcp/blob/main/LICENSE";

export const REPO_CONTRIBUTORS_URL =
	"https://github.com/sandraschi/japanophile-mcp/blob/main/CONTRIBUTORS.md";

export const CONTRIBUTORS: Array<{
	name: string;
	role: string;
	href?: string;
}> = [
	{
		name: "sandraschi",
		role: "Maintainer — MCP tools, HTTP bridge, webapp, MCPB bundle",
		href: "https://github.com/sandraschi",
	},
];

export const VENDORED_CREDIT =
	"Learning games, JLPT/kanji seeds, and Know articles vendored from ai-games-collection (see docs/INHERITANCE.md).";
