import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getEntries } from "../src/lib/entries";

const outputDir = join(process.cwd(), "public", "badges");

function badgeSvg(dark: boolean): string {
  const left = dark ? "#f6f8fa" : "#24292f";
  const leftText = dark ? "#24292f" : "#ffffff";
  const right = dark ? "#238636" : "#1a7f37";
  const rightText = "#ffffff";
  const label = "Agent signup";
  const value = "Supported";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <clipPath id="r"><rect width="200" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="120" height="20" fill="${left}"/>
    <rect x="120" width="80" height="20" fill="${right}"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11">
    <text x="60" y="15" fill="${leftText}">${label}</text>
    <text x="160" y="15" fill="${rightText}">${value}</text>
  </g>
</svg>
`;
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const active = getEntries().filter((entry) => entry.status === "valid");

for (const entry of active) {
  writeFileSync(join(outputDir, `${entry.slug}.svg`), badgeSvg(false));
  writeFileSync(join(outputDir, `${entry.slug}-dark.svg`), badgeSvg(true));
}

console.log(
  `Generated ${active.length} badge${active.length === 1 ? "" : "s"}.`,
);
