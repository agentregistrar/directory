export const prerender = true;

export async function GET() {
  const site = String(
    import.meta.env.SITE ?? "https://agentregistrar.directory",
  ).replace(/\/$/, "");
  const noindex = import.meta.env.PUBLIC_NOINDEX === "true";

  const body = noindex
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
